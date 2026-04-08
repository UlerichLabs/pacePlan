---
name: paceplan-sdd
description: >
  Spec Driven Development do PacePlan — modelo de domínio, hierarquia,
  SessionTypes expandidos, acceptance criteria completos e épicos
  priorizados. Use sempre que for implementar qualquer feature, página
  ou componente. Invoque ao mencionar "story", "épico", "AC",
  "macrociclo", "fase", "implementar" ou qualquer página do projeto.
compatibility: Claude Code, Gemini CLI, Codex
metadata:
  author: UlerichLabs
  version: "3.0"
  project: paceplan
---

## Stack de referência

Frontend:  React 18 + Vite 6 + TypeScript + Tailwind v4 + Shadcn/ui + TanStack Query v5
Backend:   Node.js + Fastify 5 + TypeScript + Zod + postgres.js
Banco:     PostgreSQL (DigitalOcean)
Monorepo:  Turborepo + pnpm workspaces
Packages:  @paceplan/types · @paceplan/utils · @paceplan/api-client · @paceplan/ui-logic
Testes:    Vitest + Testing Library (80% coverage mínimo — gate no CI)
ADRs:      docs/adr/ — consultar antes de decisões arquiteturais

## Contexto do produto

O PacePlan é usado por corredores que já têm um plano de treino (gerado
por coach ou IA) e precisam de um lugar para executar, registrar e
acompanhar. A semana real inclui corrida + musculação + mobilidade.

Caso de uso central: Lucas, meia maratona novembro 2026. Plano de 7
meses em 4 fases. Segunda: musculação inferiores. Terça: easy run
esteira. Quarta: musculação superiores/core. Quinta: quality run
esteira. Sexta: mobilidade. Sábado: descanso. Domingo: long run rua.

## Hierarquia de domínio

Macrociclo (ex: Meia Maratona Novembro 2026)
  └── Phase / Fase (ex: Fase 1 — Construção de Base · Abril → Junho)
        └── Semana (contexto calculado pela data atual)
              └── TrainingSession (ex: Domingo · Long Run · 18km · Rua)
                    └── SessionLog (dados reais pós-treino)

## Modelo de domínio

interface Macrocycle {
  id:           string
  name:         string        // "Meia Maratona — Novembro 2026"
  goalDistance: number        // km — 21
  raceDate:     string        // YYYY-MM-DD
  startDate:    string        // YYYY-MM-DD
  isActive:     boolean
  createdAt:    string
  updatedAt:    string
}

interface Phase {
  id:                  string
  macrocycleId:        string
  name:                string   // "Fase 1 — Construção de Base"
  objective:           string   // "Consolidar 10 km de forma confortável"
  startDate:           string
  endDate:             string
  order:               number   // 1, 2, 3, 4
  longRunTarget?:      number   // km — meta do longão desta fase
  weeklyVolumeTarget?: number   // km — volume alvo semanal
}

enum SessionType {
  EASY_RUN       = "EASY_RUN",
  QUALITY_RUN    = "QUALITY_RUN",
  LONG_RUN       = "LONG_RUN",
  PACE_RUN       = "PACE_RUN",
  RECOVERY_RUN   = "RECOVERY_RUN",
  RACE           = "RACE",
  STRENGTH_LOWER = "STRENGTH_LOWER",
  STRENGTH_UPPER = "STRENGTH_UPPER",
  MOBILITY       = "MOBILITY",
  REST           = "REST",
}

enum Environment {
  TREADMILL = "TREADMILL",
  OUTDOOR   = "OUTDOOR",
}

interface TrainingSession {
  id:               string
  date:             string
  type:             SessionType
  targetDistance?:  number      // km — apenas corridas
  targetDuration?:  number      // minutos — alternativa à distância
  targetPace?:      string      // "MM:SS" — apenas corridas
  environment?:     Environment // apenas corridas
  notes?:           string
  status:           'planned' | 'done' | 'skipped'
  log?:             SessionLog
  createdAt:        string
  updatedAt:        string
}

