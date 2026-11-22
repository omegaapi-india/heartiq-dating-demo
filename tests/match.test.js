import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROFILES,
  DEMO_PREFERENCES,
  overlapCount,
  scorePair,
  redactContact,
  starterLines,
  getProfile,
  scoreClass
} from '../lib/match.js';

test('demo ships twelve simulated profiles', () => {
  assert.equal(PROFILES.length, 12);
  assert.equal(new Set(PROFILES.map((profile) => profile.id)).size, 12);
  assert.ok(PROFILES.every((profile) => !profile.photo));
});

test('overlapCount handles safe array input', () => {
  assert.equal(overlapCount(['a', 'b'], ['b', 'c']), 1);
  assert.equal(overlapCount(null, ['a']), 0);
  assert.equal(overlapCount(['a'], null), 0);
});

test('scorePair is deterministic and explainable', () => {
  const profile = getProfile('aanya');
  const first = scorePair(profile, DEMO_PREFERENCES);
  const second = scorePair(profile, DEMO_PREFERENCES);
  assert.deepEqual(first, second);
  assert.equal(first.score, 98);
  assert.ok(first.reasons.length >= 3);
  assert.ok(first.breakdown.values > 0);
});

test('scoreClass maps score bands', () => {
  assert.equal(scoreClass(92), 'score-high');
  assert.equal(scoreClass(65), 'score-mid');
  assert.equal(scoreClass(40), 'score-low');
});

test('redactContact removes email and phone patterns', () => {
  assert.equal(redactContact('Mail me at test@example.com'), 'Mail me at [email]');
  assert.match(redactContact('Call +91 98765 43210'), /\[number\]/);
});

test('starterLines stay redacted and relevant', () => {
  const profile = getProfile('rohan');
  const lines = starterLines(profile, scorePair(profile, DEMO_PREFERENCES));
  assert.ok(lines.length >= 3);
  assert.ok(lines.every((line) => !/@|\+?\d[\d\s-]{7,}/.test(line)));
  assert.ok(lines.some((line) => line.includes('music')));
});
