import { createHmac, timingSafeEqual } from 'node:crypto';
import { readReservations, writeReservations } from './blobStore.js';
import { lookupCity, lookupVisitor } from './placeLookup.js';
import { chooseLocation } from './placeMatch.js';
import { GRACE_MS, MEET_URL, keptRecords, publicBooking, recordFromPayload, upcomingBookings } from './reservationRules.js';

export { MEET_URL };

function liveStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function rememberPlaces(records) {
  let dirty = false;
  let looked = 0;
  for (const record of records) {
    if (!record || record.canceled || record.place || !record.city || looked >= 4) continue;
    looked += 1;
    const place = await lookupCity(record.city, record.country);
    if (!place) continue;
    record.place = place;
    dirty = true;
  }
  return dirty;
}

async function loadRecords() {
  if (liveStore()) {
    const raw = await readReservations();
    const records = keptRecords(raw);
    const dirty = await rememberPlaces(records);
    if (dirty || records.length !== raw.length) await writeReservations(records);
    return records;
  }
  let local;
  try {
    local = await import('./localBookings.js');
  } catch {
    return [];
  }
  if (!local.localRecords) return [];
  const records = local.localRecords();
  const dirty = await rememberPlaces(records);
  if (dirty) records.forEach((record) => local.saveLocalBooking(record));
  return records;
}

export async function saveBooking(payload) {
  const record = recordFromPayload(payload);
  record.place = await lookupCity(record.city, record.country);
  if (liveStore()) {
    const records = keptRecords(await readReservations());
    const index = records.findIndex((item) => item.uri === record.uri);
    if (index === -1) records.push({ ...record, created: Date.now() });
    else records[index] = { ...records[index], ...record, created: records[index].created || Date.now(), verified: records[index].verified, verifiedIp: records[index].verifiedIp, matched: records[index].matched };
    await writeReservations(records);
    return record;
  }
  const local = await import('./localBookings.js');
  return local.saveLocalBooking(record);
}

export async function cancelBooking(payload) {
  const uri = String(payload?.uri || '');
  if (!uri) return;
  if (liveStore()) {
    const records = keptRecords(await readReservations());
    await writeReservations(records.map((item) => (item.uri === uri ? { ...item, canceled: 1 } : item)));
    return;
  }
  const local = await import('./localBookings.js');
  local.cancelLocalBooking(uri);
}

async function markRecord(uri, change) {
  if (!uri) return;
  if (liveStore()) {
    const records = keptRecords(await readReservations());
    await writeReservations(records.map((item) => (item.uri === uri ? { ...item, ...change } : item)));
    return;
  }
  const local = await import('./localBookings.js');
  local.markLocalBooking(uri, change);
}

export async function markVerified(uri, ip) {
  await markRecord(uri, { verified: 1, verifiedIp: String(ip || '') });
}

export async function listForPage(now = Date.now(), context = {}) {
  const records = await loadRecords();
  const bookings = records
    .filter((record) => record && !record.canceled && Number(record.start) + GRACE_MS > now)
    .sort((left, right) => left.start - right.start)
    .map((record) => publicBooking(record));
  const visitor = await lookupVisitor(context.headers || {}, context.remoteAddress || '');
  const { guest, count, guests } = chooseLocation(records.filter((record) => record && !record.canceled), visitor, now);
  return {
    booking: bookings[0] || null,
    bookings,
    locationGuest: count === 1 ? publicBooking(guest) : null,
    locationBookings: count > 1 ? guests.map((record) => publicBooking(record)) : [],
  };
}

export async function listUpcoming(now = Date.now()) {
  const page = await listForPage(now);
  return page.bookings;
}

export async function nextBooking(now = Date.now()) {
  const list = await listUpcoming(now);
  return list[0] || null;
}

export { upcomingBookings };

export function verifyCalendlySignature(rawBody, header) {
  const secret = process.env.CALENDLY_WEBHOOK_SECRET;
  if (!secret) return true;
  const parts = Object.fromEntries(String(header || '').split(',').map((piece) => {
    const index = piece.indexOf('=');
    return index === -1 ? [piece, ''] : [piece.slice(0, index).trim(), piece.slice(index + 1).trim()];
  }));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const age = Math.abs(Date.now() - Number(timestamp) * 1000);
  if (!Number.isFinite(age) || age > 3 * 60 * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}
