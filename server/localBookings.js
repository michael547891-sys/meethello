import { mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withinRetention } from './placeMatch.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'bookings.sqlite'));
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY,
    calendly_uri TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT NOT NULL DEFAULT '',
    event_name TEXT NOT NULL DEFAULT '',
    start_ms INTEGER NOT NULL,
    end_ms INTEGER,
    canceled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

for (const [name, type] of [
  ['country', 'TEXT NOT NULL DEFAULT \'\''],
  ['city', 'TEXT NOT NULL DEFAULT \'\''],
  ['extra', 'TEXT NOT NULL DEFAULT \'\''],
  ['verified', 'INTEGER NOT NULL DEFAULT 0'],
  ['verified_ip', 'TEXT NOT NULL DEFAULT \'\''],
  ['matched', 'INTEGER NOT NULL DEFAULT 0'],
  ['place_json', 'TEXT NOT NULL DEFAULT \'\''],
]) {
  try {
    db.exec(`ALTER TABLE bookings ADD COLUMN ${name} ${type}`);
  } catch {
    // Column already exists.
  }
}

function parsePlace(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function rowToRecord(row) {
  const created = Date.parse(row.created_at) || row.start_ms;
  return {
    uri: row.calendly_uri,
    name: row.name,
    email: row.email,
    organization: row.organization,
    eventName: row.event_name,
    start: row.start_ms,
    end: row.end_ms,
    canceled: row.canceled,
    created,
    country: row.country || '',
    city: row.city || '',
    extra: row.extra ? parsePlace(row.extra) : { answers: [] },
    verified: row.verified || 0,
    verifiedIp: row.verified_ip || '',
    matched: row.matched || 0,
    place: parsePlace(row.place_json),
  };
}

export function saveLocalBooking(record) {
  db.prepare(`
    INSERT INTO bookings (
      calendly_uri, name, email, organization, event_name, start_ms, end_ms, canceled, created_at,
      country, city, extra, verified, verified_ip, matched, place_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 0, '', 0, ?)
    ON CONFLICT(calendly_uri) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      organization = excluded.organization,
      event_name = excluded.event_name,
      start_ms = excluded.start_ms,
      end_ms = excluded.end_ms,
      canceled = 0,
      country = excluded.country,
      city = excluded.city,
      extra = excluded.extra,
      place_json = CASE WHEN excluded.place_json != '' THEN excluded.place_json ELSE place_json END
  `).run(
    record.uri,
    record.name,
    record.email,
    record.organization,
    record.eventName,
    record.start,
    record.end,
    new Date(record.created || Date.now()).toISOString(),
    record.country || '',
    record.city || '',
    JSON.stringify(record.extra || { answers: [] }),
    record.place ? JSON.stringify(record.place) : '',
  );
  return record;
}

export function cancelLocalBooking(uri) {
  db.prepare('UPDATE bookings SET canceled = 1 WHERE calendly_uri = ?').run(uri);
}

export function markLocalBooking(uri, change) {
  if (change.verified) {
    db.prepare('UPDATE bookings SET verified = 1, verified_ip = ? WHERE calendly_uri = ?').run(change.verifiedIp || '', uri);
  }
  if (change.matched) {
    db.prepare('UPDATE bookings SET matched = 1 WHERE calendly_uri = ?').run(uri);
  }
}

export function localRecords(now = Date.now()) {
  const cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('DELETE FROM bookings WHERE created_at < ?').run(cutoff);
  return db.prepare(`
    SELECT calendly_uri, name, email, organization, event_name, start_ms, end_ms, canceled, created_at,
      country, city, extra, verified, verified_ip, matched, place_json
    FROM bookings
  `).all()
    .map(rowToRecord)
    .filter((record) => withinRetention(record.created, now));
}
