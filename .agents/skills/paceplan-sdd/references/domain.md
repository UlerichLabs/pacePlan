# Domínio detalhado — PacePlan v3

Referência canônica do modelo de domínio.
Atualizar sempre que o SDD mudar.
Fonte de verdade para cores e ícones: paceplan-design → SESSION_COLORS e SESSION_ICONS.

## SessionType — referência completa

| Enum           | Label               | Cor     | Ícone Lucide | É corrida? | Tem dist/pace? |
|----------------|---------------------|---------|--------------|------------|----------------|
| EASY_RUN       | Easy Run            | #22c55e | Activity     | sim        | sim            |
| QUALITY_RUN    | Quality Run         | #f97316 | Flame        | sim        | sim            |
| LONG_RUN       | Long Run            | #8b5cf6 | TrendingUp   | sim        | sim            |
| PACE_RUN       | Pace Run            | #6366f1 | Target       | sim        | sim            |
| RECOVERY_RUN   | Recovery Run        | #06b6d4 | Wind         | sim        | sim            |
| RACE           | Race                | #ec4899 | Trophy       | sim        | sim            |
| STRENGTH_LOWER | Força — Inferiores  | #f59e0b | Dumbbell     | não        | não            |
| STRENGTH_UPPER | Força — Superiores  | #f59e0b | Dumbbell     | não        | não            |
| MOBILITY       | Mobilidade          | #14b8a6 | Waves        | não        | não            |
| REST           | Descanso            | #6b7280 | Moon         | não        | não            |

## FeelingScale

| Valor | Label        |
|-------|--------------|
| 1     | Péssimo      |
| 2     | Ruim         |
| 3     | Ok           |
| 4     | Bom          |
| 5     | Ótimo        |

## Regras de streak

- Corrida done       → conta
- STRENGTH_* done    → conta
- MOBILITY done      → conta
- REST planned/done  → conta (não quebra o streak)
- skipped            → não conta
- Dia sem registro   → quebra o streak

## Regras de volume semanal de corrida

- Soma apenas actualDistance onde isRunningSession(type) = true e status = 'done'
- STRENGTH_*, MOBILITY, REST não entram no volume de corrida
- Volume de corrida ≠ total de atividades da semana

## Fase atual — funções em @paceplan/utils

export function getCurrentPhase(phases: Phase[], today: string): Phase | null {
  return phases.find(p => p.startDate <= today && p.endDate >= today) ?? null
}

export function getWeekNumberInPhase(phase: Phase, today: string): number {
  const start = new Date(phase.startDate)
  const current = new Date(today)
  const diffDays = Math.floor(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.floor(diffDays / 7) + 1
}

export function getTotalWeeksInPhase(phase: Phase): number {
  const start = new Date(phase.startDate)
  const end = new Date(phase.endDate)
  const diffDays = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.ceil(diffDays / 7)
}

export function getWeeksToRace(raceDate: string): number {
  const today = new Date()
  const race = new Date(raceDate)
  const diffDays = Math.floor(
    (race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.ceil(diffDays / 7)
}

## Calculadora de pace — @paceplan/utils

# Fórmula Jack Daniels adaptada.
# Todos os paces internamente em segundos totais por km.
# Exportar sempre como "MM:SS".

export function calcPaceZones(
  referencePace: string,
  referenceType: PaceProfile['referenceType']
): PaceZones {
  const refSec = paceToSeconds(referencePace)

  const adjustments: Record = {
    RACE_5K:     +15,
    RACE_10K:    0,
    TARGET_RACE: -10,
  }

  const base = refSec + adjustments[referenceType]

  return {
    recovery:  { min: secondsToPace(base + 105), max: secondsToPace(base + 120) },
    easy:      { min: secondsToPace(base + 60),  max: secondsToPace(base + 90)  },
    longRun:   { min: secondsToPace(base + 75),  max: secondsToPace(base + 90)  },
    tempo:     { min: secondsToPace(base - 20),  max: secondsToPace(base - 15)  },
    threshold: { min: secondsToPace(base - 5),   max: secondsToPace(base + 5)   },
    race:      { min: secondsToPace(base - 5),   max: secondsToPace(base + 5)   },
  }
}

export function getPaceForSessionType(
  type: SessionType,
  zones: PaceZones
): { min: string; max: string } | null {
  const map: Partial> = {
    [SessionType.RECOVERY_RUN]: 'recovery',
    [SessionType.EASY_RUN]:     'easy',
    [SessionType.LONG_RUN]:     'longRun',
    [SessionType.QUALITY_RUN]:  'tempo',
    [SessionType.PACE_RUN]:     'threshold',
    [SessionType.RACE]:         'race',
  }
  const key = map[type]
  return key ? zones[key] : null
}

function paceToSeconds(pace: string): number {
  const [min, sec] = pace.split(':').map(Number)
  return min * 60 + sec
}

function secondsToPace(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const min = Math.floor(s / 60)
  const sec = s % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

## Hooks — @paceplan/ui-logic

# Interface TanStack Query — isPending/isFetching, sem loading/refetch explícito.

import { useSessions } from '@paceplan/ui-logic'

const {
  sessions,          // TrainingSession[]
  isPending,         // boolean
  isFetching,        // boolean
  error,             // Error | null
  createSession,     // (payload: CreateSessionPayload) => Promise
  updateSession,     // (id, payload) => Promise
  logSession,        // (id, payload) => Promise
  skipSession,       // (id) => Promise
  reactivateSession, // (id) => Promise
  deleteSession,     // (id) => Promise
} = useSessions(startDate, endDate)

import { useWeek } from '@paceplan/ui-logic'

const {
  weekStart,        // string YYYY-MM-DD
  weekEnd,          // string YYYY-MM-DD
  days,             // string[] — 7 datas
  isCurrentWeek,    // boolean
  goToPrevWeek,     // () => void
  goToNextWeek,     // () => void
  goToCurrentWeek,  // () => void
} = useWeek()

import { useMacrocycleActive } from '@paceplan/ui-logic'

const {
  macrocycle,         // Macrocycle | null
  currentPhase,       // Phase | null
  phases,             // Phase[]
  weekInPhase,        // number
  totalWeeksInPhase,  // number
  weeksToRace,        // number
  isPending,          // boolean
} = useMacrocycleActive()

## Utils — @paceplan/utils

isRunningSession(type: SessionType): boolean
isStrengthSession(type: SessionType): boolean
hasDistanceAndPace(type: SessionType): boolean

getTypeColor(type: SessionType): string        // ex: "#22c55e"
getTypeLabel(type: SessionType): string        // ex: "Easy Run"
getTypeIcon(type: SessionType): LucideIcon
getEnvironmentLabel(env: Environment): string  // "Esteira" | "Rua"

formatPace(pace: string): string               // "5:30" → "5:30/km"
formatDistance(km: number): string            // 10.5 → "10.5 km"
formatDate(iso: string): string               // "seg., 7 de abr."
isToday(iso: string): boolean
getWeekStart(iso: string): string             // retorna segunda-feira
addDays(iso: string, n: number): string

getCurrentPhase(phases, today): Phase | null
getWeekNumberInPhase(phase, today): number
getTotalWeeksInPhase(phase): number
getWeeksToRace(raceDate): number

calcPaceZones(referencePace, referenceType): PaceZones
getPaceForSessionType(type, zones): { min: string; max: string } | null
paceToSeconds(pace: string): number
secondsToPace(totalSeconds: number): string
