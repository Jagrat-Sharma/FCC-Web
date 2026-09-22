import { mediaResponse } from '../../server/api.js';
import { failure } from '../../server/http.js';
export async function onRequest({ request, env, params }) {
  try { return await mediaResponse(request, env, params.id); }
  catch (error) { return failure(error); }
}
