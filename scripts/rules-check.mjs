import { recordFromPayload } from '../server/reservationRules.js';
import { pickPageBooking } from '../src/bookingDisplay.js';

const checks = [];
function check(name, ok) {
  checks.push(name);
  if (!ok) throw new Error(name);
}

const record = recordFromPayload({
  uri: 'invitee-bruno',
  email: 'bruno@example.com',
  name: 'Bruno',
  timezone: 'America/Sao_Paulo',
  scheduled_event: { start_time: '2026-11-16T12:00:00.000Z', name: '30 Minute Meeting' },
  questions_and_answers: [
    { question: 'Country', answer: 'Brazil' },
    { question: 'City', answer: 'Campinas' },
    { question: 'Company', answer: 'North' },
  ],
});
check('saves country city and extra', record.country === 'Brazil' && record.city === 'Campinas' && record.extra.answers.length === 3);

function row(id, start, extra = {}) {
  return { id, startTime: new Date(start).toISOString(), created: extra.created || start - 60 * 60 * 1000, ...extra };
}

const now = Date.parse('2026-11-16T04:00:00.000Z');
const ken = row('ken', Date.parse('2026-11-16T08:00:00.000Z'));
check('time rule shows the soonest booking', pickPageBooking([ken, row('later', Date.parse('2026-11-16T10:00:00.000Z'))], now, now).id === 'ken');

const opened = Date.parse('2026-11-16T04:00:00.000Z');
const added = Date.parse('2026-11-16T03:59:22.000Z');
const k = row('k', Date.parse('2026-11-16T11:00:00.000Z'), { created: added });
const m = row('m', Date.parse('2026-11-16T06:00:00.000Z'), { created: added - 60 * 60 * 1000 });
check('new open shows the 4 minute name', pickPageBooking([m, k], opened, opened).id === 'k');
check('the name stays through the 4 minutes', pickPageBooking([m, k], added + 2 * 60 * 1000, opened).id === 'k');
check('after 4 minutes the order returns', pickPageBooking([m, k], added + 4 * 60 * 1000, opened).id === 'm');

const { chooseLocation, withinLockWindow } = await import('../server/placeMatch.js');
const visitor = { countryCode: 'BR', city: 'Sao Paulo', region: 'Sao Paulo', lat: -23.55, lon: -46.63, box: [-24.0, -23.2, -47.0, -46.2] };
const campinas = { countryCode: 'BR', city: 'Campinas', region: 'Sao Paulo', lat: -22.9, lon: -47.06, majorCity: 'Campinas' };
const nearby = { countryCode: 'BR', city: 'Santos', region: 'Sao Paulo', lat: -23.96, lon: -46.33, majorCity: 'Santos' };
const tokyo = { countryCode: 'JP', city: 'Tokyo', region: 'Tokyo', lat: 35.68, lon: 139.69 };
check('one place match is kept', chooseLocation([{ place: campinas, canceled: 0, name: 'Bruno' }], visitor).guest.name === 'Bruno');
const countryGroup = chooseLocation([{ place: campinas, name: 'Luis' }, { place: nearby, name: 'Rita' }, { place: tokyo, name: 'Hana' }], visitor);
check('two place matches are not kept', countryGroup.guest === null);
check('several country names stay the group', countryGroup.guests.map((item) => item.name).sort().join() === 'Luis,Rita');
check('no place match can use 150 km', chooseLocation([{ place: { countryCode: 'BR', city: 'Jundiai', region: 'Interior', lat: -23.19, lon: -46.88 } }], visitor).guest !== null);
check('a far city in another country does not match', chooseLocation([{ place: tokyo }], visitor).count === 0);
const futureNow = Date.parse('2026-11-16T04:00:00.000Z');
const recife = { countryCode: 'BR', city: 'Recife', region: 'Pernambuco', lat: -8.05, lon: -34.9 };
check('one future booking in the same country is kept', chooseLocation([
  { place: recife, name: 'Mina', start: Date.parse('2026-11-16T08:00:00.000Z') },
  { place: tokyo, name: 'Ken', start: Date.parse('2026-11-16T09:00:00.000Z') },
], visitor, futureNow).guest.name === 'Mina');
check('two future bookings in the same country are not kept', chooseLocation([
  { place: recife, name: 'Mina', start: Date.parse('2026-11-16T08:00:00.000Z') },
  { place: { ...recife, city: 'Fortaleza' }, name: 'Lucas', start: Date.parse('2026-11-16T12:00:00.000Z') },
], visitor, futureNow).guest === null);
check('a past booking in the same country is not the future match', chooseLocation([
  { place: recife, name: 'Mina', start: Date.parse('2026-11-16T03:00:00.000Z') },
], visitor, futureNow).guest === null);
check('a pass at 5:55 can be saved', withinLockWindow(Date.parse('2026-11-16T06:00:00.000Z'), Date.parse('2026-11-16T05:55:00.000Z')));
check('a pass at 5:40 is not saved', !withinLockWindow(Date.parse('2026-11-16T06:00:00.000Z'), Date.parse('2026-11-16T05:40:00.000Z')));

console.log(`${checks.length} checks passed`);