interface SessionLog {
  actualDistance?: number   // km
  actualDuration?: number   // minutos
  actualPace?:     string   // "MM:SS"
  heartRateAvg?:   number   // BPM
  heartRateMax?:   number   // BPM
  feeling:         1 | 2 | 3 | 4 | 5
  notes?:          string
  completedAt:     string
}

interface PaceProfile {
  id:             string
  macrocycleId:   string
  referencePace:  string   // "MM:SS" — pace base (5km ou prova alvo)
  referenceType:  'RACE_5K' | 'RACE_10K' | 'TARGET_RACE'
  zones:          PaceZones
  createdAt:      string
  updatedAt:      string
}

interface PaceZones {
  recovery:  { min: string; max: string }  // Zona 1
  easy:      { min: string; max: string }  // Zona 2
  tempo:     { min: string; max: string }  // Zona 3
  threshold: { min: string; max: string }  // Zona 4
  race:      { min: string; max: string }  // Zona 5 — pace alvo da prova
  longRun:   { min: string; max: string }  // derivado do easy +15~20s
}

## Regras de domínio críticas

1. Corridas (EASY, QUALITY, LONG, PACE, RECOVERY, RACE):
   têm targetDistance, targetPace, environment
2. STRENGTH_LOWER, STRENGTH_UPPER, MOBILITY:
   sem campos de corrida — só notas e duração opcional
3. REST: sem campos — apenas sensação e notas opcionais no log
4. REST, MOBILITY e STRENGTH_* contam no streak de consistência
5. Volume semanal = soma de actualDistance de corridas com status done
6. Long Run do domingo é o treino mais importante — destaque visual obrigatório
7. Apenas 1 macrociclo ativo por vez
8. Fases não podem ter datas sobrepostas dentro do mesmo macrociclo
9. Mínimo 1 fase, máximo 6 fases por macrociclo

## Helpers — @paceplan/utils

const RUNNING_TYPES = [
  SessionType.EASY_RUN, SessionType.QUALITY_RUN, SessionType.LONG_RUN,
  SessionType.PACE_RUN, SessionType.RECOVERY_RUN, SessionType.RACE,
]

function isRunningSession(type: SessionType): boolean {
  return RUNNING_TYPES.includes(type)
}

function calcPaceZones(referencePace: string, type: PaceProfile['referenceType']): PaceZones {
  // Fórmula Jack Daniels adaptada
  // referencePace em segundos totais
  // easy:      +60~90s por km em relação ao pace de prova
  // longRun:   +75~90s
  // tempo:     -15~20s
  // threshold: pace de prova ± 5s
  // recovery:  +90~120s
}

## Épico 00 — Macrociclo e Fases (P0)

### Story 00.1 — Criar macrociclo
Arquivo: apps/web/src/pages/MacrocyclePage.tsx

AC:
- [ ] Form: nome, distância objetivo (km), data da prova, data de início
- [ ] Sistema calcula duração total em semanas automaticamente
- [ ] Apenas 1 macrociclo ativo por vez — DomainErrors.macrocycleAlreadyActive()
- [ ] POST /api/macrocycles
- [ ] Após criação, redirect para criação de fases

### Story 00.2 — Criar fases
AC:
- [ ] Form: nome, objetivo, data início, data fim, meta de longão (opcional),
      volume alvo semanal (opcional)
- [ ] Fases ordenadas cronologicamente
- [ ] Datas sobrepostas bloqueadas — DomainErrors.phaseOverlapConflict()
- [ ] POST /api/macrocycles/:id/phases
- [ ] Mínimo 1, máximo 6 fases por macrociclo

### Story 00.3 — Contexto de fase na WeekPage
AC:
- [ ] GET /api/macrocycles/active retorna macrociclo + fase atual
- [ ] Header: "Semana X de Y · Fase Z — [nome da fase]"
- [ ] Barra de progresso da fase (semanas concluídas / total)
- [ ] Banner convidando a criar macrociclo se não houver ativo

