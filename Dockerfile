# Parsa ERP — unified image (Next.js :3000 + NestJS :3005 via server.js)
# Build:  docker build -t parsa-erp .
# Run:    docker compose up -d   (see docker-compose.yml)

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY backend/package.json backend/package.json
RUN bun install

FROM oven/bun:1 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules node_modules
COPY . .
# Production frontend build (backend is compiled by server.js at container start)
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
COPY --from=builder /app /app
EXPOSE 3000
CMD ["node", "server.js"]
