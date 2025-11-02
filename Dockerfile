FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build args for feature flags
ENV NEXT_PUBLIC_ENABLE=GENERIC

# Dummy values for build (replaced at runtime)
ENV DATABASE_URI="mongodb://localhost:27017/build-placeholder"
ENV PAYLOAD_SECRET="build-time-placeholder"
ENV NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
ENV NODE_ENV=production

RUN pnpm payload generate:types || echo "Skipped"
RUN pnpm next build --experimental-build-mode compile

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat curl
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]