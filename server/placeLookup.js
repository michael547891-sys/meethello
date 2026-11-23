import { clientIp } from './clientLocale.js';

const cache = new Map();

function headerValue(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] || '';
  return value ? String(value) : '';
}

function decodeHeader(value) {
  try {
    return decodeURIComponent(String(value || '').replace(/\+/g, ' ')).trim();
  } catch {
    return String(value || '').trim();
  }
}

function placeFromAddress(address, lat, lon, box) {
  const city = address.city || address.town || address.village || address.municipality || address.hamlet || '';
  const region = address.state || address.region || address.county || '';
  return {
    countryCode: String(address.country_code || address.countryCode || '').toUpperCase(),
    country: address.country || '',
    city,
    region,
    lat,
    lon,
    box,
    majorCity: address.city || address.town || region,
  };
}

export async function lookupCity(city, country) {
  const label = [city, country].map((part) => String(part || '').trim()).filter(Boolean).join(', ');
  if (!label) return null;
  const key = label.toLowerCase();
  if (cache.has(key)) return cache.get(key);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(label)}`, {
      headers: { 'User-Agent': 'meet-prejoin/1.0', 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const hit = Array.isArray(rows) ? rows[0] : null;
    if (!hit) {
      cache.set(key, null);
      return null;
    }
    const box = Array.isArray(hit.boundingbox) ? hit.boundingbox.map(Number) : null;
    const place = placeFromAddress(hit.address || {}, Number(hit.lat), Number(hit.lon), box);
    if (country && /^[A-Za-z]{2}$/.test(country) && !place.countryCode) place.countryCode = country.toUpperCase();
    cache.set(key, place);
    return place;
  } catch {
    return null;
  }
}

export async function lookupVisitor(headers = {}, remoteAddress = '') {
  const country = (headerValue(headers, 'x-vercel-ip-country') || headerValue(headers, 'cf-ipcountry')).toUpperCase();
  const city = decodeHeader(headerValue(headers, 'x-vercel-ip-city'));
  const region = decodeHeader(headerValue(headers, 'x-vercel-ip-country-region'));
  const lat = Number(headerValue(headers, 'x-vercel-ip-latitude'));
  const lon = Number(headerValue(headers, 'x-vercel-ip-longitude'));
  if (country && country !== 'XX' && country !== 'T1' && city) {
    const headerPlace = { countryCode: country, country, city, region, lat, lon, box: null, majorCity: city };
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      const found = await lookupCity(city, country);
      return found ? { ...found, countryCode: found.countryCode || country } : headerPlace;
    }
    return headerPlace;
  }
  const ip = clientIp(headers, remoteAddress);
  const key = `ip:${ip || 'self'}`;
  if (cache.has(key)) return cache.get(key);
  try {
    const url = ip ? `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json` : 'https://get.geojs.io/v1/ip/geo.json';
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    const place = {
      countryCode: String(data.country_code || data.country || country || '').toUpperCase(),
      country: data.country || '',
      city: data.city || city || '',
      region: data.region || region || '',
      lat: Number(data.latitude),
      lon: Number(data.longitude),
      box: null,
      majorCity: data.city || '',
    };
    if (!place.countryCode || !place.city) return null;
    cache.set(key, place);
    return place;
  } catch {
    return null;
  }
}
