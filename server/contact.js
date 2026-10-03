import { HttpError, json, readJSON } from './http.js';
import { text, UUID } from './validation.js';

const interests = ['Help me choose', 'Carpets & rugs', 'Hardwood', 'Vinyl & laminate', 'Installation enquiry'];
const configured = env => env.DB && env.PUBLIC_ORIGIN && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY;

const pauseMessage = 'Online enquiries are temporarily paused. Please call 905-458-5555 or 416-245-4444.';
const recentCountSQL = "SELECT count(*) AS total FROM enquiries WHERE created_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour')";
function browserID(request) {
  const value = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith('__Host-fcc-contact='))?.split('=')[1];
  return UUID.test(value || '') ? value : null;
}
function blocked(message = pauseMessage) {
  return json({ error: message, paused: true }, 429);
}

async function notify(env, id) {
  const now = Math.floor(Date.now() / 1000);
  // Lease prevents simultaneous admin retries from sending twice.
  const lease = await env.DB.prepare("UPDATE enquiries SET notification_status='sending', notification_started=? WHERE id=? AND notification_status <> 'sent' AND (notification_status <> 'sending' OR notification_started < ?)").bind(now, id, now - 60).run();
  if (!lease.meta.changes) return;
  const item = await env.DB.prepare('SELECT * FROM enquiries WHERE id=?').bind(id).first();
  let sent = false;
  try {
    if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) throw new Error('Email not configured');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `enquiry-${id}` },
      body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, to: [env.CONTACT_TO_EMAIL], reply_to: item.email,
        subject: 'New flooring enquiry — First Choice Carpets',
        text: `Name: ${item.name}\nEmail: ${item.email}\nPhone: ${item.phone || 'Not provided'}\nInterested in: ${item.material}\n\n${item.details}\n\nReference: ${id}` })
    });
    sent = response.ok;
    await response.body?.cancel();
  } catch { /* Keep saved enquiries available even when email delivery fails. */ }
  await env.DB.prepare('UPDATE enquiries SET notification_status=? WHERE id=?').bind(sent ? 'sent' : 'failed', id).run();
}

