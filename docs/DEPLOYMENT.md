# Deployment

HeartIQ is a static Cloudflare Pages site with two Pages Functions: the signed preview lock and the optional cloud BYOK adapter.

## One-time setup

```bash
npm install
wrangler pages secret put DEMO_TRIAL_SECRET --project-name heartiq
npm run deploy
```

The secret should be a long random string. It never goes into the repository. For local testing only, copy `.dev.vars.example` to `.dev.vars` and replace the placeholder; `.dev.vars` is gitignored.

## Configuration notes

- `compatibility_date` is `2026-11-22`. A later date may be rejected by your Wrangler version.
- `pages_build_output_dir` is `.` because the site is served directly from the repo root.
- Do not add an `observability` block to a Pages config; Wrangler rejects it.
- `_headers` sets a strict CSP. The local bridge is allowed only on `http://127.0.0.1:8791`.

## Verifying the deploy

1. Open `https://heartiq-2t8.pages.dev/`.
2. Confirm the page sets a `heartiq_trial` cookie.
3. Run `npm test` locally.
4. Check that `/api/ai/icebreakers` rejects `http://` endpoints and private hosts.

## Cost

Cloudflare Pages free tier is enough for the public demo. The project includes no paid data feed, no analytics, and no server-side model. Optional cloud model calls use a key you supply and are billed by that provider, not by this repository.
