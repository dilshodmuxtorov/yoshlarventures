# syntax=docker/dockerfile:1
#
# Public marketing site (Next.js, App Router).
#
# Two stages: the builder installs the full dependency tree and compiles, the
# runtime carries only Next's standalone output. Nothing here bakes an
# environment in — SITE_URL, SITE_INDEXABLE and API_BASE are read at runtime, so
# the identical image serves both the staging host and production.

# ── build ────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies first: this layer is reused on every build that doesn't change
# the lockfile, which is most of them.
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# The build prerenders pages that call the dashboard's public API. API_BASE must
# therefore resolve during the build too; the CI passes the public API host,
# while at runtime the container talks to the backend over the docker network.
ARG API_BASE=https://dash-api.yoshlarventures.uz
ENV API_BASE=$API_BASE
# Stamped into the image so /api/health can report what is actually running.
ARG BUILD_COMMIT=dev
ARG BUILD_TIME=
ENV BUILD_COMMIT=$BUILD_COMMIT \
    BUILD_TIME=$BUILD_TIME
RUN npm run build

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
# Re-declared here: ARGs and ENVs do not cross stage boundaries, and /api/health
# reads these at request time rather than having them baked into the bundle.
ARG BUILD_COMMIT=dev
ARG BUILD_TIME=
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    BUILD_COMMIT=$BUILD_COMMIT \
    BUILD_TIME=$BUILD_TIME

# Unprivileged user: a bug in the app should not be able to write to the image.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Plain Node — no npm wrapper — so signals reach the server and the container
# stops promptly on redeploy.
CMD ["node", "server.js"]
