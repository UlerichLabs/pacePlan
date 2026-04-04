# PacePlan — CLAUDE.md

Guia de contexto para sessões do Claude Code neste repositório.
Leia este arquivo inteiro antes de qualquer ação.

---

## O que é este projeto

App PWA de organização de treinos de corrida. Substitui planilhas.
**Não tem** GPS, tracking em tempo real, coach automático ou features sociais.
O usuário é o próprio coach — o app organiza e registra.

Monorepo Turborepo + pnpm workspaces:

```
apps/
  web/   → React 18 + Vite + TypeScript + PWA (porta 5173)
  api/   → Node + Fastify + TypeScript (porta 3001)
packages/
  types/ → Tipos compartilhados entre web e api — FONTE DA VERDADE
  db/    → Cliente postgres.js + queries SQL tipadas
  config/→ tsconfigs compartilhados
```

---

## Regras inegociáveis

### Geral
- TypeScript strict em todo o projeto. Zero `any`. Zero `as unknown`.
- Sem comentários no código. Nomes auto-descritivos.
- Sem mensagens hardcoded em português no código — só em constantes nomeadas.
- Sem `console.log` em código de produção.

### Frontend (apps/web)
- React funcional puro. Zero class components.
- Estilização via CSS custom properties definidas em `global.css`. Sem Tailwind, sem styled-components, sem CSS modules.
- Inline styles permitidos para componentes simples. Para componentes com muitos estados visuais, extrair para objeto de estilos dentro do componente.
- Sem bibliotecas de UI externas (MUI, Chakra, etc). Componentes próprios.
- Sem bibliotecas de charts. Gráficos em SVG inline ou CSS puro.
- Rotas em `App.tsx`. Sem lazy loading no MVP.
- Estado global via hooks customizados em `src/hooks/`. Sem Redux, Zustand ou Context desnecessário.
- Formulários com estado local via `useState`. Sem react-hook-form no MVP.

### Backend (apps/api)
- Fastify puro. Sem Express.
- Validação de entrada com Zod em todas as rotas.
- Sem ORM. Queries SQL diretas via `postgres.js` em `packages/db/src/queries/`.
- Erros HTTP via `@fastify/sensible` (`reply.badRequest()`, `reply.notFound()`, etc).
- Sem lógica de negócio nas rotas — rotas só validam, chamam service/query, retornam.

### Banco de dados
- PostgreSQL. Schema em `packages/db/src/migrations/`.
- Migrations são arquivos `.sql` numerados: `001_`, `002_`, etc.
- Campos de data sempre como `DATE` ou `TIMESTAMPTZ`. Nunca `VARCHAR`.
- `updated_at` sempre via trigger (já configurado na migration 001).
- Soft delete não existe no MVP. `DELETE` é permanente.

### Pacote types
- Qualquer tipo usado em mais de um app DEVE estar em `@paceplan/types`.
- Nunca duplicar tipos. Nunca redefinir localmente o que já existe em `types/`.
- Alterar `SessionType` enum ou interfaces core requer atualizar migration SQL correspondente.

---

## Comandos úteis

```bash
# Desenvolvimento (ambos os apps em paralelo)
pnpm dev

# Só a API
pnpm --filter @paceplan/api dev

# Só o web
pnpm --filter @paceplan/web dev

# Build completo
pnpm build

# Type check em tudo
pnpm type-check

# Rodar migration no banco
psql $DATABASE_URL -f packages/db/src/migrations/001_initial_schema.sql
```

---

## Variáveis de ambiente

### apps/api/.env
```
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
DATABASE_URL=postgresql://paceplan:password@localhost:5432/paceplan
CORS_ORIGIN=http://localhost:5173
```

O arquivo `.env.example` existe em `apps/api/`. Copiar para `.env` e preencher.

---

## Estrutura de arquivos do web

```
src/
  components/
    WeekView/       → WeekHeader, WeekSummary, DayCard
    SessionForm/    → SessionForm, SessionTypeSelect, PaceInput
    SessionLog/     → LogForm, FeelingScale
    Dashboard/      → KpiCards, VolumeChart
    History/        → HistoryList
    UI/             → Layout (nav bottom bar)
  hooks/
    useSessions.ts  → CRUD de sessões via API + state local
    useWeek.ts      → Navegação entre semanas (getMonday, days[])
  services/
    sessionService.ts → fetch wrapper para /api/sessions
    sessionUtils.ts   → helpers: getTypeColor, formatPace, isToday, etc
  pages/
    WeekPage.tsx          ← IMPLEMENTADO
    NewSessionPage.tsx    ← STUB — implementar
    SessionDetailPage.tsx ← STUB — implementar
    HistoryPage.tsx       ← STUB — implementar
    DashboardPage.tsx     ← STUB — implementar
  styles/
    global.css      → CSS custom properties (cores, spacing, safe area)
```

