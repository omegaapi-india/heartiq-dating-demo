import { redactContact } from './match.js';

export function buildModelPrompt(profile, result) {
  const safe = {
    name: String(profile?.name || 'Demo profile').slice(0, 60),
    age: Number(profile?.age) || 0,
    city: String(profile?.city || 'Demo area').slice(0, 60),
    prompt: redactContact(profile?.promptQ || '').slice(0, 200),
    answer: redactContact(profile?.promptA || '').slice(0, 400),
    values: Array.isArray(profile?.values) ? profile.values.slice(0, 6) : [],
    interests: Array.isArray(profile?.interests) ? profile.interests.slice(0, 6) : [],
    reasons: Array.isArray(result?.reasons) ? result.reasons.slice(0, 4).map((item) => redactContact(item).slice(0, 160)) : []
  };

  return [
    'You are writing polite, low-pressure opening lines for a dating compatibility demo.',
    'Use only the facts below. Never invent contact details, photos, locations, or private information.',
    'Return four short lines as a JSON object: {"lines":["...","...","...","..."]}.',
    'Keep each line under 140 characters. Do not mention that this is a prompt or a model.',
    '',
    'Profile facts:',
    JSON.stringify(safe)
  ].join('\n');
}

export function validateCloudConfig(endpoint, model, key) {
  let url;
  try {
    url = new URL(String(endpoint || '').trim());
  } catch {
    throw new Error('Enter a valid HTTPS endpoint.');
  }

  if (url.protocol !== 'https:') throw new Error('The cloud endpoint must use HTTPS.');
  if (url.username || url.password) throw new Error('Do not put credentials in the endpoint URL.');

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const blockedHosts = ['localhost', '127.0.0.1', '::1', '[::1]'];
  if (blockedHosts.includes(host) || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Private hosts are not allowed. Use a public HTTPS endpoint.');
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (a === 10 || a === 127 || a === 169 && b === 254 || a === 192 && b === 168 || a === 172 && b >= 16 && b <= 31 || a === 0) {
      throw new Error('Private hosts are not allowed. Use a public HTTPS endpoint.');
    }
  }

  const cleanModel = String(model || '').trim().slice(0, 80);
  if (cleanModel.length < 1) throw new Error('Enter a model name.');

  const cleanKey = String(key || '').trim();
  if (cleanKey.length < 8 || cleanKey.length > 300) throw new Error('Enter your own API key.');

  return { endpoint: url.toString().replace(/\/$/, ''), model: cleanModel, key: cleanKey };
}

export function extractLines(text, count = 4) {
  const raw = String(text || '').trim();
  if (!raw) return ['Ask one calm question about something you both enjoy.'];

  let payload = null;
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    payload = JSON.parse(cleaned);
  } catch {
    payload = null;
  }

  let candidates = [];
  if (Array.isArray(payload?.lines)) candidates = payload.lines;
  else if (Array.isArray(payload?.suggestions)) candidates = payload.suggestions;
  else candidates = raw.split(/\r?\n/);

  const lines = candidates
    .map((item) => redactContact(typeof item === 'string' ? item : item?.text || '').trim())
    .map((item) => item.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter((item) => item.length >= 8 && item.length <= 240)
    .slice(0, Math.max(1, Math.min(8, count)));

  if (!lines.length) return ['Ask one calm question about something you both enjoy.'];
  return lines;
}

export function redactForModel(text) {
  return redactContact(text).slice(0, 4000);
}
