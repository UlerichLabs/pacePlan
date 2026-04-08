# Referência de Componentes — paceplan-components

Exemplos canônicos de uso dos padrões documentados na skill.
Todos usam Tailwind v4 + Shadcn/ui + TanStack Query.
Para padrões visuais (glass, cores, ícones) ver paceplan-design.

## SessionCard (barra lateral colorida)

# Versão compacta usada em listas fora da WeekPage.
# Accent bar: 3px, cor do SessionType via SESSION_COLORS.

export function SessionCard({ session }: { session: TrainingSession }) {
  const color = SESSION_COLORS[session.type]

  return (
    

      

      

        

          
            {getTypeLabel(session.type)}
          
          
        

        

          {session.targetDistance != null && (
            
              {formatDistance(session.targetDistance)}
            
          )}
          {session.targetPace && (
            
              {formatPace(session.targetPace)}
            
          )}
        

      

    

  )
}

## PaceInput (MM:SS com validação)

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

## SessionTypeSelect (agrupado por categoria)

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

## FeelingScale (1–5)

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
            'flex-1 h-11 rounded-xl text-[11px] transition-colors duration-150',
            value === f
              ? 'bg-[--accent] border border-[--primary]/50 text-[--accent-foreground] font-bold'
              : 'bg-[--surface] border border-[--border] text-[--text-muted] font-medium hover:text-[--text-secondary]'
          )}
        >
          {FEELING_LABELS[f]}
        
      ))}
    

  )
}

## KpiCard (dashboard)

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon?: LucideIcon
  color?: string
}

export function KpiCard({ label, value, sub, icon: Icon, color }: KpiCardProps) {
  return (
    

      {Icon && (
        
      )}
      


        {label}
      


      


        {value}
      


      {sub && (
        

{sub}


      )}
    

  )
}

## StatusBadge

const statusVariants = cva(
  'text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border whitespace-nowrap',
  {
    variants: {
      status: {
        planned: 'bg-[--muted] text-[--text-muted] border-[--border]',
        done:    'bg-[--color-success]/15 text-[--color-success-fg] border-[--color-success]/20',
        skipped: 'bg-[--color-danger]/10 text-[--color-danger-fg] border-[--color-danger]/15',
      },
    },
  }
)

const STATUS_LABELS = {
  planned: 'Planejado',
  done:    'Concluído',
  skipped: 'Pulado',
}

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    
      {STATUS_LABELS[status]}
    
  )
}

## VolumeChart (SVG puro, sem biblioteca)

# Cores via CSS vars — funciona em dark e light sem alteração.

export function VolumeChart({
  weeks,
}: {
  weeks: { label: string; km: number; isCurrent: boolean }[]
}) {
  const max = Math.max(...weeks.map(w => w.km), 1)
  const BAR_H = 120
  const BAR_W = 44
  const COL_W = 60

  return (
    
{week.km.toFixed(0)}
{week.label}

  )
}


