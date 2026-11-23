import { localeFromCountry } from '../src/locale.js';

function headerValue(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] || '';
  return value ? String(value) : '';
}

function publicIp(ip) {
  const value = String(ip || '').replace(/^::ffff:/, '').trim();
  if (!value || value === '127.0.0.1' || value === '::1') return '';
  if (value.startsWith('10.') || value.startsWith('192.168.') || value.startsWith('169.254.')) return '';
  const match = value.match(/^172\.(\d+)\./);
  if (match && Number(match[1]) >= 16 && Number(match[1]) <= 31) return '';
  return value;
}

export function clientIp(headers, remoteAddress) {
  const forwarded = headerValue(headers, 'x-forwarded-for').split(',')[0].trim();
  return publicIp(forwarded) || publicIp(headerValue(headers, 'x-real-ip')) || publicIp(remoteAddress);
}

let remembered = null;
let rememberedAt = 0;

async function countryFromService(ip) {
  const encoded = ip ? `/${encodeURIComponent(ip)}` : '';
  const attempts = [
    fetch(`https://get.geojs.io/v1/ip/country${encoded}`, { cache: 'no-store', signal: AbortSignal.timeout(4000) })
      .then(async (res) => (res.ok ? (await res.text()).trim() : '')),
    fetch(`https://api.country.is${encoded}`, { cache: 'no-store', signal: AbortSignal.timeout(4000) })
      .then(async (res) => (res.ok ? (await res.json())?.country || '' : '')),
  ];
  try {
    const country = await Promise.any(attempts.map(async (attempt) => {
      const value = String(await attempt || '').trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(value)) throw new Error('no country');
      return value;
    }));
    return country;
  } catch {
    return '';
  }
}

export async function localeForClient(headers = {}, remoteAddress = '') {
  const headerCountry = (headerValue(headers, 'x-vercel-ip-country') || headerValue(headers, 'cf-ipcountry')).toUpperCase();
  if (headerCountry && headerCountry !== 'XX' && headerCountry !== 'T1') {
    return { locale: localeFromCountry(headerCountry) || 'en', country: headerCountry };
  }
  const ip = clientIp(headers, remoteAddress);
  if (!ip && remembered && Date.now() - rememberedAt < 10 * 60 * 1000) return remembered;
  try {
    const country = await countryFromService(ip);
    const result = { locale: localeFromCountry(country) || 'en', country };
    if (!ip && country) {
      remembered = result;
      rememberedAt = Date.now();
    }
    return result;
  } catch {
    return { locale: 'en', country: '' };
  }
}
