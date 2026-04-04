---
name: paceplan-sdd
description: Spec Driven Development do PacePlan — modelo de domínio revisado com macrociclo, fases, SessionTypes expandidos (força + mobilidade + corrida) e acceptance criteria completos. Use sempre que for implementar qualquer feature, página ou componente do PacePlan. Invoque ao mencionar "story", "épico", "AC", "macrociclo", "fase", "implementar" ou qualquer nome de página do projeto.
license: Proprietary
metadata:
  author: UlerichLabs
  version: "2.0"
  project: paceplan
compatibility: Claude Code, Gemini CLI, Codex
---

## Contexto do produto

O PacePlan é usado por corredores que já têm um plano de treino (gerado por coach ou IA) e precisam de um lugar para executar, registrar e acompanhar. A semana real do usuário inclui corrida + musculação + mobilidade — não é só corrida.

Caso de uso central: Lucas, meia maratona novembro 2026. Plano de 7 meses em 4 fases. Segunda: musculação inferiores. Terça: easy run esteira. Quarta: musculação superiores/core. Quinta: quality run esteira. Sexta: mobilidade. Sábado: descanso. Domingo: long run rua Petrópolis.

---

## Hierarquia de domínio

```
Macrociclo (ex: Meia Maratona Novembro 2026)
  └── Phase / Fase (ex: Fase 1 — Construção de Base · Abril → Junho)
        └── Semana (contexto calculado pela data atual)
              └── TrainingSession (ex: Domingo · Long Run · 8 km · Rua)
                    └── SessionLog (dados reais pós-treino)
```

---

## Modelo de domínio

### Macrociclo
```ts
interface Macrocycle {
  id: string
  name: string               // "Meia Maratona — Novembro 2026"
  goalDistance: number       // km — 21
  raceDate: string           // YYYY-MM-DD
  startDate: string          // YYYY-MM-DD
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### Phase (Fase)
```ts
interface Phase {
  id: string
  macrocycleId: string
  name: string               // "Fase 1 — Construção de Base"
  objective: string          // "Consolidar 10 km de forma confortável"
  startDate: string
  endDate: string
  order: number              // 1, 2, 3, 4
  longRunTarget?: number     // km — meta do longão desta fase
  weeklyVolumeTarget?: number // km — volume alvo de corrida semanal
}
```

### SessionType (enum expandido)
```ts
enum SessionType {
  // Corridas
  EASY_RUN = "EASY_RUN",           // Zona 2, ritmo de conversa
  QUALITY_RUN = "QUALITY_RUN",     // Tiros, variação de pace, inclinação
  LONG_RUN = "LONG_RUN",           // Longão — treino principal do fim de semana
  PACE_RUN = "PACE_RUN",           // Cravar o pace alvo da prova
  RECOVERY_RUN = "RECOVERY_RUN",   // Corrida regenerativa, muito leve
  RACE = "RACE",                   // Prova oficial

  // Força
  STRENGTH_LOWER = "STRENGTH_LOWER", // Inferiores: agachamento, leg press, panturrilha
  STRENGTH_UPPER = "STRENGTH_UPPER", // Superiores/core: costas, peito, abdômen, lombar

