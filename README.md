# PacePlan

App PWA de organização de treinos de corrida. Monorepo Turborepo + pnpm.

## Stack

| Camada | Tech |
|--------|------|
| Frontend | React 18 + Vite + TypeScript + PWA |
| Backend | Node + Fastify + TypeScript |
| Banco | PostgreSQL (postgres.js) |
| Monorepo | Turborepo + pnpm workspaces |

## Requisitos

- Node 22+
- pnpm 9+
- Docker (para Postgres local)

## Setup inicial

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir Postgres local
docker compose up -d

# 3. Configurar env da API
cp apps/api/.env.example apps/api/.env

# 4. Rodar migrations (aguardar container subir)
sleep 3 && psql postgresql://paceplan:password@localhost:5432/paceplan \
  -f packages/db/src/migrations/001_initial_schema.sql

# 5. Subir tudo em dev
pnpm dev
```

Acesse: http://localhost:5173

## Estrutura

```
apps/
  web/        React + Vite PWA (porta 5173)
  api/        Fastify API (porta 3001)
packages/
  types/      Tipos compartilhados
  db/         Queries + migrations
  config/     tsconfigs base
```

## Comandos

```bash
pnpm dev           # web + api em paralelo
pnpm build         # build de produção
pnpm type-check    # TypeScript em todo o monorepo
pnpm lint          # ESLint
pnpm clean         # limpar todos os dists
```

## Documentação

- [PRD e SDD no Notion](https://www.notion.so/33870064b1c7816d8740e63b404e065b)
- [CLAUDE.md](./CLAUDE.md) — contexto para o Claude Code
