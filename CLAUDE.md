# PacePlan — CLAUDE.md

Guia de contexto para sessões do Claude Code neste repositório.
Leia este arquivo inteiro antes de qualquer ação.

## O que é este projeto

App PWA de organização de treinos de corrida. Substitui planilhas.
Não tem GPS, tracking em tempo real, coach automático ou features sociais.
O usuário é o próprio coach — o app organiza e registra.

Vitrine de augmented engineering: arquitetura spec-driven com skills,
ADRs documentados e stack defensável publicamente.

## Estrutura do monorepo

apps/
  web/        → React 18 + Vite 6 + TypeScript + Tailwind v4 + Shadcn/ui (porta 5173)
  api/        → Node.js + Fastify 5 + TypeScript (porta 3001)
packages/
  types/      → Interfaces, enums, DTOs, DomainError factory — FONTE DA VERDADE
  utils/      → Lógica pura: pace calc, formatadores, date utils
  api-client/ → Serviços de API, query keys TanStack Query
  ui-logic/   → Hooks de negócio: useWeek, useSessions, useMacrocycleActive
  db/         → Cliente postgres.js + queries SQL tipadas
  config/     → tsconfigs compartilhados

## Regra de dependência de packages

Se o código não tem JSX, CSS ou referência a DOM → vai para packages/.
apps/web importa de packages/ — nunca o contrário.
Nunca duplicar tipos ou lógica que já existe em packages/.

## Regras inegociáveis

### Geral
- TypeScript strict em todo o projeto. Zero `any`. Zero `as unknown`.
- Zero comentários no código. Nomes auto-descritivos.
- Zero `console.log` em código de produção.

### Frontend (apps/web)
- React funcional puro. Zero class components.
- Estilização via Tailwind CSS v4. Zero inline styles estáticos.
- Inline style APENAS para valores calculados em runtime (ex: cor dinâmica de SessionType).
- Componentes Shadcn/ui para primitivos: Button, Input, Select, Dialog, Badge.
- Zero libs de UI além de Shadcn/ui (sem MUI, Chakra, etc).
- Apenas Lucide React para ícones. Zero emojis como ícone de UI.
- Zero bibliotecas de charts. Gráficos em SVG puro.
- Zero `useState + useEffect` para dados remotos — sempre TanStack Query.
- Hooks de dados importados de `@paceplan/ui-logic`.
- Services importados de `@paceplan/api-client`.
- Utilitários importados de `@paceplan/utils`.
- Tipos importados de `@paceplan/types`.

### Backend (apps/api)
- Fastify 5 puro. Sem Express.
- Validação de entrada com Zod em todas as rotas.
- Sem ORM. Queries SQL diretas via postgres.js em packages/db/src/queries/.
- Erros de domínio via DomainErrors factory de @paceplan/types — nunca new Error().
- Plugin errorHandler global captura DomainError — routes sem try/catch.
- Sem lógica de negócio nas rotas — rotas só validam, chamam service, retornam.

### Banco de dados
- PostgreSQL. Schema em packages/db/src/migrations/.
- Migrations são arquivos .sql numerados: 001_, 002_, etc.
- Campos de data sempre como DATE ou TIMESTAMPTZ. Nunca VARCHAR.
- updated_at sempre via trigger. Soft delete não existe — DELETE é permanente.

### Testes
- Vitest + Testing Library em todos os packages e apps.
- Coverage mínimo: 80% global — gate no CI. Build falha abaixo disso.
- packages/utils e packages/ui-logic: lógica pura, zero mocks.
- Hooks: renderHook + QueryClientWrapper de packages/ui-logic/src/test-utils.tsx.
- Backend: app.inject() do Fastify contra banco PostgreSQL real (DATABASE_URL_TEST).
- Truncate nas tabelas afetadas no beforeEach de cada describe.

## Comandos úteis

pnpm dev                          # todos os apps em paralelo
pnpm --filter @paceplan/api dev   # só a API
pnpm --filter @paceplan/web dev   # só o web
pnpm build                        # build completo
pnpm type-check                   # type check em tudo
pnpm test                         # todos os testes
pnpm test:coverage                # coverage report
psql $DATABASE_URL -f packages/db/src/migrations/001_initial_schema.sql

## Variáveis de ambiente

### apps/api/.env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
DATABASE_URL=postgresql://paceplan:SUASWNHA@localhost:5432/paceplan
DATABASE_URL_TEST=postgresql://USUARIO:SUASENHA@localhost:5432/paceplan_test
CORS_ORIGIN=http://localhost:5173

## Estrutura de arquivos — web

apps/web/src/
  components/
    ui/             → Shadcn/ui instalados (nunca editar diretamente)
    UI/             → Genéricos customizados do projeto
    WeekView/       → DayCard, SessionRow, WeekHeader, WeekSummary
    SessionForm/    → SessionForm, SessionTypeSelect, PaceInput, FeelingScale
    Dashboard/      → KpiCard, VolumeChart, LongRunChart
    History/        → HistoryList
  pages/
    WeekPage.tsx
    NewSessionPage.tsx
    SessionDetailPage.tsx
    HistoryPage.tsx
    DashboardPage.tsx
    MacrocyclePage.tsx
    PaceCalculatorPage.tsx
    WeekTemplatePage.tsx
  styles/
    globals.css     → @theme Tailwind v4, tokens dark/light, classes glass

