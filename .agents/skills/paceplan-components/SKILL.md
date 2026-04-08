---
name: paceplan-components
description: >
  Padrões de componentes React do PacePlan — estrutura de página, hooks
  de dados com TanStack Query, utilitários e componentes de formulário.
  Use junto com paceplan-design para visual. Invoque quando for criar
  componentes React, implementar lógica de UI, trabalhar com hooks de
  dados ou formulários em apps/web.
compatibility: >
  Claude Code, Gemini CLI, Codex. Stack: React 18 + Vite 6 + TypeScript
  + TanStack Query v5 + React Router Dom v6 + Shadcn/ui + Tailwind v4.
metadata:
  author: UlerichLabs
  version: "2.0"
  project: paceplan
---

## Regras absolutas

- ZERO `any` ou `as unknown`
- ZERO emojis — sempre Lucide React
- ZERO class components React
- ZERO `console.log`
- ZERO comentários no código
- ZERO tipos duplicados que existem em `@paceplan/types`
- ZERO `useState + useEffect` para dados remotos — sempre TanStack Query
- ZERO fetch direto em componente — sempre via hook de `@paceplan/ui-logic`
- Para visual e design system, consultar sempre `paceplan-design`

## Estrutura de página padrão

# Páginas são orquestração pura — sem lógica inline, sem JSX pesado.
# Header com glass-strong, conteúdo scrollável, máximo 200 linhas.

export function MinhaPage() {
  const navigate = useNavigate()

  return (
    

      

         navigate(-1)}
          className="text-[--text-muted] hover:text-[--text-primary]"
        >
          
        
        

          Título
        

      

      

        {/* conteúdo */}
      

    

  )
}

## Hooks de dados — @paceplan/ui-logic

# Todos os hooks vivem em packages/ui-logic/src/
# Importar sempre de @paceplan/ui-logic — nunca recriar em apps/web
# Construídos sobre TanStack Query — expõem interface limpa para os componentes

### useSessions(startDate, endDate)

import { useSessions } from '@paceplan/ui-logic'

const {
  sessions,          // TrainingSession[]
  isPending,         // boolean — carregando pela primeira vez
  isFetching,        // boolean — refetch em background
  error,             // Error | null

  createSession,     // (payload: CreateSessionPayload) => Promise
  updateSession,     // (id: string, payload: UpdateSessionPayload) => Promise
  logSession,        // (id: string, payload: LogSessionPayload) => Promise
  skipSession,       // (id: string) => Promise
  reactivateSession, // (id: string) => Promise
  deleteSession,     // (id: string) => Promise
} = useSessions(startDate, endDate)

# Implementação interna (packages/ui-logic/src/useSessions.ts)
export function useSessions(startDate: string, endDate: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: sessionKeys.range(startDate, endDate),
    queryFn: () => getSessions(startDate, endDate),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: sessionKeys.range(startDate, endDate) })

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: invalidate,
  })

  const logMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LogSessionPayload }) =>
      logSession(id, payload),
    onSuccess: invalidate,
  })

  return {
    sessions: query.data ?? [],
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    createSession: createMutation.mutateAsync,
    logSession: (id: string, payload: LogSessionPayload) =>
      logMutation.mutateAsync({ id, payload }),
    skipSession: /* useMutation similar */ ...,
    reactivateSession: /* useMutation similar */ ...,
    updateSession: /* useMutation similar */ ...,
    deleteSession: /* useMutation similar */ ...,
  }
}

### useWeek(initialDate?)

import { useWeek } from '@paceplan/ui-logic'

const {
  weekStart,        // string YYYY-MM-DD (segunda-feira)
  weekEnd,          // string YYYY-MM-DD (domingo)
  days,             // string[] — 7 datas da semana
  isCurrentWeek,    // boolean
  goToPrevWeek,     // () => void
  goToNextWeek,     // () => void
  goToCurrentWeek,  // () => void
} = useWeek()

# Implementação interna (packages/ui-logic/src/useWeek.ts)
# Estado local — não usa TanStack Query (não é dado remoto)
export function useWeek(initialDate?: string) {
  const [weekStart, setWeekStart] = useState(() =>
    getWeekStart(initialDate ?? new Date().toISOString().slice(0, 10))
  )

  const weekEnd = addDays(weekStart, 6)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const isCurrentWeek = weekStart === getWeekStart(
    new Date().toISOString().slice(0, 10)
  )

  return {
    weekStart,
    weekEnd,
    days,
    isCurrentWeek,
    goToPrevWeek:     () => setWeekStart(w => addDays(w, -7)),
    goToNextWeek:     () => setWeekStart(w => addDays(w, 7)),
    goToCurrentWeek:  () => setWeekStart(getWeekStart(
      new Date().toISOString().slice(0, 10)
    )),
  }
}

