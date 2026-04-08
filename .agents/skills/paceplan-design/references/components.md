# Referência de Componentes — PacePlan

Exemplos canônicos de implementação. Todos usam Tailwind v4 + Shadcn/ui.
Atualizar este arquivo sempre que um padrão visual mudar.

Regras que se aplicam a todos os componentes:
- Classes glass (.glass, .glass-strong, .glass-subtle) do globals.css
- Cores de SessionType via SESSION_COLORS de @paceplan/types
- Ícones via SESSION_ICONS de @paceplan/types
- Temas via CSS vars — nunca hardcodar hex
- Zero inline styles, exceto valores dinâmicos calculados em runtime

## AppShell

# Container raiz do app. Aplica o background com blobs via .app-bg.
# Sidebar visível só no desktop, BottomNav só no mobile — via CSS (globals.css).

export function AppShell({ children }: { children: ReactNode }) {
  return (
    

      
      

        {children}
      

      
    

  )
}

## Sidebar (desktop)

export function Sidebar() {
  return (
    

      
        PacePlan
      
      {NAV_ITEMS.map(item => (
        
            cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5',
              'text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-[--accent] text-[--accent-foreground]'
                : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--surface-hover]'
            )
          }
        >
          
          {item.label}
        
      ))}
    

  )
}

## BottomNav (mobile)

export function BottomNav() {
  return (
    

      {NAV_ITEMS.map(item => (
        
            cn(
              'flex flex-1 flex-col items-center gap-1',
              'text-[10px] font-semibold tracking-widest uppercase transition-colors duration-150',
              isActive
                ? 'text-[--accent-foreground]'
                : 'text-[--text-hint] hover:text-[--text-secondary]'
            )
          }
        >
          
          {item.label}
        
      ))}
    

  )
}

## DayCard

# Card do dia na WeekPage. Long Run recebe destaque visual com borda colorida.
# Accent bar lateral: 3px, cor do SessionType.

export function DayCard({ date, sessions, onAddSession, onSessionClick }: DayCardProps) {
  const d = new Date(date + 'T00:00:00')
  const today = isToday(date)
  const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

  return (
    

      {/* Header do dia */}
      
 0 && 'border-b border-[--border-subtle]'
      )}>
        

          
            {d.getDate()}
          
          
            {today ? 'hoje' : DAY_NAMES[d.getDay()]}
          
        

        
          
        
      


      {/* Sessões */}
      {sessions.map(session => (
         onSessionClick(session.id)}
        />
      ))}
    

  )
}

## SessionRow

# Linha de sessão dentro do DayCard.
# Long Run: borda superior extra com --color-long para destaque.

export function SessionRow({ session, onClick }: SessionRowProps) {
  const Icon = SESSION_ICONS[session.type]
  const color = SESSION_COLORS[session.type]
  const isLongRun = session.type === SessionType.LONG_RUN

  return (
    
      {/* Accent bar lateral */}
      


      {/* Ícone */}
      

        
      


      {/* Info */}
      

        


          {getTypeLabel(session.type)}
        


        

          {session.targetDistance != null && (
            {formatDistance(session.targetDistance)}
          )}
          {session.targetDistance != null && session.targetPace && (
            
          )}
          {session.targetPace && (
            {formatPace(session.targetPace)}
          )}
          {session.environment && (
            
          )}
        

      


      
    

  )
}

## StatusBadge

# Usa Badge do Shadcn com variantes customizadas via cva.

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

const STATUS_LABELS = { planned: 'Planejado', done: 'Concluído', skipped: 'Pulado' }

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    
      {STATUS_LABELS[status]}
    
  )
}

## EnvironmentBadge

const ENV_CONFIG = {
  TREADMILL: { label: 'Esteira', Icon: Waves },
  OUTDOOR:   { label: 'Rua',    Icon: MapPin },
}

export function EnvironmentBadge({ environment }: { environment: Environment }) {
  const { label, Icon } = ENV_CONFIG[environment]
  return (
    
      
      {label}
    
  )
}

## KpiCard

interface KpiCardProps {
  label: string
  value: string
  color: string
  icon: LucideIcon
}

export function KpiCard({ label, value, color, icon: Icon }: KpiCardProps) {
  return (
    

      
      


        {value}
      


      


        {label}
      


    

  )
}

## VolumeChart (SVG puro)

# SVG sem biblioteca. Cores via CSS vars — funciona em ambos os temas.

export function VolumeChart({
  data,
}: {
  data: { label: string; km: number; isCurrent: boolean }[]
}) {
  const max = Math.max(...data.map(d => d.km), 1)
  const W = 280, H = 80, BAR_W = W / data.length - 6

  return (
    
{week.label}

  )
}

## Button — variantes customizadas

# Não recriar Button — customizar as variantes do Shadcn em components/ui/button.tsx.
# Adicionar as variantes abaixo às existentes.

// Em components/ui/button.tsx — adicionar às variantes do cva:
variants: {
  variant: {
    // variantes padrão do Shadcn mantidas...
    glass: 'glass text-[--text-primary] hover:bg-[--surface-hover]',
    primary: [
      'bg-gradient-to-br from-[--primary] to-[#8b5cf6]',
      'text-white font-semibold',
      'shadow-[0_4px_20px_rgba(99,102,241,.35)]',
      'hover:opacity-90 transition-opacity',
    ].join(' '),
    danger: [
      'bg-[--color-danger]/8 text-[--color-danger-fg]',
      'border border-[--color-danger]/18',
      'hover:bg-[--color-danger]/15 transition-colors',
    ].join(' '),
  },
}

## Input glass

# Não recriar Input — customizar o className padrão do Shadcn.
# Adicionar esta classe utilitária em globals.css @layer components.

/* globals.css */
@layer components {
  .input-glass {
    background: var(--input);
    border-color: var(--border);
    color: var(--text-primary);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: border-color 150ms;
  }
  .input-glass:focus {
    border-color: color-mix(in srgb, var(--primary) 50%, transparent);
    outline: none;
    ring: none;
  }
  .input-glass::placeholder {
    color: var(--text-hint);
  }
}

// Uso no componente:
<Input className="input-glass" placeholder="5:30" />

## Section label

# Padrão para títulos de seção em formulários e cards.

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[.08em] uppercase text-[--text-hint] mb-2 mt-5">
      {children}
    </p>
  )
}