export async function contact(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/contact/config' && request.method === 'GET') {
    const ready = !!configured(env);
    const paused = ready && (await env.DB.prepare(recentCountSQL).first()).total >= 30;
    const response = json({ enabled: ready && !paused, paused, message: paused ? pauseMessage : null, sitekey: ready && !paused ? env.TURNSTILE_SITE_KEY : null });
    if (ready && !browserID(request)) response.headers.set('Set-Cookie', `__Host-fcc-contact=${crypto.randomUUID()}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Strict`);
    return response;
  }
  if (url.pathname !== '/api/contact' || request.method !== 'POST') throw new HttpError(405, 'Method not allowed.');
  if (!configured(env)) throw new HttpError(503, 'Online enquiries are not available yet. Please call or email us.');
  if (request.headers.get('origin') !== env.PUBLIC_ORIGIN) throw new HttpError(403, 'Please send your enquiry from our website.');
  const input = await readJSON(request);
  if (input.website) throw new HttpError(400, 'Your enquiry could not be accepted. Please call or email us.');
  if (!UUID.test(input.id || '')) throw new HttpError(400, 'Invalid enquiry reference. Refresh the page.');
  const name = text(input.name, 'Name', 120, true);
  const email = text(input.email, 'Email', 200, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  const phone = text(input.phone || '', 'Phone', 40);
  const details = text(input.details, 'Project details', 3000, true);
  if (!interests.includes(input.material)) throw new HttpError(400, 'Choose a flooring interest.');
  if (typeof input.token !== 'string' || !input.token || input.token.length > 2048) throw new HttpError(400, 'Please complete the spam check.');
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) throw new HttpError(503, 'Unable to verify this request. Please call or email us.');
  // A confirmed replay does not consume another slot or send another email.
  const existing = await env.DB.prepare('SELECT * FROM enquiries WHERE id=?').bind(input.id).first();
  if (existing) {
    if (existing.name !== name || existing.email !== email || existing.phone !== phone || existing.details !== details || existing.material !== input.material) throw new HttpError(409, 'This reference was already used. Refresh before sending a new enquiry.');
    return json({ success: true, reference: input.id });
  }
  if ((await env.DB.prepare(recentCountSQL).first()).total >= 30) return blocked();
  const browser = browserID(request);
  if (!browser) throw new HttpError(400, 'Please enable cookies and refresh this page, or call 905-458-5555.');
  const hour = Math.floor(Date.now() / 3600000);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.TURNSTILE_SECRET_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare('DELETE FROM contact_limits WHERE expires < ?').bind(now).run();
  // Browser and IP limits complement each other; cookies alone can be cleared.
  for (const identity of [`ip:${ip}`, `browser:${browser}`]) {
    const hash = Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${hour}:${identity}`))), b => b.toString(16).padStart(2, '0')).join('');
    const limit = await env.DB.prepare('INSERT INTO contact_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(hash, (hour + 1) * 3600).first();
    if (limit.count > 3) return blocked('You have reached the hourly enquiry limit. Please call 905-458-5555 or 416-245-4444.');
  }
  let verification;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: input.token, remoteip: ip })
    });
    if (!response.ok) throw new Error();
    verification = await response.json();
  } catch { throw new HttpError(503, 'The spam check is temporarily unavailable. Please try again.'); }
  if (!verification.success || verification.hostname !== new URL(env.PUBLIC_ORIGIN).hostname || verification.action !== 'contact') throw new HttpError(400, 'The spam check expired or failed. Please try again.');
  const inserted = await env.DB.prepare("INSERT OR IGNORE INTO enquiries (id,name,email,phone,material,details) SELECT ?,?,?,?,?,? WHERE (SELECT count(*) FROM enquiries WHERE created_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour')) < 30").bind(input.id, name, email, phone, input.material, details).run();
  if (!inserted.meta.changes) {
    const saved = await env.DB.prepare('SELECT * FROM enquiries WHERE id=?').bind(input.id).first();
    if (!saved) return blocked();
    if (saved.name !== name || saved.email !== email || saved.phone !== phone || saved.details !== details || saved.material !== input.material) {
      throw new HttpError(409, 'This reference was already used. Refresh before sending a new enquiry.');
    }
  }
  if (inserted.meta.changes) {
    // Notification failure never changes the outcome of a successfully saved enquiry.
    try { await notify(env, input.id); } catch { /* Pending state remains visible to admin. */ }
  }
  return json({ success: true, reference: input.id }, 201);
}

// Called only after the shared admin authentication and mutation protection.
export async function enquiries(request, env, parts) {
  if (!env.DB) throw new HttpError(503, 'Database unavailable.');
  const [, id, action] = parts;
  if (!id && request.method === 'GET') {
    const page = Number(new URL(request.url).searchParams.get('page') || 1);
    if (!Number.isInteger(page) || page < 1 || page > 100000) throw new HttpError(400, 'Invalid page.');
    const rows = await env.DB.prepare('SELECT * FROM enquiries ORDER BY created_at DESC, id LIMIT 20 OFFSET ?').bind((page - 1) * 20).all();
    const count = await env.DB.prepare('SELECT count(*) AS total FROM enquiries').first();
    return json({ items: rows.results, total: count.total, page });
  }
  if (!UUID.test(id || '') || parts.length > 3) throw new HttpError(404, 'Enquiry not found.');
  const item = await env.DB.prepare('SELECT id FROM enquiries WHERE id=?').bind(id).first();
  if (!item) throw new HttpError(404, 'Enquiry not found.');
  if (action === 'retry' && request.method === 'POST') {
    await notify(env, id);
    return json({ success: true });
  }
  if (!action && request.method === 'PUT') {
    const { status } = await readJSON(request);
    if (!['New', 'Contacted', 'Closed'].includes(status)) throw new HttpError(400, 'Invalid status.');
    await env.DB.prepare('UPDATE enquiries SET status=? WHERE id=?').bind(status, id).run();
    return json({ success: true });
  }
  throw new HttpError(405, 'Method not allowed.');
}
