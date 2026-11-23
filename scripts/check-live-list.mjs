import { readFileSync } from 'node:fs';

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const index = line.indexOf('=');
  if (index < 1 || line.startsWith('#')) continue;
  const key = line.slice(0, index);
  let value = line.slice(index + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

const { saveBooking, cancelBooking, nextBooking, MEET_URL } = await import('../server/bookings.js');
const uri = 'https://calendly.example/invitees/live-check';
const start = new Date(Date.now() - 60 * 1000).toISOString();
const saved = await saveBooking({
  uri,
  email: 'kail@gmail.com',
  name: 'Kail',
  questions_and_answers: [{ question: 'Organization', answer: 'Michael' }],
  scheduled_event: {
    name: 'Simulated meeting',
    start_time: start,
    end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
});
const next = await nextBooking();
await cancelBooking({ uri });
const after = await nextBooking();
console.log(JSON.stringify({
  meetUrl: MEET_URL,
  savedOrg: saved.organization,
  nextOrg: next && next.organization,
  cleared: after === null,
}));
