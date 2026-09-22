export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'
  }});
}
export async function boundedBody(request, limit) {
  const size = Number(request.headers.get('content-length'));
  if (size > limit) throw new HttpError(413, 'File or request is too large.');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = []; let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) { await reader.cancel(); throw new HttpError(413, 'File or request is too large.'); }
    chunks.push(value);
  }
  const result = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
export async function readJSON(request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new HttpError(415, 'Send application/json.');
  try {
    const value = JSON.parse(new TextDecoder().decode(await boundedBody(request, 24000)));
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error();
    return value;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'Invalid JSON object.');
  }
}
export function failure(error) {
  if (!(error instanceof HttpError)) console.error('CMS request failed', error?.name);
  return json({ error: error instanceof HttpError ? error.message : 'Service unavailable. Please try again.' }, error instanceof HttpError ? error.status : 503);
}
