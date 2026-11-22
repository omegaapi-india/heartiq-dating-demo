// Localhost-only bridge for an open local model such as Ollama.
// The public page never reads local files and this bridge stores nothing.

import http from 'node:http';
import { buildModelPrompt, extractLines } from '../lib/model.js';

const PORT = Number(process.env.HEARTIQ_BRIDGE_PORT || 8791);
const HOST = '127.0.0.1';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Cache-Control': 'no-store'
};

function send(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    ...corsHeaders,
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body)
  });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 16000) {
        reject(new Error('Request too large.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  if (request.method === 'GET' && request.url === '/health') {
    send(response, 200, {
      ok: true,
      service: 'HeartIQ local model bridge',
      host: HOST,
      port: PORT,
      model: MODEL,
      note: 'Binds to 127.0.0.1 only. Nothing is stored.'
    });
    return;
  }

  if (request.method !== 'POST' || request.url !== '/icebreakers') {
    send(response, 404, { error: 'Not found.' });
    return;
  }

  try {
    const body = await readBody(request);
    const prompt = String(body.prompt || buildModelPrompt(body.profile, body.result));
    if (prompt.length < 20) {
      send(response, 400, { error: 'A longer profile prompt is required.' });
      return;
    }

    const model = String(body.model || MODEL).slice(0, 80);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    let upstream;
    try {
      upstream = await fetch(OLLAMA_URL + '/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          prompt: prompt.slice(0, 8000),
          stream: false,
          format: 'json',
          options: { temperature: 0.3 }
        })
      });
    } finally {
      clearTimeout(timer);
    }

    if (!upstream.ok) {
      send(response, 502, { error: 'Local model returned HTTP ' + upstream.status + '.' });
      return;
    }

    const data = await upstream.json();
    const answer = String(data && data.response ? data.response : '');
    if (!answer.trim()) {
      send(response, 502, { error: 'Local model returned an empty answer.' });
      return;
    }

    send(response, 200, {
      ok: true,
      provider: 'local',
      model,
      lines: extractLines(answer, 4),
      note: 'Generated locally. Nothing was stored.'
    });
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'Local model took too long to answer.'
      : (error instanceof Error ? error.message : 'Local bridge error.');
    send(response, 502, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log('HeartIQ local bridge listening on http://' + HOST + ':' + PORT);
  console.log('Local model endpoint: ' + OLLAMA_URL + ' (model: ' + MODEL + ')');
});