## Estrutura de arquivos — api

apps/api/src/
  server.ts
  app.ts              → função build() exportada — usada em testes e entrypoint
  plugins/
    errorHandler.ts   → captura DomainError globalmente
  routes/
    sessions.ts
    macrocycles.ts
  services/
    sessionService.ts
    macrocycleService.ts

## Endpoints da API

GET    /health
GET    /api/macrocycles/active
POST   /api/macrocycles
GET    /api/macrocycles/:id/phases
POST   /api/macrocycles/:id/phases
GET    /api/macrocycles/:id/pace-profile
POST   /api/macrocycles/:id/pace-profile
GET    /api/macrocycles/:id/week-template
POST   /api/macrocycles/:id/week-template

GET    /api/sessions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET    /api/sessions/:id
POST   /api/sessions
PATCH  /api/sessions/:id
DELETE /api/sessions/:id
POST   /api/sessions/:id/log
POST   /api/sessions/:id/skip
POST   /api/sessions/:id/reactivate

POST   /api/weeks/populate

## Skills disponíveis

Leia as skills relevantes ANTES de implementar qualquer feature.
Skills em .agents/skills/ — padrão Agent Skills (agentskills.io).
Compatível com Claude Code, Gemini CLI, Codex.

.agents/skills/
  paceplan-sdd/
    SKILL.md                → Épicos, stories, ACs completos, domínio, endpoints
    references/domain.md    → SessionTypes, helpers, hooks, utils
  paceplan-frontend/
    SKILL.md                → Regras TypeScript, Tailwind, Shadcn, TanStack Query, testes
  paceplan-design/
    SKILL.md                → Tokens de cor dark/light, glass, layout responsivo, ícones
  paceplan-components/
    SKILL.md                → Estrutura de página, hooks, PaceInput, SessionTypeSelect
    references/components.md → Exemplos canônicos de componentes
  paceplan-backend/
    SKILL.md                → Arquitetura 3 camadas, DomainErrors, Zod, testes
  paceplan-tests-utils/
    SKILL.md                → Testes de lógica pura em packages/utils
  paceplan-tests-frontend/
    SKILL.md                → Testes de hooks e componentes React
  paceplan-tests-backend/
    SKILL.md                → Testes de integração via app.inject()

docs/adr/                   → Decisões arquiteturais (001–008)

## Prompt de entrada por story (uma por sessão)

Leia o CLAUDE.md e as skills relevantes para esta story.
Implemente a Story [US-XX] — [nome].
Siga os ACs exatos. Branch: feat/us-xx-nome-curto.

## SessionType — referência rápida

| Tipo           | Cor     | É corrida? | Tem dist/pace? |
|----------------|---------|------------|----------------|
| EASY_RUN       | #22c55e | sim        | sim            |
| QUALITY_RUN    | #f97316 | sim        | sim            |
| LONG_RUN       | #8b5cf6 | sim        | sim            |
| PACE_RUN       | #6366f1 | sim        | sim            |
| RECOVERY_RUN   | #06b6d4 | sim        | sim            |
| RACE           | #ec4899 | sim        | sim            |
| STRENGTH_LOWER | #f59e0b | não        | não            |
| STRENGTH_UPPER | #f59e0b | não        | não            |
| MOBILITY       | #14b8a6 | não        | não            |
| REST           | #6b7280 | não        | não            |

## Regras de domínio críticas

1. STRENGTH_*, MOBILITY e REST nunca têm targetDistance nem targetPace
2. status 'done' só existe com SessionLog preenchido
3. status 'skipped' não conta em volume nem streak
4. REST, MOBILITY e STRENGTH_* contam no streak de consistência
5. Pace sempre no formato "MM:SS" (ex: "5:30")
6. Distâncias sempre em km com 1 ou 2 casas decimais
7. Apenas 1 macrociclo ativo por vez
8. Fases não podem ter datas sobrepostas no mesmo macrociclo

## DomainErrors — referência rápida

DomainErrors.sessionNotFound(id)
DomainErrors.sessionAlreadyLogged(id)
DomainErrors.sessionNotDone(id)
DomainErrors.macrocycleAlreadyActive()
DomainErrors.macrocycleNotFound(id)
DomainErrors.phaseNotFound(id)
DomainErrors.phaseOverlapConflict()
DomainErrors.invalidPaceFormat(value)
DomainErrors.invalidDateRange()

## Deploy (DigitalOcean Droplet)

- API roda com node dist/server.js via PM2
- Web é build estático servido por Nginx
- Banco PostgreSQL na mesma máquina
- Nginx faz proxy de /api/* para localhost:3001
- HTTPS via Certbot (Let's Encrypt)
- Branch de deploy: feat/deploy (Nginx config, PM2, scripts prontos)
