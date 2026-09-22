import { HttpError } from './http.js';
const cache = new Map();
const decode = part => Uint8Array.from(atob(part.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
function config(env) {
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN || '') ||
      !env.ACCESS_AUD || !env.ADMIN_EMAILS || !env.PUBLIC_ORIGIN ||
      Object.values({ aud: env.ACCESS_AUD, email: env.ADMIN_EMAILS, origin: env.PUBLIC_ORIGIN }).some(v => v.includes('REPLACE'))) {
    throw new HttpError(503, 'Admin access has not been configured.');
  }
  return env.ACCESS_TEAM_DOMAIN;
}
async function keys(issuer, kid) {
  let entry = cache.get(issuer);
  if (!entry || Date.now() > entry.expires || (!entry.keys.some(k => k.kid === kid) && Date.now() - entry.fetched > 30000)) {
    const response = await fetch(`${issuer}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new HttpError(503, 'Unable to validate your session. Try again.');
    const data = await response.json();
    if (!Array.isArray(data.keys)) throw new HttpError(503, 'Unable to validate your session.');
    entry = { keys: data.keys, fetched: Date.now(), expires: Date.now() + 300000 };
    cache.set(issuer, entry);
  }
  return entry.keys;
}
export async function authenticate(request, env) {
  const issuer = config(env);
  if (new URL(request.url).origin !== env.PUBLIC_ORIGIN) throw new HttpError(403, 'Open admin on the configured website domain.');
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 16000) throw new HttpError(401, 'Sign in through Cloudflare Access.');
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error();
    const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const payload = JSON.parse(new TextDecoder().decode(decode(parts[1])));
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error();
    const jwk = (await keys(issuer, header.kid)).find(k => k.kid === header.kid && k.kty === 'RSA');
    if (!jwk) throw new Error();
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]))) throw new Error();
    const now = Date.now() / 1000;
    if (payload.iss !== issuer || !Array.isArray(payload.aud) || !payload.aud.includes(env.ACCESS_AUD) ||
        !Number.isFinite(payload.exp) || payload.exp <= now || !Number.isFinite(payload.iat) || payload.iat > now + 30 ||
        (payload.nbf !== undefined && (typeof payload.nbf !== 'number' || payload.nbf > now + 30)) || typeof payload.email !== 'string') throw new Error();
    const email = payload.email.trim().toLowerCase();
    const allowed = env.ADMIN_EMAILS.split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
    if (!allowed.includes(email)) throw new HttpError(403, 'Your account is not approved for this admin.');
    return { email };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, 'Your session is invalid or expired. Sign in again.');
  }
}
export function protectMutation(request, env) {
  if (request.headers.get('origin') !== env.PUBLIC_ORIGIN || request.headers.get('X-FCC-Admin') !== '1' ||
      (request.headers.get('sec-fetch-site') && request.headers.get('sec-fetch-site') !== 'same-origin')) {
    throw new HttpError(403, 'This change must be made from the admin dashboard.');
  }
}