  // Complementar
  MOBILITY = "MOBILITY",           // Alongamento, mobilidade articular
  REST = "REST",                   // Descanso total
}
```

### Environment (enum — só para corridas)
```ts
enum Environment {
  TREADMILL = "TREADMILL",  // Esteira — ambiente controlado
  OUTDOOR = "OUTDOOR",      // Rua / trilha
}
```

### TrainingSession
```ts
interface TrainingSession {
  id: string
  date: string                      // YYYY-MM-DD
  type: SessionType
  targetDistance?: number           // km — apenas corridas
  targetDuration?: number           // minutos — alternativa à distância
  targetPace?: string               // "MM:SS" — apenas corridas
  environment?: Environment         // apenas corridas
  notes?: string
  status: 'planned' | 'done' | 'skipped'
  log?: SessionLog
  createdAt: string
  updatedAt: string
}
```

### SessionLog
```ts
interface SessionLog {
  actualDistance?: number    // km — corridas
  actualDuration?: number    // minutos
  actualPace?: string        // "MM:SS" — corridas
  heartRateAvg?: number      // BPM — opcional
  heartRateMax?: number      // BPM — opcional
  feeling: 1 | 2 | 3 | 4 | 5
  notes?: string
  completedAt: string
}
```

### Regras de domínio críticas
1. Corridas (EASY, QUALITY, LONG, PACE, RECOVERY, RACE): têm targetDistance, targetPace, environment
2. STRENGTH_LOWER, STRENGTH_UPPER, MOBILITY: sem campos de corrida — só notas e duração opcional
3. REST: sem campos — apenas sensação e notas opcionais no log
4. REST, MOBILITY e STRENGTH_* contam no streak de consistência
5. Volume semanal de corrida = soma de actualDistance de corridas com status 'done'
6. Long Run do domingo é o treino mais importante da semana — destaque visual

---

## SessionTypes que são corridas (helpers)
```ts
const RUNNING_TYPES = [
  SessionType.EASY_RUN,
  SessionType.QUALITY_RUN,
  SessionType.LONG_RUN,
  SessionType.PACE_RUN,
  SessionType.RECOVERY_RUN,
  SessionType.RACE,
];

function isRunningSession(type: SessionType): boolean {
  return RUNNING_TYPES.includes(type);
}
```

---

## Épico 00 — Macrociclo e Fases (P0 — implementar primeiro)

### Story 00.1 — Criar macrociclo
**Arquivo:** `apps/web/src/pages/MacrocyclePage.tsx`

**Acceptance Criteria:**
- [ ] Form: nome, distância objetivo (km), data da prova (date picker), data de início
- [ ] Sistema calcula duração total em semanas automaticamente
- [ ] Apenas 1 macrociclo ativo por vez
- [ ] POST /api/macrocycles
- [ ] Após criação, redirect para criação de fases

### Story 00.2 — Criar fases do macrociclo
**Acceptance Criteria:**
- [ ] Form: nome, objetivo, data início, data fim, meta de longão (km, opcional), volume alvo semanal (km, opcional)
- [ ] Fases ordenadas cronologicamente
- [ ] POST /api/macrocycles/:id/phases
- [ ] Mínimo 1 fase, máximo 6 fases por macrociclo

### Story 00.3 — Contexto de fase na WeekPage
**Acceptance Criteria:**
- [ ] GET /api/macrocycles/active retorna macrociclo ativo + fase atual
- [ ] WeekPage header exibe: "Semana X de Y · Fase Z — [nome da fase]"
- [ ] Barra de progresso da fase (semanas concluídas / total de semanas da fase)
- [ ] Se não há macrociclo ativo, exibe banner convidando a criar um

---

## Épico 01 — Gestão de sessões (revisado)

### Story 01.1 — Criar sessão com form adaptativo
**Arquivo:** `apps/web/src/pages/NewSessionPage.tsx`

**Acceptance Criteria:**
- [ ] Select de tipo agrupa por categoria:
  - Corrida: Easy Run, Quality Run, Long Run, Pace Run, Recovery Run, Race
  - Força: Força — Inferiores, Força — Superiores
  - Complementar: Mobilidade, Descanso
- [ ] Para corridas: exibe distância alvo, pace alvo, ambiente (esteira/rua), notas
- [ ] Para força: exibe apenas campo de notas livres (ex: "Agachamento 4x12, Leg Press 3x15")
- [ ] Para MOBILITY: exibe duração estimada (minutos) e notas
- [ ] Para REST: apenas confirmar — sem campos
- [ ] Validação: corridas precisam de distância OU duração
- [ ] POST /api/sessions → redirect /week

### Story 01.4 — Log de conclusão (revisado)
**Acceptance Criteria:**
- [ ] Para corridas: distância real, pace real, BPM médio (opcional), BPM máx (opcional), sensação 1-5, notas
- [ ] Para força/mobilidade: sensação 1-5, notas livres
- [ ] Para REST: sensação 1-5, notas opcionais
- [ ] Campos de corrida pré-preenchidos com valores do plano como sugestão
- [ ] POST /api/sessions/:id/log

---

## Épico 02 — Visão semanal (revisado)

### Story 02.1 — WeekPage com contexto de fase
**Acceptance Criteria:**
- [ ] Header: semana X de Y na fase + nome da fase
- [ ] Barra de progresso visual da fase
- [ ] Resumo: KMs de corrida concluídos esta semana, treinos feitos/planejados
- [ ] Long Run destacado visualmente (card com borda mais grossa ou cor diferente)
- [ ] Dias sem sessão: botão "+" para adicionar

### Story 02.2 — DayCard por tipo
**Acceptance Criteria:**
- [ ] Corridas: ícone Lucide + cor da sessão + distância alvo + pace alvo + badge ambiente (Esteira/Rua)
- [ ] Força: ícone Dumbbell + cor neutra + resumo das notas se existirem
- [ ] MOBILITY: ícone Stretching + cor neutra
- [ ] REST: ícone Moon + visual com opacidade reduzida
- [ ] Long Run: destaque especial — borda da cor primária ou indicador "Treino principal"

---

## Épico 03 — Dashboard (revisado)

### Story 03.1 — KPIs relevantes para o macrociclo
**Acceptance Criteria:**
- [ ] KMs de corrida nesta semana
- [ ] Distância do último longão vs meta de longão da fase atual
- [ ] Streak de consistência geral (corrida + força + mobilidade)
- [ ] Semanas até a prova (contagem regressiva em dias/semanas)

### Story 03.3 — Gráfico de evolução do longão
**Acceptance Criteria:**
- [ ] Gráfico de linha com evolução da distância do Long Run semana a semana
- [ ] Linha pontilhada mostrando meta progressiva da fase
- [ ] SVG puro — zero biblioteca de charts
- [ ] Eixo X: semanas · Eixo Y: km

---

## Endpoints da API

```
GET    /api/macrocycles/active
POST   /api/macrocycles
GET    /api/macrocycles/:id/phases
POST   /api/macrocycles/:id/phases

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

