import { get, put } from '@vercel/blob';

const PATHNAME = 'reservations/list.json';

export async function readReservations() {
  let result;
  try {
    result = await get(PATHNAME, { access: 'private', useCache: false });
  } catch {
    return [];
  }
  if (!result || result.statusCode !== 200 || !result.stream) return [];
  const text = await new Response(result.stream).text();
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeReservations(records) {
  await put(PATHNAME, JSON.stringify(records), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}
