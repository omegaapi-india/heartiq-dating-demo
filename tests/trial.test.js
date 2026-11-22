import test from 'node:test';
import assert from 'node:assert/strict';
import { createTrialToken, verifyToken, COOKIE_NAME, TRIAL_SECONDS } from '../functions/_middleware.js';

test('trial lasts exactly three days', () => {
  assert.equal(TRIAL_SECONDS, 3 * 24 * 60 * 60);
  assert.equal(COOKIE_NAME, 'heartiq_trial');
});

test('trial token is signed and timestamped', async () => {
  const now = Date.now();
  const token = await createTrialToken('trial-secret', now);
  const parts = token.split('.');
  assert.equal(parts.length, 3);
  assert.equal(parts[0], String(now));
  assert.match(parts[1], /^[A-Za-z0-9_-]+$/);
  assert.match(parts[2], /^[A-Za-z0-9_-]+$/);
});

test('same timestamp still gives different tokens because of nonce', async () => {
  const a = await createTrialToken('trial-secret', 1000);
  const b = await createTrialToken('trial-secret', 1000);
  assert.notEqual(a, b);
});

test('valid token verifies and tampered token fails', async () => {
  const token = await createTrialToken('trial-secret', Date.now());
  assert.equal(await verifyToken(token, 'trial-secret'), true);
  assert.equal(await verifyToken(token, 'other-secret'), false);
  assert.equal(await verifyToken(token.slice(0, -2) + 'xx', 'trial-secret'), false);
  assert.equal(await verifyToken('', 'trial-secret'), false);
});
