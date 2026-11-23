const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const NEAR_KM = 150;
export const LOCK_WINDOW_MS = 10 * 60 * 1000;

export function normalizePlace(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sameText(left, right) {
  const a = normalizePlace(left);
  const b = normalizePlace(right);
  return Boolean(a && b && a === b);
}

function countryKey(place) {
  return normalizePlace(place?.countryCode || place?.country);
}

function sameCountry(booked, visitor) {
  const left = countryKey(booked?.place || booked);
  const right = countryKey(visitor);
  return Boolean(left && right && left === right);
}

function pointInside(place, area) {
  const box = area?.box;
  if (!box || !Number.isFinite(place?.lat) || !Number.isFinite(place?.lon)) return false;
  const [south, north, west, east] = box;
  return place.lat >= south && place.lat <= north && place.lon >= west && place.lon <= east;
}

/** Same country, and the real places agree even when the typed city is wrong. */
export function placesMatch(booked, visitor) {
  if (!booked || !visitor || !sameCountry(booked, visitor)) return false;
  if (sameText(booked.city, visitor.city)) return true;
  if (sameText(booked.region, visitor.city) || sameText(booked.region, visitor.region)) return true;
  if (pointInside(booked, visitor) || pointInside(visitor, booked)) return true;
  if (sameText(booked.majorCity, visitor.city) || sameText(booked.majorCity, visitor.region)) return true;
  return false;
}

export function distanceKm(left, right) {
  if (!Number.isFinite(left?.lat) || !Number.isFinite(left?.lon) || !Number.isFinite(right?.lat) || !Number.isFinite(right?.lon)) return Infinity;
  const radius = 6371;
  const lat1 = left.lat * Math.PI / 180;
  const lat2 = right.lat * Math.PI / 180;
  const dLat = lat2 - lat1;
  const dLon = (right.lon - left.lon) * Math.PI / 180;
  const chord = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(chord)));
}

/** One guest, or the same-country group. Several country names stay a group for the time rule. */
export function chooseLocation(records, visitor, now = Date.now()) {
  const rows = (Array.isArray(records) ? records : []).filter((record) => record && !record.canceled);
  if (!visitor) return { guest: null, count: 0, guests: [] };
  const countryHits = rows.filter((record) => sameCountry(record, visitor));
  const placeHits = countryHits.filter((record) => placesMatch(record.place || { country: record.country, city: record.city }, visitor));
  if (placeHits.length === 1) return { guest: placeHits[0], count: 1, guests: placeHits };
  const nearHits = countryHits.filter((record) => distanceKm(record.place, visitor) <= NEAR_KM);
  if (placeHits.length === 0 && nearHits.length === 1) return { guest: nearHits[0], count: 1, guests: nearHits };
  const futureHits = countryHits.filter((record) => {
    const start = Number(record.start);
    return Number.isFinite(start) && start >= now;
  });
  if (placeHits.length === 0 && nearHits.length === 0 && futureHits.length === 1) {
    return { guest: futureHits[0], count: 1, guests: futureHits };
  }
  if (countryHits.length > 1) return { guest: null, count: countryHits.length, guests: countryHits };
  return { guest: null, count: 0, guests: [] };
}

export function withinLockWindow(start, now) {
  return Number.isFinite(start) && Math.abs(now - start) <= LOCK_WINDOW_MS;
}

export function withinRetention(created, now = Date.now()) {
  const saved = Number(created);
  if (!Number.isFinite(saved) || saved <= 0) return false;
  return saved + WEEK_MS > now;
}

export { WEEK_MS };
