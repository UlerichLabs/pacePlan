# Domínio detalhado — PacePlan

## SessionType — referência completa

| Enum | Label | Cor CSS | Tem distância? | Descrição |
|------|-------|---------|----------------|-----------|
| EASY_RUN | Easy Run | --color-easy (#22c55e) | sim | Pace conversacional, recuperação ativa |
| TEMPO_RUN | Tempo Run | --color-tempo (#f97316) | sim | Pace threshold, desconfortável mas sustentável |
| LONG_RUN | Long Run | --color-long (#8b5cf6) | sim | Longa em pace easy, foco em volume |
| INTERVAL | Interval | --color-interval (#ef4444) | sim | Tiros curtos alta intensidade com recuperação |
| HILL_REPS | Hill Reps | --color-hills (#eab308) | sim | Repetições em subida com volta fácil |
| RACE | Race | --color-race (#ec4899) | sim | Corrida/prova oficial |
| REST_DAY | Rest Day | --color-rest (#6b7280) | não | Descanso ativo ou total |
| CROSS_TRAINING | Cross Training | --color-cross (#06b6d4) | sim | Natação, bike, musculação, yoga |

## FeelingScale — labels

| Valor | Label |
|-------|-------|
| 1 | Muito difícil |
| 2 | Difícil |
| 3 | OK |
| 4 | Bem |
| 5 | Ótimo |

## Regras de negócio — detalhamento

### Streak
- Incrementa quando qualquer sessão `done` OU `REST_DAY` registrado no dia
- Sessão `skipped` não conta (quebra o streak)
- Streak quebra se passar 1 dia corrido sem nenhum registro válido
- Quando quebrado, reinicia do zero no próximo treino
- `longestStreak` = maior sequência histórica (calculado localmente)

### Volume
- Soma `actualDistance` de sessões com `status: 'done'`
- REST_DAY nunca entra no cálculo de volume
- `weeklyKm` = soma da semana atual (segunda a domingo)
- `monthlyKm` = soma do mês atual

### Validação de pace
- Formato: `MM:SS` onde MM pode ter 1 ou 2 dígitos
- Regex: `/^\d{1,2}:\d{2}$/`
- Exemplos válidos: "5:30", "10:00", "4:45"
- Exemplos inválidos: "5:3", "5:300", "pace"

### Status transitions
```
planned → done     (via POST /log)
planned → skipped  (via POST /skip)
skipped → planned  (via POST /reactivate)
done    → (imutável, exceto notas)
```

## Hooks e serviços disponíveis

### useSessions(startDate, endDate)
```ts
const {
  sessions,        // TrainingSession[]
  loading,         // boolean
  error,           // string | null
  createSession,   // (payload: CreateSessionPayload) => Promise<TrainingSession>
  updateSession,   // (id, payload: UpdateSessionPayload) => Promise<TrainingSession>
  logSession,      // (id, payload: LogSessionPayload) => Promise<TrainingSession>
  skipSession,     // (id) => Promise<void>
  reactivateSession, // (id) => Promise<void>
  deleteSession,   // (id) => Promise<void>
  refetch,         // () => Promise<void>
} = useSessions(startDate, endDate)
```

### useWeek(initialDate?)
```ts
const {
  weekStart,       // string YYYY-MM-DD (segunda)
  weekEnd,         // string YYYY-MM-DD (domingo)
  days,            // string[] — 7 dias da semana
  isCurrentWeek,   // boolean
  goToPrevWeek,    // () => void
  goToNextWeek,    // () => void
  goToCurrentWeek, // () => void
} = useWeek()
```

### sessionUtils.ts
```ts
getTypeColor(type: SessionType): string      // hex da cor
getTypeLabel(type: SessionType): string      // "Easy Run" etc
hasDistance(type: SessionType): boolean      // false só para REST_DAY
formatPace(pace: string): string             // "5:30" → "5:30/km"
formatDistance(km: number): string           // 10.5 → "10.5 km"
formatDate(iso: string): string              // "seg., 7 de abr."
isToday(iso: string): boolean
```
