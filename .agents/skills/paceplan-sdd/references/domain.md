# Domínio detalhado — PacePlan v2

## SessionType — referência completa

| Enum | Label | Cor | Ícone Lucide | É corrida? | Tem distância/pace? |
|------|-------|-----|-------------|------------|---------------------|
| EASY_RUN | Easy Run | #22c55e | Activity | sim | sim |
| QUALITY_RUN | Quality Run | #f97316 | Timer | sim | sim |
| LONG_RUN | Long Run | #8b5cf6 | TrendingUp | sim | sim |
| PACE_RUN | Pace Run | #ec4899 | Gauge | sim | sim |
| RECOVERY_RUN | Recovery Run | #06b6d4 | Wind | sim | sim |
| RACE | Race | #eab308 | Trophy | sim | sim |
| STRENGTH_LOWER | Força — Inferiores | #6366f1 | Dumbbell | não | não |
| STRENGTH_UPPER | Força — Superiores | #818cf8 | Dumbbell | não | não |
| MOBILITY | Mobilidade | #64748b | PersonStanding | não | não |
| REST | Descanso | #334155 | Moon | não | não |

## FeelingScale
| Valor | Label |
|-------|-------|
| 1 | Muito difícil |
| 2 | Difícil |
| 3 | OK |
| 4 | Bem |
| 5 | Ótimo |

## Regras de streak
- Corrida done → conta
- STRENGTH_* done → conta
- MOBILITY done → conta
- REST planned ou done → conta (não quebra)
- skipped → não conta
- Dia sem nenhum registro → quebra o streak

## Regras de volume semanal de corrida
- Soma apenas actualDistance de sessões onde isRunningSession(type) = true e status = 'done'
- STRENGTH_*, MOBILITY, REST não entram no volume de corrida
- Volume de corrida ≠ total de atividades

## Fase atual — como calcular
```ts
function getCurrentPhase(phases: Phase[], today: string): Phase | null {
  return phases.find(p => p.startDate <= today && p.endDate >= today) ?? null;
}

function getWeekNumberInPhase(phase: Phase, today: string): number {
  const start = new Date(phase.startDate);
  const current = new Date(today);
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

function getTotalWeeksInPhase(phase: Phase): number {
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}
```

## Hooks disponíveis

### useSessions(startDate, endDate)
```ts
const {
  sessions, loading, error,
  createSession, updateSession, logSession,
  skipSession, reactivateSession, deleteSession, refetch,
} = useSessions(startDate, endDate);
```

### useWeek(initialDate?)
```ts
const {
  weekStart, weekEnd, days, isCurrentWeek,
  goToPrevWeek, goToNextWeek, goToCurrentWeek,
} = useWeek();
```

### useMacrocycle() — a criar
```ts
const {
  macrocycle,       // Macrocycle | null
  currentPhase,     // Phase | null
  phases,           // Phase[]
  weekInPhase,      // number
  totalWeeksInPhase, // number
  weeksToRace,      // number
  loading,
} = useMacrocycle();
```

## sessionUtils.ts — funções a atualizar

```ts
// Verificadores de tipo
isRunningSession(type: SessionType): boolean
isStrengthSession(type: SessionType): boolean
hasDistanceAndPace(type: SessionType): boolean

// Formatadores
getTypeColor(type: SessionType): string
getTypeLabel(type: SessionType): string
getTypeIcon(type: SessionType): LucideIcon  // retorna componente Lucide
getEnvironmentLabel(env: Environment): string  // "Esteira" | "Rua"

// Utilitários existentes
formatPace(pace: string): string
formatDistance(km: number): string
formatDate(iso: string): string
isToday(iso: string): boolean
```
