import { handleMeetingApi } from '../../server/meetingApi.js';

export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  const result = await handleMeetingApi({
    method: req.method,
    pathname: '/api/meetings/verify',
    rawBody: await readRaw(req),
    headers: req.headers,
    remoteAddress: req.socket?.remoteAddress || '',
  });
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result.body));
}
