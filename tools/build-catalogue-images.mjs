// Match only reviewed manufacturer image URLs to existing product/colour identities.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = file => JSON.parse(readFileSync(new URL(file, root), 'utf8'));
const batch = read('catalogue-imports/2026-09-27.json');
const sources = read('catalogue-imports/image-sources-2026-09-27.json');
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const additions = [];
for (const source of sources) {
  const url = source.urls[0]?.replace(/:$/, '');
  if (!url || source.urls.length !== 1) throw new Error('Ambiguous image source.');
  const candidates = batch.products.filter(p => source.brand === 'richmond' ? p.brand.startsWith('Richmond') : p.key === source.brand);
  let code = source.code;
  let name = source.name;
  if (!code && !name) {
    if (source.brand === 'olympic-5') code = url.match(/MQLL-\d+/)?.[0];
    if (source.brand === 'daily-wire') code = url.match(/83144_(\d+)/)?.[1];
    if (source.brand === 'profusion-26') code = url.match(/-(\d{5})-main/)?.[1];
    if (source.brand === 'always-natural') code = url.match(/zz289_(\d{5})/)?.[1];
    if (source.brand === 'inspirational') code = url.match(/0214610(\d{3})/)?.[1];
    if (source.brand === 'open-air-417') name = url.match(/open-air-417_(.+)_va1/)?.[1];
  }
  const matches = candidates.flatMap(p => p.colours.filter(c => code ? c.code === code : c.name.toLowerCase() === name?.toLowerCase()).map(c => ({ p, c })));
  if (matches.length !== 1) throw new Error('Unmatched/ambiguous colour: ' + JSON.stringify(source));
  const { p, c } = matches[0];
  if (c.source_image_url) continue;
  additions.push({ key: p.key, code: c.code, name: c.name, url });
}
additions.push({ key: 'marmoleum-solid', code: '3761', name: 'Titan', url: 'https://forbo.azureedge.net/productimages/big/248244_3761.webp' });
if (new Set(additions.map(x => x.key + ':' + x.name)).size !== additions.length) throw new Error('Duplicate swatch.');
writeFileSync(new URL('catalogue-imports/reviewed-image-additions.json', root), JSON.stringify(additions, null, 2) + '\n');
const sql = ['-- Image-only updates. Preserve uploaded/existing images, names, order, visibility and other product edits.'];
for (const image of additions) {
  const bytes = createHash('sha256').update('fcc:catalogue:2026-09-27:' + image.key).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const h = bytes.toString('hex');
  const id = `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  const match = image.code ? `json_extract(value, '$.code') = ${quote(image.code)}` : `json_extract(value, '$.name') = ${quote(image.name)}`;
  const empty = `${match} AND coalesce(json_extract(value, '$.image_id'), '') = '' AND coalesce(json_extract(value, '$.source_image_url'), '') = ''`;
  sql.push(`UPDATE products SET colours = json_set(colours, '$[' || (SELECT key FROM json_each(products.colours) WHERE ${empty} LIMIT 1) || '].source_image_url', ${quote(image.url)}), version = version + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ${quote(id)} AND EXISTS (SELECT 1 FROM json_each(products.colours) WHERE ${empty});`);
}
writeFileSync(new URL('migrations/0009_catalogue_images.sql', root), sql.join('\n') + '\n');
console.log(`Prepared ${additions.length} additional swatches. No remote database writes.`);
