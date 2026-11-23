export const HOLD_AFTER_START_MS = 10 * 60 * 1000;
export const SPOTLIGHT_MS = 4 * 60 * 1000;
export const QUIET_AROUND_START_MS = 5 * 60 * 1000;

export function bookingStart(item) {
  return item ? Date.parse(item.startTime) : NaN;
}

function bookingCreated(item) {
  const created = Number(item?.created);
  return Number.isFinite(created) ? created : NaN;
}

function sameBooking(left, right) {
  if (left === right) return true;
  const leftId = left?.id;
  const rightId = right?.id;
  return leftId != null && leftId !== '' && leftId === rightId;
}

/** Soonest booking that has not reached start + 10 minutes. */
export function soonestActiveBooking(list, now) {
  let best = null;
  for (const item of Array.isArray(list) ? list : []) {
    const start = bookingStart(item);
    if (!Number.isFinite(start) || start + HOLD_AFTER_START_MS <= now) continue;
    if (!best || start < bookingStart(best)) best = item;
  }
  return best;
}

/**
 * Newest booking added less than 4 minutes before the page opened.
 * Stays off when that add time falls inside another booking's start ± 5 minutes.
 */
export function earlyBooking(list, openedAt) {
  const rows = Array.isArray(list) ? list : [];
  let newest = null;
  for (const item of rows) {
    const created = bookingCreated(item);
    if (!Number.isFinite(created) || created > openedAt || openedAt - created >= SPOTLIGHT_MS) continue;
    if (!newest || created > bookingCreated(newest)) newest = item;
  }
  if (!newest) return null;
  const created = bookingCreated(newest);
  const blocked = rows.some((item) => {
    if (sameBooking(item, newest)) return false;
    const start = bookingStart(item);
    return Number.isFinite(start)
      && created >= start - QUIET_AROUND_START_MS
      && created <= start + QUIET_AROUND_START_MS;
  });
  return blocked ? null : newest;
}

/** List is the one captured when the page opened. `now` only moves the clock. */
export function pickPageBooking(list, now, openedAt) {
  const rows = Array.isArray(list) ? list : [];
  const early = earlyBooking(rows, openedAt);
  if (early && now < bookingCreated(early) + SPOTLIGHT_MS) return early;
  return soonestActiveBooking(rows, now);
}
