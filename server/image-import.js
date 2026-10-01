import { HttpError, boundedBody } from './http.js';
import { imageType } from './validation.js';

// Exact public manufacturer/CDN hosts. Never fetch arbitrary hosts or IP addresses.
const hosts = new Set([
  'canada.beaulieucanada.com', 'shawfloors.widen.net', 'torlys.com',
  's7d4.scene7.com', 's7d1.scene7.com', 'www.biyorkcanada.com', 'cdn.shopify.com',
  'www.msisurfaces.com', 'www.vifloor.com', 'www.goodfellowinc.com',
  'www.richmondflooring.ca', 'leeflooring.ca', 'www.pentzcommercial.com',
  'www.godfreyhirst.com', 'forbo.azureedge.net', 'scrl.img.trykcloudstatic.com',
  'res.cloudinary.com', 'www.shnierflooring.ca', 'cdn.msisurfaces.com', 'cdn.bfldr.com',
  'pcrl.img.trykcloudstatic.com'
]);

function checkedURL(value) {
  let url;
  try { url = new URL(value); } catch { throw new HttpError(400, 'Enter a complete HTTPS image link.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !hosts.has(url.hostname)) {
    throw new HttpError(400, 'Use a supported manufacturer image link, or download the image and upload it instead.');
  }
  return url;
}

export async function downloadImage(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new HttpError(400, 'Enter an image link under 2048 characters.');
  let url = checkedURL(value);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      const response = await fetch(url.href, {
        redirect: 'manual', signal: controller.signal,
        headers: { Accept: 'image/jpeg,image/png,image/webp' }
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel();
        const location = response.headers.get('location');
        if (!location) throw new HttpError(400, 'The image link redirects without a destination.');
        url = checkedURL(new URL(location, url).href);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new HttpError(400, 'The image could not be downloaded. Download it yourself and use Upload instead.');
      }
      const bytes = await boundedBody(response, 5 * 1024 * 1024);
      const type = imageType(bytes, response.headers.get('content-type')?.split(';')[0].trim());
      return { bytes, type };
    }
    throw new HttpError(400, 'Too many image redirects. Use a direct image link.');
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'Could not download the image. Check the link or upload the file instead.');
  } finally {
    clearTimeout(timer);
  }
}