## Migration SQL necessária (002_expanded_schema.sql)

```sql
-- Novos tipos no enum session_type
ALTER TYPE session_type ADD VALUE 'QUALITY_RUN';
ALTER TYPE session_type ADD VALUE 'PACE_RUN';
ALTER TYPE session_type ADD VALUE 'RECOVERY_RUN';
ALTER TYPE session_type ADD VALUE 'STRENGTH_LOWER';
ALTER TYPE session_type ADD VALUE 'STRENGTH_UPPER';
ALTER TYPE session_type ADD VALUE 'MOBILITY';
ALTER TYPE session_type ADD VALUE 'REST';
-- Remover tipos antigos: TEMPO_RUN, INTERVAL, HILL_REPS, REST_DAY, CROSS_TRAINING

-- Novo enum environment
CREATE TYPE environment AS ENUM ('TREADMILL', 'OUTDOOR');

-- Novas colunas em training_sessions
ALTER TABLE training_sessions ADD COLUMN environment environment;
ALTER TABLE training_sessions ADD COLUMN target_duration INTEGER; -- minutos

-- Novas colunas no log
ALTER TABLE training_sessions ADD COLUMN actual_duration INTEGER;
ALTER TABLE training_sessions ADD COLUMN heart_rate_avg SMALLINT;
ALTER TABLE training_sessions ADD COLUMN heart_rate_max SMALLINT;

-- Tabela macrocycles
CREATE TABLE macrocycles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(255) NOT NULL,
  goal_distance NUMERIC(5,2) NOT NULL,
  race_date  DATE NOT NULL,
  start_date DATE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela phases
CREATE TABLE phases (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  macrocycle_id         UUID NOT NULL REFERENCES macrocycles(id) ON DELETE CASCADE,
  name                  VARCHAR(255) NOT NULL,
  objective             TEXT NOT NULL,
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  order_index           SMALLINT NOT NULL,
  long_run_target       NUMERIC(5,2),
  weekly_volume_target  NUMERIC(5,2),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phases_macrocycle ON phases(macrocycle_id);
```

Ver detalhes de domínio em [references/domain.md](references/domain.md).
