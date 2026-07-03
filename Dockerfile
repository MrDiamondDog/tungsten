# syntax=docker.io/docker/dockerfile:1

FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Install curl because it's required for coolify healthchecks
ENV PYTHONUNBUFFERED=1
RUN apk --no-cache add libc6-compat build-base curl
RUN ln -sf python3 /usr/bin/python

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies
COPY package.json pnpm-*.yaml* ./
COPY patches/ ./patches/
COPY drizzle.config.ts ./drizzle.config.ts
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

VOLUME /app/tungsten.db
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tungsten

COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=tungsten:nodejs /app/.next/standalone ./
COPY --from=builder --chown=tungsten:nodejs /app/.next/static ./.next/static

USER tungsten

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
