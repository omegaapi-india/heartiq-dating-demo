// Three-day signed preview lock for every public HeartIQ page and API.
// The cookie holds only a timestamp and a random nonce. No profile choice,
// IP address, email, phone, or message content is stored in the cookie.

const TRIAL_DAYS = 3;
const TRIAL_SECONDS = TRIAL_DAYS * 24 * 60 * 60;
const TRIAL_MS = TRIAL_SECONDS * 1000;
const COOKIE_NAME = 'heartiq_trial';
const CONTACT_EMAIL = 'info@omegaapi.com';
const TELEGRAM = 'https://t.me/Omegaapiofficial';
const ALLOWED_PATHS = ['/trial-ended', '/trial-ended.html', '/trial.css'];

const encoder = new TextEncoder();

function base64UrlEncode(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(input) {
  const normalized = String(input).replace(/-/g, '+').replace(/_/g, '/');
  const remainder = normalized.length % 4;
  const padding = remainder === 0 ? '' : '='.repeat(4 - remainder);
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function keyFor(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function sign(payload, secret) {
  const key = await keyFor(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verify(payload, signature, secret) {
  try {
    const key = await keyFor(secret);
    return await crypto.subtle.verify('HMAC', key, base64UrlDecode(signature), encoder.encode(payload));
  } catch {
    return false;
  }
}

function nonce() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function createTrialToken(secret, issuedAt) {
  const payload = String(issuedAt || Date.now()) + '.' + nonce();
  return payload + '.' + await sign(payload, secret);
}

export async function verifyToken(token, secret) {
  if (!token) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3) return false;

  const issuedAt = Number(parts[0]);
  if (!Number.isSafeInteger(issuedAt) || !parts[1] || !parts[2]) return false;

  const age = Date.now() - issuedAt;
  if (age > TRIAL_MS || age < -60000) return false;

  return verify(parts[0] + '.' + parts[1], parts[2], secret);
}

function readCookie(header, name) {
  if (!header) return null;
  const prefix = name + '=';
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      try {
        return decodeURIComponent(trimmed.slice(prefix.length));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function buildCookie(token, url) {
  const parts = [
    COOKIE_NAME + '=' + encodeURIComponent(token),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + TRIAL_SECONDS
  ];
  if (url.protocol === 'https:') parts.push('Secure');
  return parts.join('; ');
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env || {};
  const url = new URL(request.url);

  if (ALLOWED_PATHS.includes(url.pathname)) return context.next();

  const secret = env.DEMO_TRIAL_SECRET;
  if (!secret) {
    console.warn(JSON.stringify({ message: 'HeartIQ trial secret missing; check skipped' }));
    return context.next();
  }

  const token = readCookie(request.headers.get('cookie'), COOKIE_NAME);

  if (token && !(await verifyToken(token, secret))) {
    if (url.pathname.startsWith('/api/')) {
      return Response.json({
        error: 'Demo preview has ended.',
        contactEmail: CONTACT_EMAIL,
        telegram: TELEGRAM
      }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
    return Response.redirect(new URL('/trial-ended', request.url).toString(), 302);
  }

  const response = await context.next();
  if (!token) response.headers.append('Set-Cookie', buildCookie(await createTrialToken(secret), url));
  return response;
}

export { COOKIE_NAME, TRIAL_SECONDS };
