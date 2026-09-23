import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DatabaseSync
}
from 'node:sqlite';
import {
  readFileSync
}
from 'node:fs';
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
  assert.deepEqual((await readdir(new URL('admin/',root))).sort(),['admin.css','admin.js','index.html']);
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
  assert.equal((await call('/api/admin/media/'+image.id,'DELETE',{
  })).status,200);
  assert.equal(env.objects.size,0);
  env.sql.close();
});
