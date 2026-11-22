# Model adapters

No model is required. The rules engine runs entirely in the browser.

## 1. Rules engine

Deterministic and offline. `lib/match.js` scores every profile and `starterLines()` produces redacted opening lines from the profile's own prompt and shared interests.

## 2. Local open model

```bash
ollama pull llama3.2
npm run bridge
```

The bridge listens only on `http://127.0.0.1:8791`. It forwards a redacted prompt to `http://127.0.0.1:11434/api/generate` and returns up to four short lines. It stores nothing and accepts requests only from the local browser because the CSP allows just this loopback origin.

## 3. Cloud model · BYOK

In **Model studio → Cloud model**, enter:

- an HTTPS OpenAI-compatible endpoint, such as `https://api.example.com/v1`
- a model name
- your own API key

The Pages Function posts one chat-completions request. The key is read from the request body, used for that call, and discarded. It is never written to D1, logs, source files, or browser storage. The form clears the key field after the request finishes.

Validation rejects:

- non-HTTPS endpoints
- credentials embedded in the URL
- localhost, loopback, private, link-local, `.local`, and `.internal` hosts

## Privacy note

The prompt contains only a fictional profile's name, age, demo city, redacted answer, values, interests, and score reasons. Never paste real personal data into the demo.