---

## Estrutura de arquivos da API

```
src/
  server.ts          → Entry point Fastify, registro de plugins e rotas
  routes/
    health.ts        ← IMPLEMENTADO
    sessions.ts      ← IMPLEMENTADO (todos os endpoints)
  services/          → Lógica de negócio (streak, stats) — a implementar
  middleware/        → Middleware customizado — a implementar se necessário
```

---

## Endpoints da API

```
GET    /health
GET    /api/sessions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET    /api/sessions/:id
POST   /api/sessions
PATCH  /api/sessions/:id
DELETE /api/sessions/:id
POST   /api/sessions/:id/log
POST   /api/sessions/:id/skip
POST   /api/sessions/:id/reactivate
```

---

## Prioridade de implementação (MVP)

**Épico 01 — Gestão de sessões (CRUD)** → Implementar `NewSessionPage` e `SessionDetailPage`
**Épico 02 — Visão semanal** → `WeekPage` está estruturada, completar `DayCard` actions
**Épico 03 — Dashboard** → `DashboardPage` + `KpiCards` + `VolumeChart` (SVG puro)

Cada página tem um comentário `// TODO (CC):` explicando exatamente o que implementar.

---

## SessionType — referência rápida

| Tipo | Cor CSS var | Tem distância? |
|------|------------|----------------|
| EASY_RUN | `--color-easy` (#22c55e) | sim |
| TEMPO_RUN | `--color-tempo` (#f97316) | sim |
| LONG_RUN | `--color-long` (#8b5cf6) | sim |
| INTERVAL | `--color-interval` (#ef4444) | sim |
| HILL_REPS | `--color-hills` (#eab308) | sim |
| RACE | `--color-race` (#ec4899) | sim |
| REST_DAY | `--color-rest` (#6b7280) | não |
| CROSS_TRAINING | `--color-cross` (#06b6d4) | sim |

---

## Domínio — regras críticas

1. `REST_DAY` nunca tem `targetDistance` nem `targetPace`
2. `status: 'done'` só existe com `SessionLog` preenchido
3. `status: 'skipped'` não conta em volume nem streak
4. `REST_DAY` conta como dia válido no streak
5. Pace sempre no formato `"MM:SS"` (ex: `"5:30"`)
6. Distâncias sempre em km com 1 ou 2 casas decimais

---

## Deploy (Digital Ocean Droplet)

- API roda com `node dist/server.js` via PM2
- Web é build estático servido por Nginx
- Banco PostgreSQL na mesma máquina
- Nginx faz proxy de `/api/*` para `localhost:3001`
- HTTPS via Certbot (Let's Encrypt)

O `docker-compose.yml` na raiz serve apenas para dev local com Postgres.

---

## Skills disponíveis

Leia as skills antes de implementar qualquer feature:

```
.claude/skills/paceplan-sdd.md        → Épicos, stories e ACs completos
.claude/skills/paceplan-components.md → Padrões visuais, exemplos de componente
```

### Como usar nas sessões do CC

Uma story por sessão. Prompt de entrada padrão:

```
Leia o CLAUDE.md, a skill paceplan-sdd.md e a skill paceplan-components.md.
Implemente a Story [X.Y] — [nome].
Siga os ACs exatos. Sem bibliotecas externas de UI ou form.
```

---

## Skills (padrão Agent Skills aberto)

Skills em `.agents/skills/` — compatível com Claude Code, Gemini CLI, Codex e qualquer agente que implemente o padrão agentskills.io.

```
.agents/skills/
  paceplan-sdd/
    SKILL.md                  → Épicos, stories, ACs
    references/domain.md      → Domínio detalhado, hooks, regras
  paceplan-components/
    SKILL.md                  → Design system, padrões visuais
    references/components.md  → Exemplos completos de componentes
```

### Prompt de entrada por story (uma por sessão)

```
Leia o CLAUDE.md e as skills paceplan-sdd e paceplan-components.
Implemente a Story 01.1 — criação de sessão (NewSessionPage).
Siga os ACs exatos. Sem bibliotecas externas de UI ou form.
```
