# Deploying the public site

The site is a Next.js app that reads its content from the dashboard's public API.
CI builds a Docker image and pushes it to GHCR; the server only pulls. The image
carries no environment: `~/yoshlar-venture-new/.env` on each host decides which domain that
host serves, so the **same image** runs the staging host and, later, production.

Plan: bring the site up on `new.yoshlarventures.uz`, verify it, then point the
real domain at it by changing two lines in that `.env`.

---

## 1. Create the GitHub repository

```bash
# In this directory
git remote add origin https://github.com/dilshodmuxtorov/yoshlarventures.git
git push -u origin main
```

Create the repository on GitHub first (private is fine — GHCR inherits the
visibility). The container image is published as `ghcr.io/<owner>/yv-site`
regardless of the repository name.

## 2. Add repository secrets

`Settings → Secrets and variables → Actions → New repository secret`. Use the
same values as the dashboard repo:

| Secret | Value |
|---|---|
| `PRODUCTION_HOST` | server IP or hostname |
| `PRODUCTION_USER` | SSH user |
| `PRODUCTION_SSH_KEY` | private key for that user, whole file including the BEGIN/END lines |
| `GHCR_PAT` | *(recommended)* classic PAT with only `read:packages` — used by the server to pull the image |
| `BUILD_API_BASE` | *(optional)* API host used during the build — defaults to `https://dash-api.yoshlarventures.uz` |

`GHCR_PAT` is optional: without it the workflow falls back to the run's own
token, which works during the deploy but expires with it, so a later manual
`docker pull` on the server would fail. Give the PAT `read:packages` and nothing
else — it never needs write access.

The deploy job runs in a `production` environment, so you can require a manual
approval under `Settings → Environments` if you want a gate before each ship.

## 3. Point DNS at the server

Add an **A record**: `new` → the server's IP address. Confirm it resolves before
requesting a certificate:

```bash
dig +short new.yoshlarventures.uz
```

## 4. Prepare the server

```bash
mkdir -p ~/yoshlar-venture-new
```

Find the docker network the dashboard stack created — the site joins it to reach
the API internally:

```bash
docker network ls | grep appnet
```

Then write `~/yoshlar-venture-new/.env` (this file is never overwritten by a deploy):

```bash
cat > ~/yoshlar-venture-new/.env <<'EOF'
SITE_URL=https://new.yoshlarventures.uz
SITE_INDEXABLE=false
API_BASE=http://backend:8000
SITE_PORT=3002
APPNET_NAME=yoshlar-venture-dashboard_appnet
CONTENT_REVALIDATE=300
EOF
```

Adjust `APPNET_NAME` if the previous command printed a different name, and
`SITE_PORT` if 3002 is taken (`ss -tlnp | grep 3002`).

## 5. nginx + TLS

nginx is managed on the server, outside this repo. What the site needs from it:

- **proxy target** `http://127.0.0.1:3002` (whatever `SITE_PORT` is set to)
- **`proxy_http_version 1.1`** and the usual `Host` / `X-Forwarded-*` headers
- **`proxy_buffering off`** — Next.js streams responses; buffering delays paint
- **a certificate** for `new.yoshlarventures.uz`

Two things worth adding while this is a staging host:

- `add_header X-Robots-Tag "noindex, nofollow" always;` — a crawler that ignores
  robots.txt still sees the header, and it applies to every response
- HTTP basic auth, so the staging host is not readable by anyone who guesses
  the subdomain:
  ```bash
  sudo apt install -y apache2-utils
  sudo htpasswd -c /etc/nginx/.htpasswd-new yv
  ```
  then `auth_basic "staging";` + `auth_basic_user_file /etc/nginx/.htpasswd-new;`

Skip HSTS here — committing a staging subdomain to HTTPS-only for a year is hard
to undo if the certificate lapses.

## 6. Deploy

Push to `main`, or run the workflow manually from the Actions tab. The workflow
lints, type-checks, builds, pushes, pulls on the server, and then polls the site
until it answers 200 — failing the run (with logs) if it never does.

## 7. Verify

```bash
curl -I https://new.yoshlarventures.uz/uz                 # 200 (401 until you send the basic-auth user)
curl -s https://new.yoshlarventures.uz/robots.txt         # must Disallow: /
```

Check that content is coming from the CMS (team photos, partner logos, news) and
that submitting the apply form adds a row to the intake sheet.

---

## Switching to the real domain

Once the staging site looks right:

1. Point `yoshlarventures.uz` (and `www`) at the server.
2. Add the production server block in nginx: same proxy target, `server_name`
   for both names, no basic auth, no `X-Robots-Tag`, and HSTS this time. Run
   certbot for both names.
3. Edit `~/yoshlar-venture-new/.env`:
   ```bash
   SITE_URL=https://yoshlarventures.uz
   SITE_INDEXABLE=true
   ```
4. `cd ~/yoshlar-venture-new && docker compose -f docker-compose.prod.yml up -d`

No rebuild is needed — both values are read at runtime. Step 3 is also what
turns the site's `robots.txt` from `Disallow: /` into a normal one, so do not do
it before the domain is actually live.

## Rolling back

Images are tagged with the commit sha:

```bash
cd ~/yoshlar-venture-new
SITE_IMAGE=ghcr.io/dilshodmuxtorov/yv-site:<sha> \
  docker compose -f docker-compose.prod.yml up -d
```