## Épico 01 — Gestão de sessões

### Story 01.1 — Criar sessão com form adaptativo
Arquivo: apps/web/src/pages/NewSessionPage.tsx

AC:
- [ ] Select agrupado: Corrida / Força / Complementar
- [ ] Corridas: distância, pace alvo (PaceInput), ambiente, notas
      Pace sugerido automaticamente se PaceProfile existir
- [ ] Força: apenas notas livres
- [ ] MOBILITY: duração estimada + notas
- [ ] REST: apenas confirmar — sem campos
- [ ] Corridas precisam de distância OU duração — validação Zod
- [ ] POST /api/sessions → redirect /week

### Story 01.4 — Log de conclusão
AC:
- [ ] Corridas: distância real, pace real, BPM médio (opcional),
      BPM máx (opcional), sensação 1-5, notas
- [ ] Força/mobilidade: sensação 1-5, notas livres
- [ ] REST: sensação 1-5, notas opcionais
- [ ] Campos pré-preenchidos com valores do plano como sugestão
- [ ] POST /api/sessions/:id/log

## Épico 02 — Visão semanal

### Story 02.1 — WeekPage com contexto de fase
AC:
- [ ] Header: semana X de Y + nome da fase
- [ ] Barra de progresso visual da fase
- [ ] Resumo: KMs concluídos, treinos feitos/planejados
- [ ] Long Run destacado — borda cor --color-long, label "Treino principal"
- [ ] Dias sem sessão: botão + para adicionar

### Story 02.2 — DayCard por tipo
AC:
- [ ] Corridas: ícone + cor + distância + pace + EnvironmentBadge
- [ ] Força: ícone Dumbbell + cor neutra + resumo das notas
- [ ] MOBILITY: ícone Waves + cor neutra
- [ ] REST: ícone Moon + opacidade reduzida
- [ ] Long Run: borda --color-long + label "Treino principal"

## Épico 03 — Dashboard

### Story 03.1 — KPIs do macrociclo
AC:
- [ ] KMs de corrida nesta semana
- [ ] Último longão vs meta da fase atual
- [ ] Streak de consistência (corrida + força + mobilidade)
- [ ] Contagem regressiva até a prova (semanas/dias)

### Story 03.3 — Gráfico de evolução do longão
AC:
- [ ] Linha com evolução da distância do Long Run semana a semana
- [ ] Linha pontilhada com meta progressiva da fase
- [ ] SVG puro — zero biblioteca de charts
- [ ] Eixo X: semanas · Eixo Y: km

## Épico 08 — Usabilidade crítica (próxima prioridade)

### Story 08.1 — Auto-populate da WeekPage
Contexto: WeekPage abre vazia — usuário precisa criar sessão por sessão
manualmente. O objetivo é popular a semana a partir de um template
semanal recorrente definido pelo usuário.

Arquivo: apps/web/src/pages/WeekTemplatePage.tsx

AC:
- [ ] Usuário define um template semanal: para cada dia da semana (Seg-Dom)
      associa 0 ou 1 SessionType com campos opcionais (distância, pace, notas)
- [ ] Template salvo em POST /api/macrocycles/:id/week-template
- [ ] Botão "Popular semana" na WeekPage aplica o template na semana atual
      criando as sessões planejadas para os dias ainda vazios
- [ ] Dias que já têm sessão não são sobrescritos
- [ ] POST /api/weeks/populate { weekStart, macrocycleId }
      retorna TrainingSession[] criadas
- [ ] Confirmação visual: toast com "X sessões adicionadas"
- [ ] Template editável a qualquer momento — mudanças valem da próxima
      semana em diante, não retroativamente
- [ ] Se não há macrociclo ativo, botão desabilitado com tooltip explicativo

### Story 08.2 — Calculadora de zonas de pace
Contexto: sessões não têm pace alvo concreto. Usuário informa um pace
de referência e o sistema calcula as zonas automaticamente.

