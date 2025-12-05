# syntax=docker/dockerfile:1

# ============================================
# Dependencies Stage
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Enable corepack and prepare exact pnpm version
RUN corepack enable && corepack prepare pnpm@10.18.0 --activate

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copy lockfile first for better layer caching
COPY pnpm-lock.yaml ./

# Fetch dependencies into pnpm store (cached)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --frozen-lockfile

# Copy package.json and install from cached store
COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline

# ============================================
# Builder Stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10.18.0 --activate

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source code
COPY . .

# Build args for feature flags
ENV NEXT_PUBLIC_ENABLE=GENERIC

# Dummy values for build (replaced at runtime)
ENV DATABASE_URI="mongodb://localhost:27017/build-placeholder"
ENV PAYLOAD_SECRET="build-time-placeholder"
ENV NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
ENV NODE_ENV=production

# Generate Payload types and build Next.js with cache mounts
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm payload generate:types || echo "Type generation skipped" && \
    pnpm next build --experimental-build-mode compile

# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libc6-compat curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]