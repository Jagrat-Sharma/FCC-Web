import { mkdir, copyFile, readdir, rm } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const files = ['index.html','about.html','contact.html','faq.html','gallery.html','products.html',
  'styles.css','script.js','navigation.js','catalogue.js','gallery.js','favicon.png','404.html','_headers','_routes.json','robots.txt'];
// Allowlist only: no .git, secrets, migrations, WordPress, tests or server source.
// The resolved deletion target is exactly this project's generated dist directory.
if (output !== resolve(root, 'dist') || dirname(output) !== root) throw new Error('Unsafe build output.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of files) await copyFile(resolve(root, name), resolve(output, name));
await mkdir(resolve(output, 'admin'));
for (const name of ['index.html', 'admin.js', 'admin.css']) await copyFile(resolve(root, 'admin', name), resolve(output, 'admin', name));
async function copyAssets(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || entry.name.startsWith('.')) throw new Error('Unsupported asset: ' + entry.name);
    if (entry.isDirectory()) await copyAssets(resolve(source, entry.name), resolve(target, entry.name));
    else {
      if (!['.png','.jpg','.jpeg','.webp','.svg','.avif','.ico','.woff','.woff2'].includes(extname(entry.name).toLowerCase())) throw new Error('Unsupported asset: ' + entry.name);
      await copyFile(resolve(source, entry.name), resolve(target, entry.name));
    }
  }
}
await copyAssets(resolve(root, 'assets'), resolve(output, 'assets'));
console.log('Built dist/ for Cloudflare Pages. Functions remain in functions/ and are deployed by Wrangler.');