Arquivo: apps/web/src/pages/PaceCalculatorPage.tsx

AC:
- [ ] Form: pace de referência (PaceInput MM:SS) + tipo de referência:
      · Pace de prova 5km
      · Pace de prova 10km
      · Pace alvo da prova principal
- [ ] Sistema calcula 6 zonas usando fórmula Jack Daniels adaptada:
      · Zona 1 Recovery:  ref + 90~120s/km
      · Zona 2 Easy:      ref + 60~90s/km
      · Zona 3 Tempo:     ref - 15~20s/km
      · Zona 4 Threshold: ref ± 5s/km
      · Zona 5 Race:      pace de referência
      · Long Run:         easy + 15~20s/km
- [ ] Resultado exibido como tabela com faixa min-max por zona
- [ ] Cada zona associada ao SessionType correspondente:
      Recovery → RECOVERY_RUN
      Easy     → EASY_RUN
      Long Run → LONG_RUN
      Tempo    → QUALITY_RUN
      Race     → PACE_RUN / RACE
- [ ] Botão "Salvar perfil de pace" — POST /api/macrocycles/:id/pace-profile
- [ ] Após salvar, NewSessionPage sugere pace automaticamente
      ao criar sessão de corrida baseado na zona do tipo selecionado
- [ ] PaceProfile vinculado ao macrociclo ativo
- [ ] GET /api/macrocycles/:id/pace-profile retorna perfil atual
- [ ] Recalcular: usuário pode atualizar o pace de referência a qualquer
      momento — novo cálculo substitui o perfil anterior

## Endpoints da API

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

## Migration SQL (002_expanded_schema.sql)

ALTER TYPE session_type ADD VALUE 'QUALITY_RUN';
ALTER TYPE session_type ADD VALUE 'PACE_RUN';
ALTER TYPE session_type ADD VALUE 'RECOVERY_RUN';
ALTER TYPE session_type ADD VALUE 'STRENGTH_LOWER';
ALTER TYPE session_type ADD VALUE 'STRENGTH_UPPER';
ALTER TYPE session_type ADD VALUE 'MOBILITY';
ALTER TYPE session_type ADD VALUE 'REST';

CREATE TYPE environment AS ENUM ('TREADMILL', 'OUTDOOR');

ALTER TABLE training_sessions ADD COLUMN environment environment;
ALTER TABLE training_sessions ADD COLUMN target_duration INTEGER;
ALTER TABLE training_sessions ADD COLUMN actual_duration INTEGER;
ALTER TABLE training_sessions ADD COLUMN heart_rate_avg SMALLINT;
ALTER TABLE training_sessions ADD COLUMN heart_rate_max SMALLINT;

CREATE TABLE macrocycles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  goal_distance NUMERIC(5,2) NOT NULL,
  race_date     DATE NOT NULL,
  start_date    DATE NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE phases (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  macrocycle_id        UUID NOT NULL REFERENCES macrocycles(id) ON DELETE CASCADE,
  name                 VARCHAR(255) NOT NULL,
  objective            TEXT NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  order_index          SMALLINT NOT NULL,
  long_run_target      NUMERIC(5,2),
  weekly_volume_target NUMERIC(5,2),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pace_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  macrocycle_id   UUID NOT NULL REFERENCES macrocycles(id) ON DELETE CASCADE,
  reference_pace  VARCHAR(8) NOT NULL,
  reference_type  VARCHAR(20) NOT NULL,
  zones           JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE week_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  macrocycle_id UUID NOT NULL REFERENCES macrocycles(id) ON DELETE CASCADE,
  template      JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phases_macrocycle      ON phases(macrocycle_id);
CREATE INDEX idx_pace_profiles_macro    ON pace_profiles(macrocycle_id);
CREATE INDEX idx_week_templates_macro   ON week_templates(macrocycle_id);

# Ver detalhes de domínio em references/domain.md
