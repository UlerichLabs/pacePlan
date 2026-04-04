---
name: paceplan-sdd
description: Spec Driven Development do PacePlan com modelo de domínio, épicos, user stories e acceptance criteria. Use sempre que for implementar qualquer feature, página ou componente do PacePlan — especialmente ao trabalhar em NewSessionPage, SessionDetailPage, DashboardPage, HistoryPage, ou qualquer story dos épicos 01 ao 05. Invoque quando o usuário mencionar "story", "épico", "AC", "implementar", ou qualquer nome de página do projeto.
license: Proprietary
metadata:
  author: UlerichLabs
  version: "1.0"
  project: paceplan
compatibility: Claude Code, Gemini CLI, Codex — qualquer agente com suporte ao padrão Agent Skills
---

## Modelo de domínio

### TrainingSession
```
id:             UUID
date:           string (YYYY-MM-DD)
type:           SessionType (enum)
targetDistance: number | undefined (km)
targetPace:     string | undefined ("MM:SS")
notes:          string | undefined
status:         'planned' | 'done' | 'skipped'
log:            SessionLog | undefined
createdAt:      string (ISO)
updatedAt:      string (ISO)
```

### SessionLog
```
actualDistance: number (km)
actualPace:     string ("MM:SS")
feeling:        1 | 2 | 3 | 4 | 5
notes:          string | undefined
completedAt:    string (ISO)
```

### SessionType enum
```
EASY_RUN | TEMPO_RUN | LONG_RUN | INTERVAL | HILL_REPS | RACE | REST_DAY | CROSS_TRAINING
```

### Regras de domínio críticas
1. REST_DAY nunca tem targetDistance nem targetPace — campos desabilitados no form
2. status 'done' só existe com SessionLog preenchido
3. status 'skipped' não conta em volume nem streak
4. REST_DAY conta como dia válido no streak (não quebra)
5. Pace sempre no formato "MM:SS" (ex: "5:30")
6. Distâncias sempre em km

Para detalhes completos de domínio, ver [references/domain.md](references/domain.md).

---

## Épico 01 — Gestão de sessões

### Story 01.1 — Criar sessão
**Arquivo:** `apps/web/src/pages/NewSessionPage.tsx`
**Componentes novos:** `SessionForm.tsx`, `SessionTypeSelect.tsx`, `PaceInput.tsx`

**Acceptance Criteria:**
- [ ] Form com: tipo (select), data (date picker), distância alvo (number), pace alvo (MM:SS), notas (textarea opcional)
- [ ] Select usa SESSION_TYPE_LABELS de @paceplan/types
- [ ] targetDistance e targetPace desabilitados quando tipo = REST_DAY
- [ ] Validação: date obrigatório; distance positivo (exceto REST_DAY); pace regex `/^\d{1,2}:\d{2}$/`
- [ ] Submit: POST /api/sessions → redirecionar para /week
- [ ] Sessão criada com status 'planned' por padrão

### Story 01.2 — Editar sessão
**Arquivo:** `apps/web/src/pages/SessionDetailPage.tsx`

**Acceptance Criteria:**
- [ ] Form pré-preenchido com dados da sessão existente
- [ ] Todos os campos editáveis (date, type, distance, pace, notes)
- [ ] Mudar tipo para REST_DAY limpa e desabilita distance e pace
- [ ] status 'done': só permite editar notes do plano
- [ ] Botão "Cancelar" descarta alterações sem salvar
- [ ] Submit: PATCH /api/sessions/:id

### Story 01.3 — Deletar sessão
**Acceptance Criteria:**
- [ ] Botão deletar na tela de detalhes
- [ ] window.confirm antes de deletar
- [ ] DELETE /api/sessions/:id → redirecionar para /week

### Story 01.4 — Marcar como concluída
**Componentes novos:** `LogForm.tsx`, `FeelingScale.tsx`

**Acceptance Criteria:**
- [ ] Botão "Concluir treino" em sessões planned
- [ ] Form de log: distância real, pace real, sensação (1–5 visual), notas opcional
- [ ] Campos pré-preenchidos com valores do plano como sugestão
- [ ] Submit: POST /api/sessions/:id/log
- [ ] Card muda para estado "done" (verde + check)
- [ ] targetDistance e targetPace preservados — não sobrescrever
- [ ] Sessão done exibe "Ver detalhes" em vez de "Concluir treino"

### Story 01.5 — Pular sessão
**Acceptance Criteria:**
- [ ] Botão "Pular treino" em sessões planned
- [ ] POST /api/sessions/:id/skip
- [ ] Card muda para "skipped" (cinza + X)
- [ ] Botão "Reativar" → POST /api/sessions/:id/reactivate

---

## Épico 02 — Visão semanal

### Story 02.2 — Detalhes de sessão
**Arquivo:** `apps/web/src/pages/SessionDetailPage.tsx`

**Acceptance Criteria:**
- [ ] Exibe: type, date, targetDistance, targetPace, notes do plano
- [ ] Se done: exibe SessionLog + delta (actualDistance vs targetDistance, actualPace vs targetPace)
- [ ] Ações por status:
  - planned → Concluir / Pular / Editar / Deletar
  - done → Deletar
  - skipped → Reativar / Deletar

---

## Épico 03 — Dashboard

### Story 03.1 — KPIs de volume
**Arquivo:** `apps/web/src/pages/DashboardPage.tsx`
**Componente novo:** `KpiCards.tsx`

**Acceptance Criteria:**
- [ ] Cards: KMs semana atual, KMs mês atual, total treinos no mês
- [ ] Apenas sessões com status 'done' contam
- [ ] REST_DAY não soma distância
- [ ] GET /api/sessions com range dos últimos 30 dias

### Story 03.2 — Streak
**Acceptance Criteria:**
- [ ] Streak em destaque no dashboard
- [ ] Incrementa com sessão done ou REST_DAY no dia
- [ ] Quebra se 1 dia sem registro (exceto REST_DAY)
- [ ] Recorde pessoal (maior streak histórico)
- [ ] Cálculo no frontend em `apps/web/src/services/sessionUtils.ts`

### Story 03.3 — Gráfico de volume semanal
**Componente novo:** `VolumeChart.tsx`

**Acceptance Criteria:**
- [ ] Barras SVG inline com últimas 8 semanas — ZERO biblioteca de charts
- [ ] Tooltip ao hover mostra: período + KMs totais
- [ ] Semana atual destacada com var(--color-primary)
- [ ] Estado vazio legível

---

## Endpoints de referência

```
GET    /api/sessions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET    /api/sessions/:id
POST   /api/sessions                  → CreateSessionPayload
PATCH  /api/sessions/:id              → UpdateSessionPayload
DELETE /api/sessions/:id
POST   /api/sessions/:id/log          → LogSessionPayload
POST   /api/sessions/:id/skip
POST   /api/sessions/:id/reactivate
```

Todos os tipos de payload estão em `packages/types/src/index.ts`.
