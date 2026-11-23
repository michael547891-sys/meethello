import { handleMeetingApi } from '../server/meetingApi.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const result = await handleMeetingApi({ method: req.method, pathname: '/api/health' });
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result.body));
}
