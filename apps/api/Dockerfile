FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json ./packages/db/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY packages/db ./packages/db
COPY packages/config ./packages/config

RUN pnpm --filter @paceplan/api build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist

CMD ["node", "dist/server.js"]
