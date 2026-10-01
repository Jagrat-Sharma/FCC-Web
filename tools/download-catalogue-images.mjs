// Download reviewed catalogue images only. Run from the project root.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { downloadImage } from '../server/image-import.js';

const source = readFileSync('server/manufacturer-images.js', 'utf8');
const urls = JSON.parse(source.match(/new Set\((\[[\s\S]*?\])\)/)[1]);
for (const code of ['14312','16855','16986','84199','86583','89056','89823','19204','84294']) {
  urls.push(`https://canada.beaulieucanada.com/images/5436-1/Thumb_Hires-5436-${code}.jpg?_w=600`);
}
function larger(value) {
  const u = new URL(value);
  if (u.hostname.endsWith('.scene7.com')) {
    u.search = ''; u.searchParams.set('wid', '1200'); u.searchParams.set('hei', '1200'); u.searchParams.set('fmt', 'jpeg');
  } else if (u.hostname === 'shawfloors.widen.net') {
    u.searchParams.set('w', '1200'); u.searchParams.set('h', '1200');
  } else if (u.hostname === 'cdn.bfldr.com') {
    u.searchParams.set('height', '1200');
  } else if (u.hostname === 'torlys.com') {
    u.pathname = u.pathname.replace(/-\d+x\d+(?=\.)/, '');
  } else if (u.hostname === 'www.biyorkcanada.com') {
    u.pathname = u.pathname.replace(/_\d+x(?=\.)/, '');
  } else if (u.hostname === 'res.cloudinary.com') {
    u.pathname = u.pathname.replace('c_crop%2Cg_north%2Ch_300%2Cw_300/', '');
  } else if (u.hostname === 'canada.beaulieucanada.com') {
    u.searchParams.set('_w', '1200');
  }
  return u.href;
}
mkdirSync('.image-cache', { recursive: true });
const reportPath = '.image-cache/downloads.json';
const old = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : [];
const results = [];
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < urls.length) {
    const original = urls[cursor++];
    const cached = old.find(r => r.original === original && r.file && existsSync(r.file));
    if (cached) { results.push(cached); continue; }
    const candidates = [...new Set([larger(original), original])];
    let result = { original };
    for (const fetched of candidates) {
      try {
        const { bytes, type } = await downloadImage(fetched);
        const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type];
        const file = '.image-cache/' + createHash('sha256').update(original).digest('hex').slice(0, 20) + '.' + extension;
        writeFileSync(file, bytes);
        result = { original, fetched, file, bytes: bytes.length };
        break;
      } catch (error) { result.error = error.message; }
    }
    results.push(result);
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
    if (results.length % 25 === 0) console.log(`${results.length}/${urls.length} processed`);
  }
}));
writeFileSync(reportPath, JSON.stringify(results.sort((a,b) => a.original.localeCompare(b.original)), null, 2));
console.log(`Downloaded ${results.filter(r => r.file).length}/${urls.length}; failures recorded in ${reportPath}.`);
