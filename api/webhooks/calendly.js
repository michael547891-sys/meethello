import { handleMeetingApi } from '../../server/meetingApi.js';

export const config = { api: { bodyParser: false } };

function readRaw(req) {
  if (typeof req.body === 'string' && req.body) return Promise.resolve(req.body);
  if (req.body && typeof req.body === 'object') return Promise.resolve(JSON.stringify(req.body));
  if (typeof req.on !== 'function') return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const rawBody = await readRaw(req);
  const result = await handleMeetingApi({
    method: req.method,
    pathname: '/api/webhooks/calendly',
    rawBody,
    signature: req.headers['calendly-webhook-signature'] || '',
  });
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result.body));
}
