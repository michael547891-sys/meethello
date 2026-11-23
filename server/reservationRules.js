import { withinRetention } from './placeMatch.js';

export const GRACE_MS = 24 * 60 * 60 * 1000;
export const MEET_URL = (process.env.MEET_URL || 'https://meet.googlejoin.com/wdd-fsvi-dmx').replace(/\/?$/, '/');

export const ORGANIZATION_NAME = 'Michael';

export function organizationFrom() {
  return ORGANIZATION_NAME;
}

export function inviteeName(payload) {
  const full = String(payload.name || '').trim();
  if (full) return full;
  const joined = [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim();
  return joined || 'Guest';
}

const ANSWER_COUNTRY = ['country', 'nation', 'país', 'pais', 'pays'];
const ANSWER_CITY = ['city', 'town', 'cidade', 'ciudad', 'ville'];

function answerFor(payload, words) {
  const rows = Array.isArray(payload?.questions_and_answers) ? payload.questions_and_answers : [];
  for (const row of rows) {
    const question = String(row?.question || '').toLowerCase();
    if (words.some((word) => question.includes(word))) return String(row?.answer || '').trim();
  }
  return '';
}

export function recordFromPayload(payload) {
  const scheduled = payload.scheduled_event && typeof payload.scheduled_event === 'object'
    ? payload.scheduled_event
    : {};
  const start = Date.parse(scheduled.start_time || payload.start_time || '');
  if (!Number.isFinite(start)) {
    const error = new Error('Booking is missing a start time');
    error.status = 422;
    throw error;
  }
  const end = Date.parse(scheduled.end_time || '');
  const eventName = String(scheduled.name || '').trim();
  const answers = (Array.isArray(payload.questions_and_answers) ? payload.questions_and_answers : [])
    .map((row) => ({ question: String(row?.question || '').trim(), answer: String(row?.answer || '').trim() }))
    .filter((row) => row.question || row.answer);
  const record = {
    uri: String(payload.uri || `${payload.email}-${start}`),
    name: inviteeName(payload),
    email: String(payload.email || '').trim(),
    organization: organizationFrom(payload, eventName),
    eventName,
    start,
    end: Number.isFinite(end) ? end : null,
    canceled: 0,
    country: answerFor(payload, ANSWER_COUNTRY),
    city: answerFor(payload, ANSWER_CITY),
    extra: {
      answers,
      timezone: String(payload.timezone || '').trim(),
    },
    verified: 0,
    verifiedIp: '',
    matched: 0,
    place: null,
  };
  if (!record.email) {
    const error = new Error('Booking is missing an email');
    error.status = 422;
    throw error;
  }
  return record;
}

export function publicBooking(record) {
  if (!record) return null;
  return {
    id: String(record.uri || record.id || ''),
    name: record.name,
    email: record.email,
    organization: ORGANIZATION_NAME,
    eventName: record.eventName,
    startTime: new Date(record.start).toISOString(),
    created: Number(record.created) || Number(record.start) || 0,
    meetUrl: MEET_URL,
  };
}

export function keptRecords(records, now = Date.now()) {
  return records.filter((record) => record && withinRetention(record.created, now));
}

export function upcomingBookings(records, now = Date.now()) {
  return records
    .filter((record) => record && !record.canceled && Number(record.start) + GRACE_MS > now)
    .sort((left, right) => left.start - right.start)
    .map((record) => publicBooking(record));
}

export function selectNext(records, now = Date.now()) {
  return upcomingBookings(records, now)[0] || null;
}
