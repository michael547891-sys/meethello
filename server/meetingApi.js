import { cancelBooking, listForPage, markVerified, MEET_URL, saveBooking, verifyCalendlySignature } from './bookings.js';
import { localeForClient } from './clientLocale.js';

function readJson(rawBody) {
  try {
    return JSON.parse(rawBody || '{}');
  } catch {
    return {};
  }
}

export async function handleMeetingApi({ method, pathname, rawBody = '', signature = '', headers = {}, remoteAddress = '' }) {
  if (method === 'GET' && pathname === '/api/health') {
    return { status: 200, body: { ok: true, meetUrl: MEET_URL } };
  }
  if (method === 'GET' && pathname === '/api/locale') {
    return { status: 200, body: await localeForClient(headers, remoteAddress) };
  }
  if (method === 'GET' && pathname === '/api/meetings/next') {
    const page = await listForPage(Date.now(), { headers, remoteAddress });
    return { status: 200, body: page };
  }
  if (method === 'POST' && pathname === '/api/meetings/verify') {
    const body = readJson(rawBody);
    const { clientIp } = await import('./clientLocale.js');
    await markVerified(body.id, clientIp(headers, remoteAddress));
    return { status: 200, body: { ok: true } };
  }
  if (method === 'POST' && pathname === '/api/webhooks/calendly') {
    if (!verifyCalendlySignature(rawBody, signature)) {
      return { status: 401, body: { error: 'Invalid Calendly signature' } };
    }
    const message = readJson(rawBody);
    const payload = message.payload;
    if (!payload) return { status: 400, body: { error: 'Missing payload' } };
    if (message.event === 'invitee.canceled') {
      await cancelBooking(payload);
      return { status: 200, body: { ok: true, canceled: true } };
    }
    if (message.event && message.event !== 'invitee.created') {
      return { status: 200, body: { ok: true, ignored: true } };
    }
    const booking = await saveBooking(payload);
    return { status: 200, body: { ok: true, booking, meetUrl: MEET_URL } };
  }
  return { status: 404, body: { error: 'Not found' } };
}
