# syntax=docker.io/docker/dockerfile:1
# Pattern aligned with counsel-self-hosted demo (Bun + Next standalone).

FROM oven/bun:1.3.11 AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Required during next build (env pulled in via next.config → envConfig). Use real secrets at runtime only.
ARG IRON_SESSION_PASSWORD="dummy-iron-session-password-32-chars-xx"
ENV IRON_SESSION_PASSWORD=${IRON_SESSION_PASSWORD}

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

FROM oven/bun:1.3.11 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001 HOSTNAME=0.0.0.0

RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Build script copies .next/static and public into standalone; single copy is enough.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs

EXPOSE 3001

CMD ["bun", "server.js"]