### useMacrocycleActive()

import { useMacrocycleActive } from '@paceplan/ui-logic'

const {
  macrocycle,    // Macrocycle | null
  currentPhase,  // Phase | null
  weekIndex,     // number — semana atual dentro da fase (1-based)
  totalWeeks,    // number — total de semanas da fase
  isPending,     // boolean
} = useMacrocycleActive()

## Query keys — @paceplan/api-client

# Centralizar em packages/api-client/src/keys.ts
# Usar em todos os hooks — nunca strings soltas nos queryKey

export const sessionKeys = {
  all:   ['sessions'] as const,
  range: (start: string, end: string) => ['sessions', start, end] as const,
  detail: (id: string) => ['sessions', id] as const,
}

export const macrocycleKeys = {
  active: ['macrocycle', 'active'] as const,
  phases: (id: string) => ['macrocycle', id, 'phases'] as const,
}

## Utilitários — @paceplan/utils

# Importar sempre de @paceplan/utils — nunca recriar em apps/web

import {
  getTypeColor,      // (type: SessionType) => string  — ex: "#22c55e"
  getTypeLabel,      // (type: SessionType) => string  — ex: "Easy Run"
  isRunningSession,  // (type: SessionType) => boolean
  formatPace,        // (pace: string) => string        — "5:30" → "5:30/km"
  formatDistance,    // (km: number) => string          — 10.5 → "10.5 km"
  formatDate,        // (iso: string) => string         — "seg., 7 de abr."
  isToday,           // (iso: string) => boolean
  getWeekStart,      // (iso: string) => string         — retorna segunda-feira
  addDays,           // (iso: string, n: number) => string
} from '@paceplan/utils'

## PaceInput

# Input validado para pace no formato MM:SS.
# Borda vermelho quando formato inválido.

export function PaceInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const isValid = !value || /^\d{1,2}:\d{2}$/.test(value)

  return (
     onChange(e.target.value)}
      className={cn(
        'input-glass',
        !isValid && 'border-[--color-danger]/40 focus:border-[--color-danger]/60'
      )}
    />
  )
}

## SessionTypeSelect

# Select agrupado por categoria: Corrida, Força, Complementar.
# Usar Select do Shadcn com grupos.

const SESSION_GROUPS = [
  {
    label: 'Corrida',
    types: [
      SessionType.EASY_RUN,
      SessionType.QUALITY_RUN,
      SessionType.LONG_RUN,
      SessionType.PACE_RUN,
      SessionType.RECOVERY_RUN,
      SessionType.RACE,
    ],
  },
  {
    label: 'Força',
    types: [SessionType.STRENGTH_LOWER, SessionType.STRENGTH_UPPER],
  },
  {
    label: 'Complementar',
    types: [SessionType.MOBILITY, SessionType.REST],
  },
]

export function SessionTypeSelect({
  value,
  onChange,
}: {
  value: SessionType
  onChange: (v: SessionType) => void
}) {
  return (
    
  )
}

## FeelingScale

# Escala de sensação 1-5 usada no log de conclusão.

const FEELING_LABELS: Record = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Ok',
  4: 'Bom',
  5: 'Ótimo',
}

export function FeelingScale({
  value,
  onChange,
}: {
  value: FeelingScale | null
  onChange: (v: FeelingScale) => void
}) {
  return (
    

      {([1, 2, 3, 4, 5] as FeelingScale[]).map(f => (
         onChange(f)}
          className={cn(
            'flex-1 h-11 rounded-xl text-[11px] font-medium transition-colors duration-150',
            value === f
              ? 'bg-[--accent] border border-[--primary]/50 text-[--accent-foreground] font-bold'
              : 'bg-[--surface] border border-[--border] text-[--text-muted] hover:text-[--text-secondary]'
          )}
        >
          {FEELING_LABELS[f]}
        
      ))}
    

  )
}

## Estados de loading e erro

# Padrão para exibir loading e erro em páginas com TanStack Query.

if (isPending) return (
  

    
  

)

if (error) return (
  

    
    

{error.message}


     refetch()}>
      Tentar novamente
    
  

)

# Ver exemplos visuais completos em references/components.md
