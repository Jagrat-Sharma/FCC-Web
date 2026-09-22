import { authenticate, protectMutation } from './auth.js';
import { HttpError, json, failure, boundedBody, readJSON } from './http.js';
import { UUID, record, integer, text, imageType } from './validation.js';

const kinds = new Set(['products', 'gallery']);
const nowSQL = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";
function idCheck(id) { if (!UUID.test(id || '')) throw new HttpError(404, 'Item not found.'); }
function pageOptions(url) {
  const page = Number(url.searchParams.get('page') || 1);
  const limit = Number(url.searchParams.get('limit') || 12);
  integer(page, 1, 100000, 'Page'); integer(limit, 1, 50, 'Page size');
  return { page, limit, offset: (page - 1) * limit };
}
function itemView(row) {
  return { ...row, published: !!row.published, ...(row.featured !== undefined ? { featured: !!row.featured } : {}),
    image_url: row.image_id ? `/media/${row.image_id}` : null };
}
async function listItems(env, url, kind, admin) {
  const { page, limit, offset } = pageOptions(url);
  const conditions = admin ? [] : ['t.published = 1'];
  const args = [];
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length > 120) throw new HttpError(400, 'Search is too long.');
  if (q) {
    const pattern = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';
    conditions.push(`(t.${kind === 'products' ? 'name' : 'title'} LIKE ? ESCAPE '\\' OR t.description LIKE ? ESCAPE '\\')`);
    args.push(pattern, pattern);
  }
  const category = url.searchParams.get('category');
  if (category && kind === 'products') { conditions.push('c.slug = ?'); args.push(category); }
  if (url.searchParams.get('featured') === '1' && kind === 'products') conditions.push('t.featured = 1');
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const join = kind === 'products' ? ' JOIN categories c ON c.id = t.category_id' : '';
  const select = kind === 'products' ? 't.*, c.name AS category_name, c.slug AS category_slug' : 't.*';
  const sort = url.searchParams.get('sort') || 'featured';
  const order = kind === 'gallery' ? 't.sort_order ASC, t.created_at DESC, t.id ASC' :
    (new Map([['az', 't.name COLLATE NOCASE ASC, t.id ASC'], ['za', 't.name COLLATE NOCASE DESC, t.id ASC'], ['featured', 't.featured DESC, t.created_at DESC, t.id ASC']]).get(sort));
  if (!order) throw new HttpError(400, 'Invalid sort order.');
  const count = await env.DB.prepare(`SELECT COUNT(*) AS total FROM ${kind} t${join}${where}`).bind(...args).first();
  const rows = await env.DB.prepare(`SELECT ${select} FROM ${kind} t${join}${where} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(...args, limit, offset).all();
  return json({ items: rows.results.map(itemView), total: count.total, page, limit });
}
async function saveItem(request, env, kind, id) {
  const input = await readJSON(request);
  const data = record(input, kind);
  if (kind === 'products' && !await env.DB.prepare('SELECT id FROM categories WHERE id = ?').bind(data.category_id).first()) throw new HttpError(400, 'Choose an existing category.');
  if (data.image_id && !await env.DB.prepare('SELECT id FROM media WHERE id = ?').bind(data.image_id).first()) throw new HttpError(400, 'This image no longer exists. Upload it again.');
  const fields = Object.keys(data);
  if (id) {
    idCheck(id);
    const version = integer(input.version, 1, 2147483647, 'Version');
    const update = await env.DB.prepare(`UPDATE ${kind} SET ${fields.map(k => k + ' = ?').join(', ')}, version = version + 1, updated_at = ${nowSQL} WHERE id = ? AND version = ?`).bind(...Object.values(data), id, version).run();
    if (!update.meta.changes) throw new HttpError(409, 'This item changed or was deleted. Reload it before saving.');
  } else {
    id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO ${kind} (id, ${fields.join(', ')}) VALUES (${Array(fields.length + 1).fill('?').join(', ')})`).bind(id, ...Object.values(data)).run();
  }
  const item = await env.DB.prepare(`SELECT * FROM ${kind} WHERE id = ?`).bind(id).first();
  return json({ item: itemView(item) }, request.method === 'POST' ? 201 : 200);
}
async function upload(request, env) {
  const bytes = await boundedBody(request, 5 * 1024 * 1024);
  const type = imageType(bytes, request.headers.get('content-type')?.split(';')[0]);
  const id = crypto.randomUUID();
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[type];
  const key = `uploads/${id}.${ext}`;
  const filename = text(request.headers.get('X-File-Name') || `image.${ext}`, 'Filename', 180, true);
  await env.IMAGES.put(key, bytes, { httpMetadata: { contentType: type, contentDisposition: `inline; filename="${id}.${ext}"` } });
  try {
    await env.DB.prepare('INSERT INTO media (id, object_key, mime_type, size_bytes, filename) VALUES (?, ?, ?, ?, ?)').bind(id, key, type, bytes.length, filename).run();
  } catch (error) { await env.IMAGES.delete(key); throw error; }
  return json({ item: { id, filename, mime_type: type, size_bytes: bytes.length, image_url: `/api/admin/media/${id}/file` } }, 201);
}
export async function mediaResponse(request, env, id, admin = false) {
  idCheck(id);
  if (!['GET', 'HEAD'].includes(request.method)) throw new HttpError(405, 'Method not allowed.');
  const row = await env.DB.prepare('SELECT * FROM media WHERE id = ?').bind(id).first();
  if (!row) throw new HttpError(404, 'Image not found.');
  if (!admin) {
    const visible = await env.DB.prepare('SELECT id FROM products WHERE image_id = ? AND published = 1 UNION ALL SELECT id FROM gallery WHERE image_id = ? AND published = 1 LIMIT 1').bind(id, id).first();
    if (!visible) throw new HttpError(404, 'Image not found.');
  }
  const object = await env.IMAGES.get(row.object_key);
  if (!object) throw new HttpError(404, 'Image not found.');
  return new Response(request.method === 'HEAD' ? null : object.body, { headers: {
    'Content-Type': row.mime_type, 'Content-Length': String(row.size_bytes),
    'Content-Disposition': 'inline', 'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store', 'Cross-Origin-Resource-Policy': 'same-origin'
  }});
}
export async function handleAPI({ request, env }) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean).slice(1);
    const admin = parts[0] === 'admin';
    let user;
    if (admin) {
      parts.shift();
      user = await authenticate(request, env);
      if (!['GET', 'HEAD'].includes(request.method)) protectMutation(request, env);
    } else if (request.method !== 'GET') throw new HttpError(405, 'Public APIs are read-only.');
    if (!env.DB || !env.IMAGES) throw new HttpError(503, 'The catalogue is not configured yet.');
    const [kind, id, action] = parts;
    if (parts.length > 3) throw new HttpError(404, 'Route not found.');
    if (admin && kind === 'session' && !id && request.method === 'GET') return json(user);
    if (kind === 'categories' && !id && request.method === 'GET') {
      const rows = await env.DB.prepare('SELECT id, name, slug FROM categories ORDER BY sort_order, name').all();
      return json({ items: rows.results });
    }
    if (admin && kind === 'media') {
      if (id && action === 'file') return await mediaResponse(request, env, id, true);
      if (action) throw new HttpError(404, 'Route not found.');
      if (!id && request.method === 'POST') return await upload(request, env);
      if (!id && request.method === 'GET') {
        const { page, limit, offset } = pageOptions(url);
        const rows = await env.DB.prepare('SELECT m.*, (SELECT COUNT(*) FROM products WHERE image_id=m.id) + (SELECT COUNT(*) FROM gallery WHERE image_id=m.id) AS references_count FROM media m ORDER BY created_at DESC, id LIMIT ? OFFSET ?').bind(limit, offset).all();
        const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM media').first();
        return json({ items: rows.results.map(row => ({ ...row, image_url: `/api/admin/media/${row.id}/file` })), total: count.total, page, limit });
      }
      if (id && request.method === 'DELETE') {
        idCheck(id);
        const row = await env.DB.prepare('SELECT object_key FROM media WHERE id = ?').bind(id).first();
        if (!row) throw new HttpError(404, 'Image not found.');
        try { await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(id).run(); }
        catch (error) {
          if (String(error.message).includes('FOREIGN KEY')) throw new HttpError(409, 'This image is still used by a product or gallery item.');
          throw error;
        }
        await env.IMAGES.delete(row.object_key);
        return json({ success: true });
      }
    }
    if (kinds.has(kind) && !action) {
      if (request.method === 'GET') {
        if (!id) return await listItems(env, url, kind, admin);
        idCheck(id);
        const item = await env.DB.prepare(`SELECT * FROM ${kind} WHERE id = ?${admin ? '' : ' AND published = 1'}`).bind(id).first();
        if (!item) throw new HttpError(404, 'Item not found.');
        return json({ item: itemView(item) });
      }
      if (admin && ((request.method === 'POST' && !id) || (request.method === 'PUT' && id))) return await saveItem(request, env, kind, id);
      if (admin && request.method === 'DELETE' && id) {
        idCheck(id);
        const { version } = await readJSON(request);
        integer(version, 1, 2147483647, 'Version');
        const result = await env.DB.prepare(`DELETE FROM ${kind} WHERE id = ? AND version = ?`).bind(id, version).run();
        if (!result.meta.changes) throw new HttpError(409, 'This item changed or was deleted. Reload the list.');
        return json({ success: true });
      }
    }
    throw new HttpError(404, 'Route not found.');
  } catch (error) { return failure(error); }
}
