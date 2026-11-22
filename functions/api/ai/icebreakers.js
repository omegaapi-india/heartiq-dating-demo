// Optional cloud BYOK adapter. The key is read from the request body and used
// for this one upstream call only. It is never stored, logged, or returned.

import { buildModelPrompt, extractLines, validateCloudConfig } from '../../../lib/model.js';

const NO_STORE = { 'Cache-Control': 'no-store' };

function json(payload, status = 200) {
  return Response.json(payload, { status, headers: NO_STORE });
}

async function readBody(request) {
  const raw = await request.text();
  if (raw.length > 16000) throw new Error('Request too large.');
  return raw ? JSON.parse(raw) : {};
}

export async function onRequestPost(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let body;
  try {
    body = await readBody(context.request);
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  let config;
  try {
    config = validateCloudConfig(body.endpoint, body.model, body.key);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid model settings.' }, 400);
  }

  const prompt = buildModelPrompt(body.profile, body.result);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const upstream = await fetch(config.endpoint + '/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + config.key
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.3,
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!upstream.ok) {
      console.warn(JSON.stringify({ message: 'Cloud model request failed', status: upstream.status }));
      return json({ error: 'The model endpoint returned HTTP ' + upstream.status + '.' }, 502);
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content || '';
    if (!String(content).trim()) {
      return json({ error: 'The model returned an empty answer.' }, 502);
    }

    return json({
      ok: true,
      provider: 'cloud',
      model: config.model,
      lines: extractLines(content, 4),
      note: 'Request-only key. Nothing was stored.'
    });
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'The model took too long to answer.'
      : 'Could not reach the model endpoint.';
    return json({ error: message }, 502);
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: NO_STORE });
}
