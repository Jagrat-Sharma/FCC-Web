import { authenticate } from './auth.js';
import { failure, HttpError } from './http.js';
export async function handleAdmin({ request, env }) {
  try {
    await authenticate(request, env);
    if (!['GET', 'HEAD'].includes(request.method)) throw new HttpError(405, 'Method not allowed.');
    const url = new URL(request.url);
    if (url.pathname === '/admin') return Response.redirect(url.origin + '/admin/', 302);
    // Asset service bypasses Functions; no recursive request to this handler.
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    return new Response(response.body, { status: response.status, headers });
  } catch (error) { return failure(error); }
}
