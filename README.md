# Yoshlar Ventures — public site

The marketing site for [yoshlarventures.uz](https://yoshlarventures.uz): a
Next.js App Router app in Uzbek, Russian and English.

Everything editable — team, portfolio, partners, news, events and the page copy
itself — comes from the dashboard's public CMS API, so the marketing team changes
the site from the dashboard without a deploy. The apply and contact forms post
back to the same API; applications land in the shared intake spreadsheet.

## Running locally

```bash
cp .env.example .env     # point API_BASE at a running dashboard backend
npm install
npm run dev              # http://localhost:3000
```

The site tolerates an unreachable API: pages render with their fallback copy
rather than failing, so you can work on layout without the backend running.

## Layout

```
src/app/[locale]/     pages — locale is a path segment (uz | ru | en)
src/components/       shared UI; sections/ holds the home-page blocks
src/lib/api.ts        CMS client (server-side fetch + ISR)
src/lib/i18n.ts       locales, UI strings, SITE_URL / SITE_INDEXABLE
src/proxy.ts          locale negotiation and redirects
```

## Configuration

| Variable | Purpose |
|---|---|
| `API_BASE` | Dashboard backend origin the CMS is read from |
| `SITE_URL` | Canonical origin for metadata, sitemap and robots |
| `SITE_INDEXABLE` | `true` only on the production host — otherwise `robots.txt` disallows everything |
| `CONTENT_REVALIDATE` | Seconds between ISR revalidations (default 300) |

All four are read at runtime, so one built image serves both staging and
production and switching domains is a config change, not a rebuild.

## Deploying

Push to `main`. CI lints, type-checks, builds a Docker image, pushes it to GHCR
and restarts the service on the server. See [DEPLOYMENT.md](DEPLOYMENT.md) for
first-time setup, the staging host, and how to switch to the real domain.
