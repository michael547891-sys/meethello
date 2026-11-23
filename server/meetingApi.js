import { cancelBooking, listForPage, markVerified, MEET_URL, saveBooking, verifyCalendlySignature } from './bookings.js';
import { localeForClient } from './clientLocale.js';

function readJson(rawBody) {
  try {
    return JSON.parse(rawBody || '{}');
  } catch {
    return {};
  }
}

function headerValue(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] || '';
  return value ? String(value) : '';
}

function currentMeetUrl(headers) {
  const host = headerValue(headers, 'x-forwarded-host') || headerValue(headers, 'host');
  const name = String(host || '').split(',')[0].trim();
  if (!name || name.startsWith('localhost') || name.startsWith('127.0.0.1')) return MEET_URL;
  const proto = headerValue(headers, 'x-forwarded-proto') || 'https';
  return `${proto}://${name}/wdd-fsvi-dmx/`;
}

function withMeetUrl(booking, meetUrl) {
  return booking ? { ...booking, meetUrl } : booking;
}

const SHARED_STORE = 'https://meet.googlejoin.com';

function usesSharedStore() {
  return process.env.VERCEL === '1' && !process.env.BLOB_READ_WRITE_TOKEN;
}

function forwardHeaders(headers, remoteAddress) {
  const forwarded = {};
  for (const name of [
    'x-forwarded-for',
    'x-real-ip',
    'x-vercel-ip-country',
    'x-vercel-ip-city',
    'x-vercel-ip-country-region',
    'x-vercel-ip-latitude',
    'x-vercel-ip-longitude',
    'user-agent',
  ]) {
    const value = headerValue(headers, name);
    if (value) forwarded[name] = value;
  }
  if (!forwarded['x-forwarded-for'] && remoteAddress) forwarded['x-forwarded-for'] = remoteAddress;
  return forwarded;
}

function pageFromShared(page, meetUrl) {
  return {
    ...page,
    booking: withMeetUrl(page.booking, meetUrl),
    bookings: Array.isArray(page.bookings) ? page.bookings.map((item) => withMeetUrl(item, meetUrl)) : [],
    locationGuest: withMeetUrl(page.locationGuest, meetUrl),
    locationBookings: Array.isArray(page.locationBookings) ? page.locationBookings.map((item) => withMeetUrl(item, meetUrl)) : [],
  };
}

async function sharedBookings(headers, remoteAddress, meetUrl) {
  const res = await fetch(`${SHARED_STORE}/api/meetings/next`, {
    headers: forwardHeaders(headers, remoteAddress),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  return { status: 200, body: pageFromShared(await res.json(), meetUrl) };
}

async function sharedPost(pathname, rawBody, signature) {
  const headers = { 'content-type': 'application/json' };
  if (signature) headers['calendly-webhook-signature'] = signature;
  const res = await fetch(`${SHARED_STORE}${pathname}`, {
    method: 'POST',
    headers,
    body: rawBody || '{}',
    signal: AbortSignal.timeout(8000),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

export async function handleMeetingApi({ method, pathname, rawBody = '', signature = '', headers = {}, remoteAddress = '' }) {
  const meetUrl = currentMeetUrl(headers);
  if (method === 'GET' && pathname === '/api/health') {
    return { status: 200, body: { ok: true, meetUrl } };
  }
  if (method === 'GET' && pathname === '/api/locale') {
    return { status: 200, body: await localeForClient(headers, remoteAddress) };
  }
  if (method === 'GET' && pathname === '/api/meetings/next') {
    if (usesSharedStore()) {
      try {
        const shared = await sharedBookings(headers, remoteAddress, meetUrl);
        if (shared) return shared;
      } catch {
        // The shared store did not answer; fall through to the local list.
      }
    }
    const page = await listForPage(Date.now(), { headers, remoteAddress });
    return {
      status: 200,
      body: {
        ...page,
        booking: withMeetUrl(page.booking, meetUrl),
        bookings: Array.isArray(page.bookings) ? page.bookings.map((item) => withMeetUrl(item, meetUrl)) : [],
        locationGuest: withMeetUrl(page.locationGuest, meetUrl),
        locationBookings: Array.isArray(page.locationBookings) ? page.locationBookings.map((item) => withMeetUrl(item, meetUrl)) : [],
      },
    };
  }
  if (method === 'POST' && pathname === '/api/meetings/verify') {
    if (usesSharedStore()) return sharedPost(pathname, rawBody, signature);
    const body = readJson(rawBody);
    const { clientIp } = await import('./clientLocale.js');
    await markVerified(body.id, clientIp(headers, remoteAddress));
    return { status: 200, body: { ok: true } };
  }
  if (method === 'POST' && pathname === '/api/webhooks/calendly') {
    if (usesSharedStore()) {
      const shared = await sharedPost(pathname, rawBody, signature);
      if (shared.body && shared.body.booking) shared.body.booking = withMeetUrl(shared.body.booking, meetUrl);
      if (shared.body) shared.body.meetUrl = meetUrl;
      return shared;
    }
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
    return { status: 200, body: { ok: true, booking, meetUrl } };
  }
  return { status: 404, body: { error: 'Not found' } };
}
