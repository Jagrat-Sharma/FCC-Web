import {
  mkdir, copyFile, readdir, rm, readFile, writeFile
}
from 'node:fs/promises';
import {
  createHash
}
from 'node:crypto';
import {
  resolve, dirname, extname
}
from 'node:path';
import {
  fileURLToPath
}
from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const files = ['index.html','about.html','services.html','contact.html','faq.html','gallery.html','products.html',
'styles.css','script.js','navigation.js','catalogue.js','gallery.js','showcase.js','favicon.png','404.html','_headers','_routes.json','robots.txt'];
// Allowlist only: no .git, secrets, migrations, WordPress, tests or server source.
// The resolved deletion target is exactly this project's generated dist directory.
if (output !== resolve(root, 'dist') || dirname(output) !== root) throw new Error('Unsafe build output.');
await rm(output, {
  recursive: true, force: true
});
await mkdir(output, {
  recursive: true
});
for (const name of files) await copyFile(resolve(root, name), resolve(output, name));
await mkdir(resolve(output, 'admin'));
for (const name of ['index.html', 'admin.js', 'admin.css']) await copyFile(resolve(root, 'admin', name), resolve(output, 'admin', name));
async function copyAssets(source, target) {
  await mkdir(target, {
    recursive: true
  });
  for (const entry of await readdir(source, {
    withFileTypes: true
  })) {
    if (entry.isSymbolicLink() || entry.name.startsWith('.')) throw new Error('Unsupported asset: ' + entry.name);
    if (entry.isDirectory()) await copyAssets(resolve(source, entry.name), resolve(target, entry.name));
    else {
      if (!['.png','.jpg','.jpeg','.webp','.svg','.avif','.ico','.woff','.woff2'].includes(extname(entry.name).toLowerCase())) throw new Error('Unsupported asset: ' + entry.name);
      await copyFile(resolve(source, entry.name), resolve(target, entry.name));
    }
  }
}
await copyAssets(resolve(root, 'assets'), resolve(output, 'assets'));
// A changed script or stylesheet gets a new URL in the same deployment.
// This prevents cached catalogue code from restoring the old anchor navigation.
for (const name of [...files.filter(name => name.endsWith('.html')), 'admin/index.html']) {
  let html = await readFile(resolve(output, name), 'utf8');
  const references = [...html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^\"]*)?"/g)];
  for (const match of references) {
    if (/^(?:https?:)?\/\//.test(match[1])) continue;
    const asset = match[1].startsWith('/') ? resolve(output, '.' + match[1]) : resolve(dirname(resolve(output, name)), match[1]);
    const hash = createHash('sha256').update(await readFile(asset)).digest('hex').slice(0, 12);
    html = html.replace(match[0], match[0].slice(0, match[0].indexOf('"') + 1) + match[1] + '?v=' + hash + '"');
  }
  await writeFile(resolve(output, name), html);
}
console.log('Built dist/ for Cloudflare Pages. Functions remain in functions/ and are deployed by Wrangler.');
