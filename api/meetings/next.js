import { handleMeetingApi } from '../../server/meetingApi.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    const result = await handleMeetingApi({
      method: req.method,
      pathname: '/api/meetings/next',
      headers: req.headers,
      remoteAddress: req.socket?.remoteAddress || '',
    });
    res.statusCode = result.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.body));
  } catch (error) {
    res.statusCode = error.status || 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Booking list failed' }));
  }
}
