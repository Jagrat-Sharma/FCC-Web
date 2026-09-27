import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DatabaseSync
}
from 'node:sqlite';
import {
  readFileSync, readdirSync
}
from 'node:fs';
import { categoryFields } from '../product-fields.js';
import { downloadImage } from '../server/image-import.js';
import { isManufacturerImage, manufacturerImageOrigins } from '../server/manufacturer-images.js';
import {
  handleAPI, mediaResponse
}
from '../server/api.js';
import {
  handleAdmin
}
from '../server/admin.js';
const keys = await crypto.subtle.generateKey({
  name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256'
}, true, ['sign','verify']);
const jwk = {
  ...await crypto.subtle.exportKey('jwk', keys.publicKey), kid: 'test-key'
};
const base = {
  PUBLIC_ORIGIN: 'https://flooring.example', ACCESS_TEAM_DOMAIN: 'https://fcc-test.cloudflareaccess.com', ACCESS_AUD: 'test-audience', ADMIN_EMAILS: 'owner@example.com'
};
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
async function token(extra = {
}) {
  const data = encode({
    alg: 'RS256', kid: jwk.kid
  }) + '.' + encode({
    iss: base.ACCESS_TEAM_DOMAIN, aud: [base.ACCESS_AUD], email: 'owner@example.com', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+3600, ...extra
  });
  return data + '.' + Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, new TextEncoder().encode(data))).toString('base64url');
}
const valid = await token();
function setup() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0002_product_specifications.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0003_blog.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0006_product_colours.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(query) {
      const statement = sql.prepare(query);
      let args = [];
      return {
        bind(...values) {
          args = values;
          return this;
        }, async first() {
          return statement.get(...args) || null;
        }, async all() {
          return {
            results: statement.all(...args)
          };
        }, async run() {
          return {
            meta: statement.run(...args)
          };
        }
      };
    }
  };
  const objects = new Map();
  const IMAGES = {
    async put(key, bytes, metadata) {
      objects.set(key, {
        bytes, metadata
      });
    }, async get(key) {
      const o = objects.get(key);
      return o ? {
        body: o.bytes
      }
      : null;
    }, async delete(key) {
      objects.delete(key);
    }
  };
  return {
    ...base, DB, IMAGES, objects, sql, ASSETS: {
      async fetch() {
        return new Response('admin');
      }
    }
  };
}
function req(path, method = 'GET', body, jwt = valid, extra = {
}) {
  const headers = {
    ...(jwt ? {
      'Cf-Access-Jwt-Assertion': jwt
    }
    : {
    }), Origin: base.PUBLIC_ORIGIN, 'X-FCC-Admin': '1', ...(body !== undefined ? {
      'Content-Type': 'application/json'
    }
    : {
    }), ...extra
  };
  return new Request(base.PUBLIC_ORIGIN + path, {
    method, headers, ...(body !== undefined ? {
      body: typeof body === 'string' ? body : JSON.stringify(body)
    }
    : {
    })
  });
}
const product = {
  name: 'Natural Oak', category_id: 'carpet', description: 'A warm neutral floor.', price_cents: null, price_unit: '', featured: false, published: false, image_id: null, image_alt: ''
};
globalThis.fetch = async url => {
  assert.equal(url, base.ACCESS_TEAM_DOMAIN + '/cdn-cgi/access/certs');
  return Response.json({
    keys: [jwk]
  });
};
test('signed Access identity, audience, expiration, allowlist, origin and missing config are enforced', async () => {
  const env = setup();
  const cases = [[null,401], ['forged.token.value',401], [await token({
    aud: ['wrong']
  }),401], [await token({
    exp: 1
  }),401], [await token({
    email: 'stranger@example.com'
  }),403], [valid,200]];
  for (const [jwt,status] of cases) assert.equal((await handleAPI({
    env, request: req('/api/admin/session','GET',undefined,jwt)
  })).status,status);
  const segments = valid.split('.');
  segments[2] = (segments[2][0] === 'A' ? 'B' : 'A') + segments[2].slice(1);
  assert.equal((await handleAPI({
    env, request: req('/api/admin/products','POST',product,segments.join('.'))
  })).status,401);
  assert.equal((await handleAPI({
    env, request: req('/api/admin/products','POST',product,null)
  })).status,401);
  assert.equal((await handleAPI({
    env: {
      ...env, ACCESS_AUD: ''
    }, request: req('/api/admin/session')
  })).status,503);
  assert.equal((await handleAPI({
    env, request: req('/api/admin/products','POST',product,valid,{
      Origin:'https://evil.example'
    })
  })).status,403);
  assert.equal((await handleAPI({
    env, request: req('/api/admin/products','POST',product,valid,{
      'X-FCC-Admin':''
    })
  })).status,403);
  assert.equal((await handleAPI({
    env, request: req('/api/products','POST',product,null)
  })).status,405);
  assert.equal((await handleAdmin({
    env, request: req('/admin/', 'GET', undefined, null)
  })).status,401);
  const admin = await handleAdmin({
    env, request: req('/admin/')
  });
  assert.equal(admin.status,200);
  assert.match(admin.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.equal((await handleAdmin({
    env, request: new Request('https://other.pages.dev/admin/',{
      headers:{
        'Cf-Access-Jwt-Assertion':valid
      }
    })
  })).status,403);
  env.sql.close();
});
test('product CRUD, drafts, prices, filters, validation, pagination and edit conflicts', async () => {
  const env = setup(), call = (path,method,body) => handleAPI({
    env, request:req(path,method,body)
  });
  assert.equal((await (await call('/api/categories')).json()).items.length,8);
  for (const bad of [{
    name:'<script>alert(1)</script>'
  },{
    category_id:'unknown'
  },{
    price_cents:-1
  },{
    featured:'yes'
  },{
    description:'x'.repeat(5001)
  }
  ]) assert.equal((await call('/api/admin/products','POST',{
    ...product,...bad
  })).status,400);
  assert.equal((await call('/api/admin/products','POST','{')).status,400);
  const response = await call('/api/admin/products','POST',product);
  assert.equal(response.status,201);
  const {
    item
  }
  = await response.json();
  assert.equal((await (await call('/api/products')).json()).total,0);
  assert.equal((await call('/api/products/'+item.id)).status,404);
  const updated = {
    ...product,published:true,featured:true,price_cents:0,version:1
  };
  assert.equal((await call('/api/admin/products/'+item.id,'PUT',updated)).status,200);
  assert.equal((await call('/api/admin/products/'+item.id,'PUT',updated)).status,409);
  const list = await (await call('/api/products?category=carpet&featured=1&limit=6')).json();
  assert.equal(list.total,1);
  assert.equal(list.items[0].price_cents,0);
  assert.equal((await (await call('/api/products?q='+encodeURIComponent("%' OR 1=1 --"))).json()).total,0);
  assert.equal((await call('/api/products?limit=1000')).status,400);
  assert.equal((await call('/api/products?sort=toString')).status,400);
  assert.equal((await call('/api/admin/products/'+item.id,'DELETE',{
    version:1
  })).status,409);
  assert.equal((await call('/api/admin/products/'+item.id,'DELETE',{
    version:2
  })).status,200);
  env.sql.close();
});
test('static deployment contains expected frontend files without server source or configuration', async () => {
  const {
    readdir, readFile
  }
  = await import('node:fs/promises');
  const root = new URL('../dist/', import.meta.url);
  const files = await readdir(root);
  for (const file of ['index.html','products.html','gallery.html','catalogue.js','gallery.js','admin','_routes.json','404.html']) assert.ok(files.includes(file),file);
  for (const file of ['server','functions','migrations','wordpress','wordpress-ready','wrangler.toml','.git','.dev.vars','tests','README.md']) assert.ok(!files.includes(file),file);
  assert.deepEqual((await readdir(new URL('admin/',root))).sort(),['admin.css','admin.js','categories.html','index.html','product.html']);
  const products=await readFile(new URL('products.html',root),'utf8');
  assert.ok(!products.includes('data-name="Soft Sand"'));
  assert.match(products, /src="catalogue\.js\?v=[a-f0-9]{12}"/);
  const gallery=await readFile(new URL('gallery.html',root),'utf8');
  assert.ok(gallery.includes('id="gallery-grid"'));
  assert.match(gallery, /src="gallery\.js\?v=[a-f0-9]{12}"/);
  const routes=JSON.parse(await readFile(new URL('_routes.json',root),'utf8'));
  assert.deepEqual(routes.include,['/api/*','/media/*','/admin','/admin/*']);
});
test('R2 uploads, private draft images, gallery publishing and referenced image deletion', async () => {
  const env=setup(), call=(path,method,body)=>handleAPI({
    env,request:req(path,method,body)
  });
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHoQAAAAASUVORK5CYII=','base64');
  const upload=bytes=>handleAPI({
    env,request:new Request(base.PUBLIC_ORIGIN+'/api/admin/media',{
      method:'POST',headers:{
        'Cf-Access-Jwt-Assertion':valid,Origin:base.PUBLIC_ORIGIN,'X-FCC-Admin':'1','Content-Type':'image/png'
      },body:bytes
    })
  });
  assert.equal((await upload(new TextEncoder().encode('<svg></svg>'))).status,415);
  assert.equal((await upload(new Uint8Array(5242881))).status,413);
  const uploaded=await upload(png);
  assert.equal(uploaded.status,201);
  const {
    item:image
  }
  =await uploaded.json();
  assert.equal(env.objects.size,1);
  await assert.rejects(()=>mediaResponse(req('/media/'+image.id),env,image.id),e=>e.status===404);
  assert.equal((await call('/api/admin/media/'+image.id+'/file')).status,200);
  const gallery={
    title:'Recent installation',description:'Brampton',image_id:image.id,image_alt:'Oak floor',published:false,sort_order:2
  };
  const {
    item
  }
  =await(await call('/api/admin/gallery','POST',gallery)).json();
  assert.equal((await call('/api/admin/media/'+image.id,'DELETE',{
  })).status,409);
  assert.equal((await(await call('/api/gallery')).json()).total,0);
  assert.equal((await call('/api/admin/gallery/'+item.id,'PUT',{
    ...gallery,published:true,version:1
  })).status,200);
  assert.equal((await mediaResponse(req('/media/'+image.id),env,image.id)).status,200);
  assert.equal((await(await call('/api/gallery')).json()).items[0].title,gallery.title);
  await call('/api/admin/gallery/'+item.id,'PUT',{
    ...gallery,version:2
  });
  await assert.rejects(()=>mediaResponse(req('/media/'+image.id),env,image.id),e=>e.status===404);
  await call('/api/admin/gallery/'+item.id,'DELETE',{
    version:3
  });
  const coloured = { ...product, colours: [{ name: 'Sand', code: 'S01', image_id: image.id }] };
  const createdColourProduct = await call('/api/admin/products', 'POST', coloured);
  assert.equal(createdColourProduct.status, 201);
  const colourProduct = (await createdColourProduct.json()).item;
  assert.equal(colourProduct.colours[0].image_url, '/media/' + image.id);
  assert.equal((await call('/api/admin/media/' + image.id, 'DELETE', {})).status, 409);
  await assert.rejects(() => mediaResponse(req('/media/' + image.id), env, image.id), error => error.status === 404);
  assert.equal((await call('/api/admin/products/' + colourProduct.id, 'PUT', { ...coloured, published: true, version: 1 })).status, 200);
  assert.equal((await mediaResponse(req('/media/' + image.id), env, image.id)).status, 200);
  assert.equal((await call('/api/admin/products', 'POST', { ...coloured, colours: [{ name: '<script>', code: '', image_id: null }] })).status, 400);
  assert.equal((await call('/api/admin/products/' + colourProduct.id, 'DELETE', { version: 2 })).status, 200);
  assert.equal((await call('/api/admin/media/'+image.id,'DELETE',{
  })).status,200);
  assert.equal(env.objects.size,0);
  env.sql.close();
});

test('brand filters and specifications persist safely without exposing draft brands', async () => {
  const env = setup();
  const call = (path, method, body) => handleAPI({ env, request: req(path, method, body) });
  const draft = await call('/api/admin/products', 'POST', { ...product, brand: 'Private supplier' });
  assert.equal(draft.status, 201);
  for (const brand of ['Zeta', 'Alpha']) {
    const response = await call('/api/admin/products', 'POST', {
      ...product, brand, published: true, specifications: { width: "12 ft", color: '10 colours', material: 'Nylon' }
    });
    assert.equal(response.status, 201);
    const { item } = await response.json();
    assert.equal(item.specifications.width, '12 ft');
    const updated = await call('/api/admin/products/' + item.id, 'PUT', {
      ...item, specifications: { ...item.specifications, length: 'Random' }
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).item.specifications.length, 'Random');
  }
  const brands = (await (await call('/api/brands')).json()).items.map(item => item.name);
  assert.deepEqual(brands, ['Alpha', 'Zeta']);
  const sorted = (await (await call('/api/products?sort=brand')).json()).items;
  assert.deepEqual(sorted.map(item => item.brand), ['Alpha', 'Zeta']);
  assert.equal((await (await call('/api/products?brand=alpha')).json()).total, 1);
  assert.equal((await (await call('/api/products?brand=Alpha&brand=Zeta')).json()).total, 2);
  assert.equal((await (await call('/api/products?brand=Private%20supplier')).json()).total, 0);
  for (const extra of [{ brand: '<script>' }, { specifications: [] }, { specifications: { width: 'x'.repeat(181) } }, { specifications: { unexpected: 'test' } }]) {
    assert.equal((await call('/api/admin/products', 'POST', { ...product, ...extra })).status, 400);
  }
  for (const path of ['/admin/product.html', '/admin/categories.html']) {
    assert.equal((await handleAdmin({ env, request: req(path, 'GET', undefined, null) })).status, 401);
  }
  env.sql.close();
});

test('blog CRUD enforces drafts, validation, conflicts and referenced cover protection', async () => {
  const env = setup();
  const call = (path, method, body) => handleAPI({ env, request: req(path, method, body) });
  const image = (await (await handleAPI({ env, request: new Request(base.PUBLIC_ORIGIN + '/api/admin/media', {
    method: 'POST', headers: { 'Cf-Access-Jwt-Assertion': valid, Origin: base.PUBLIC_ORIGIN, 'X-FCC-Admin': '1', 'Content-Type': 'image/png' },
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHoQAAAAASUVORK5CYII=','base64')
  }) })).json()).item;
  const post = { title: 'Choosing carpet', description: 'A short introduction.', content: 'First paragraph.\n\nSecond paragraph.', image_id: image.id, image_alt: 'Carpet texture', published: false };
  assert.equal((await handleAPI({ env, request: req('/api/admin/blogs', 'POST', post, null) })).status, 401);
  assert.equal((await call('/api/blogs', 'POST', post)).status, 405);
  for (const content of ['', '<script>alert(1)</script>', 'x'.repeat(30001)]) {
    assert.equal((await call('/api/admin/blogs', 'POST', { ...post, content })).status, 400);
  }
  const created = await call('/api/admin/blogs', 'POST', post);
  assert.equal(created.status, 201);
  const { item } = await created.json();
  assert.equal((await (await call('/api/blogs')).json()).total, 0);
  assert.equal((await call('/api/blogs/' + item.id)).status, 404);
  await assert.rejects(() => mediaResponse(req('/media/' + image.id), env, image.id), error => error.status === 404);
  assert.equal((await call('/api/admin/media/' + image.id, 'DELETE', {})).status, 409);
  assert.equal((await (await call('/api/admin/media')).json()).items[0].references_count, 1);
  assert.equal((await call('/api/admin/blogs/' + item.id, 'PUT', { ...post, content: 'x'.repeat(30000), published: true, version: 1 })).status, 200);
  assert.equal((await mediaResponse(req('/media/' + image.id), env, image.id)).status, 200);
  assert.equal((await (await call('/api/blogs')).json()).total, 1);
  assert.equal((await (await call('/api/blogs/' + item.id)).json()).item.content.length, 30000);
  assert.equal((await call('/api/admin/blogs/' + item.id, 'DELETE', { version: 1 })).status, 409);
  assert.equal((await call('/api/admin/blogs/' + item.id, 'DELETE', { version: 2 })).status, 200);
  assert.equal((await call('/api/blogs/' + item.id)).status, 404);
  assert.equal((await call('/api/admin/media/' + image.id, 'DELETE', {})).status, 200);
  env.sql.close();
});
test('reviewed catalogue migration preserves existing work and all colour choices', async () => {
  const env = setup();
  const batch = JSON.parse(readFileSync(new URL('../catalogue-imports/2026-09-27.json', import.meta.url), 'utf8'));
  const migration = readFileSync(new URL('../migrations/0008_reviewed_catalogue_batch.sql', import.meta.url), 'utf8');
  const call = (path, method, body) => handleAPI({ env, request: req(path, method, body) });
  env.sql.exec(migration);
  assert.equal(env.sql.prepare('SELECT count(*) AS n FROM products').get().n, 25);
  assert.equal((await (await call('/api/products')).json()).total, 0);
  assert.deepEqual((await (await call('/api/brands')).json()).items, []);
  const admin = await (await call('/api/admin/products?limit=50')).json();
  assert.equal(admin.total, batch.products.length);
  for (const expected of batch.products) {
    const item = admin.items.find(p => p.name === expected.name && p.brand === expected.brand);
    assert.ok(item, expected.name);
    assert.equal(item.published, false);
    assert.deepEqual(item.specifications, expected.specifications);
    assert.equal(item.colours.length, expected.colours.length);
    for (const key of Object.keys(item.specifications)) {
      assert.ok(categoryFields[item.category_id].includes(key), item.name + ': admin must preserve ' + key);
    }
    // Editing a seeded entry must preserve its swatches, including exact external URLs.
    const saved = await call('/api/admin/products/' + item.id, 'PUT', item);
    assert.equal(saved.status, 200, item.name);
    assert.deepEqual((await saved.json()).item.colours, item.colours);
    for (const colour of item.colours) {
      if (colour.source_image_url) {
        assert.ok(isManufacturerImage(colour.source_image_url));
        assert.ok(manufacturerImageOrigins.includes(new URL(colour.source_image_url).origin));
      }
    }
  }
  const shaw = admin.items.find(p => p.brand === 'Shaw Floors');
  const edited = { ...shaw, name: 'Client-edited Classic Tone', published: true, version: 2 };
  assert.equal((await call('/api/admin/products/' + shaw.id, 'PUT', edited)).status, 200);
  env.sql.exec(migration);
  assert.equal(env.sql.prepare('SELECT count(*) AS n FROM products').get().n, 25);
  const publicProducts = await (await call('/api/products?brand=Shaw%20Floors')).json();
  assert.equal(publicProducts.total, 1);
  assert.equal(publicProducts.items[0].name, edited.name);
  assert.equal(publicProducts.items[0].colours.length, 35);
  assert.ok(publicProducts.items[0].image_url.startsWith('https://shawfloors.widen.net/'));

  const malicious = ['https://example.com/swatch.jpg', 'javascript:alert(1)', 'https://shawfloors.widen.net/other.jpg', shaw.colours[0].source_image_url + '&redirect=https://example.com'];
  for (const source_image_url of malicious) {
    assert.equal((await call('/api/admin/products', 'POST', {
      ...shaw, colours: [{ name: 'Unsafe', code: '', image_id: null, source_image_url }]
    })).status, 400);
  }
  env.sql.close();
});

test('image link imports enforce authorization, safe destinations, file limits and private storage', async () => {
  const env = setup();
  const originalFetch = globalThis.fetch;
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHoQAAAAASUVORK5CYII=', 'base64');
  const url = 'https://torlys.com/image.png';
  let calls = 0;
  let response = () => new Response(png, { headers: { 'Content-Type': 'image/png' } });
  globalThis.fetch = async (target, options) => {
    if (target === base.ACCESS_TEAM_DOMAIN + '/cdn-cgi/access/certs') return originalFetch(target);
    calls++;
    assert.equal(options.redirect, 'manual');
    assert.deepEqual(Object.keys(options.headers), ['Accept']);
    return response();
  };
  try {
    const call = (jwt = valid, headers = {}) => handleAPI({ env, request: req('/api/admin/media/import', 'POST', { url }, jwt, headers) });
    assert.equal((await call(null)).status, 401);
    assert.equal((await call(valid, { Origin: 'https://evil.example' })).status, 403);
    assert.equal(calls, 0);
    for (const blocked of ['http://torlys.com/a.png', 'https://127.0.0.1/a.png', 'https://localhost/a.png', 'https://evil.example/a.png', 'https://user:pass@torlys.com/a.png', 'https://torlys.com:444/a.png']) {
      await assert.rejects(() => downloadImage(blocked), e => e.status === 400);
    }
    assert.equal(calls, 0);
    const imported = await call();
    assert.equal(imported.status, 201);
    const { item } = await imported.json();
    assert.equal(env.objects.size, 1);
    await assert.rejects(() => mediaResponse(req('/media/' + item.id), env, item.id), e => e.status === 404);
    assert.equal((await mediaResponse(req('/api/admin/media/' + item.id + '/file'), env, item.id, true)).status, 200);
    response = () => new Response(null, { status: 302, headers: { Location: 'https://127.0.0.1/private' } });
    await assert.rejects(() => downloadImage(url), e => e.status === 400);
    response = () => new Response('<svg/>', { headers: { 'Content-Type': 'image/png' } });
    await assert.rejects(() => downloadImage(url), e => e.status === 415);
    response = () => new Response(png, { headers: { 'Content-Type': 'image/png', 'Content-Length': '5242881' } });
    await assert.rejects(() => downloadImage(url), e => e.status === 413);
    response = () => new Response(new Uint8Array(5242881), { headers: { 'Content-Type': 'image/png' } });
    await assert.rejects(() => downloadImage(url), e => e.status === 413);
    response = () => new Response(null, { status: 302, headers: { Location: url } });
    await assert.rejects(() => downloadImage(url), e => e.status === 400);
    assert.equal(env.objects.size, 1);
  } finally {
    globalThis.fetch = originalFetch;
    env.sql.close();
  }
});

test('all migrations apply together without duplicating Strong Intuition', () => {
  const sql = new DatabaseSync(':memory:');
  const migrations = new URL('../migrations/', import.meta.url);
  for (const name of readdirSync(migrations).filter(name => name.endsWith('.sql')).sort()) {
    sql.exec(readFileSync(new URL(name, migrations), 'utf8'));
  }
  assert.deepEqual(sql.prepare('PRAGMA foreign_key_check').all(), []);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM products').get().n, 26);
  const beaulieu = sql.prepare('SELECT * FROM products WHERE id = ?').get('14c12ec4-a886-4501-8df9-ed3e2be9d964');
  assert.equal(JSON.parse(beaulieu.colours).length, 9);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM products WHERE published = 1').get().n, 0);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM products, json_each(products.colours)').get().n, 352);
  const imageCount = () => sql.prepare("SELECT count(*) AS n FROM products, json_each(products.colours) WHERE coalesce(json_extract(value, '$.source_image_url'), '') <> ''").get().n;
  assert.equal(imageCount(), 314); // 305 batch swatches plus nine existing Beaulieu swatches.
  const before = sql.prepare('SELECT id, colours, version FROM products ORDER BY id').all();
  sql.exec(readFileSync(new URL('0009_catalogue_images.sql', migrations), 'utf8'));
  assert.deepEqual(sql.prepare('SELECT id, colours, version FROM products ORDER BY id').all(), before);
  sql.close();
});
