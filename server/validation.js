import { labels } from '../product-fields.js';
import {
  HttpError
}
from './http.js';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function text(value, name, max, required = false) {
  if (typeof value !== 'string') throw new HttpError(400, `${name} must be text.`);
  const result = value.normalize('NFC').replace(/\r\n?/g, '\n').trim();
  if ((required && !result) || result.length > max || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)) throw new HttpError(400, `${name} is invalid. Use plain text, up to ${max} characters.`);
  return result;
}
function flag(value, name) {
  if (typeof value !== 'boolean') throw new HttpError(400, `${name} must be true or false.`);
  return Number(value);
}
export function integer(value, min, max, name) {
  if (!Number.isInteger(value) || value < min || value > max) throw new HttpError(400, `${name} must be a whole number from ${min} to ${max}.`);
  return value;
}
export function record(input, kind) {
  const image = input.image_id === null || input.image_id === '' ? null : input.image_id;
  if (image !== null && (typeof image !== 'string' || !UUID.test(image))) throw new HttpError(400, 'Choose a valid uploaded image.');
  const common = {
    description: text(input.description, 'Description', 5000),
    image_id: image,
    image_alt: text(input.image_alt, 'Image description', 250, !!image),
    published: flag(input.published, 'Published')
  };
  if (kind === 'products') {
    const price = input.price_cents === null ? null : integer(input.price_cents, 0, 100000000, 'Price in cents');
    if (!['', 'per sq. ft.', 'per item', 'per box'].includes(input.price_unit)) throw new HttpError(400, 'Invalid price unit.');
    const specifications = input.specifications ?? {};
    if (!specifications || Array.isArray(specifications) || typeof specifications !== 'object') throw new HttpError(400, 'Specifications must be an object.');
    const clean = {};
    for (const [key, value] of Object.entries(specifications)) {
      if (!Object.hasOwn(labels, key)) throw new HttpError(400, 'Unknown specification field.');
      const result = text(value, labels[key], 180);
      if (result) clean[key] = result;
    }
    return {
      brand: text(input.brand ?? '', 'Brand / company', 120),
      specifications: JSON.stringify(clean),
      ...common, name: text(input.name, 'Name', 120, true), category_id: text(input.category_id, 'Category', 80, true), price_cents: price, price_unit: input.price_unit, featured: flag(input.featured, 'Featured')
    };
  }
  if (!image) throw new HttpError(400, 'Upload an image for this gallery item.');
  return {
    ...common, title: text(input.title, 'Title', 120, true), sort_order: integer(input.sort_order, 0, 9999, 'Display order')
  };
}
export function imageType(bytes, claimed) {
  const starts = sequence => sequence.every((n, i) => bytes[i] === n);
  let actual;
  if (bytes.length > 24 && starts([137,80,78,71,13,10,26,10])) actual = 'image/png';
  if (bytes.length > 4 && starts([255,216,255]) && bytes.at(-2) === 255 && bytes.at(-1) === 217) actual = 'image/jpeg';
  if (bytes.length > 20 && new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP') actual = 'image/webp';
  if (!actual || actual !== claimed) throw new HttpError(415, 'Upload a valid JPEG, PNG or WebP image. SVG and other files are not allowed.');
  return actual;
}
