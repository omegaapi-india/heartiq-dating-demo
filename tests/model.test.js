import test from 'node:test';
import assert from 'node:assert/strict';
import { buildModelPrompt, validateCloudConfig, extractLines, redactForModel } from '../lib/model.js';

test('cloud config requires public HTTPS', () => {
  const ok = validateCloudConfig('https://api.example.com/v1/', 'demo-model', 'abc123456');
  assert.equal(ok.endpoint, 'https://api.example.com/v1');
  assert.equal(ok.model, 'demo-model');

  assert.throws(() => validateCloudConfig('http://api.example.com/v1', 'm', 'abc123456'), /HTTPS/);
  assert.throws(() => validateCloudConfig('https://user:pass@api.example.com/v1', 'm', 'abc123456'), /credentials/);
  assert.throws(() => validateCloudConfig('https://127.0.0.1/v1', 'm', 'abc123456'), /Private hosts/);
  assert.throws(() => validateCloudConfig('https://api.example.com/v1', 'm', 'short'), /API key/);
});

test('model prompt redacts contact details', () => {
  const prompt = buildModelPrompt(
    { name: 'Test', promptA: 'Email test@example.com or call +91 98765 43210' },
    { reasons: ['Contact test@example.com first'] }
  );
  assert.match(prompt, /\[email\]/);
  assert.match(prompt, /\[number\]/);
  assert.doesNotMatch(prompt, /test@example\.com/);
});

test('extractLines parses JSON and plain text', () => {
  assert.deepEqual(extractLines('{"lines":["Ask about music.","Share a calm plan."]}'), ['Ask about music.', 'Share a calm plan.']);
  assert.deepEqual(extractLines('1. Ask about books.\n2. Share a calm plan.'), ['Ask about books.', 'Share a calm plan.']);
  assert.equal(extractLines('', 2).length, 1);
});

test('redactForModel keeps prompt bounded', () => {
  assert.equal(redactForModel('a'.repeat(9000)).length, 4000);
});
