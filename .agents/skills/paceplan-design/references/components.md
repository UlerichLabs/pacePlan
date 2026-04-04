# Componentes — PacePlan Design System

## global.css atualizado

Substituir o `apps/web/src/styles/global.css` existente por este:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg-base: #0f1117;
  --glass-bg: rgba(255,255,255,0.065);
  --glass-border: rgba(255,255,255,0.10);
  --glass-strong-bg: rgba(255,255,255,0.10);
  --glass-strong-border: rgba(255,255,255,0.16);
  --glass-subtle-bg: rgba(255,255,255,0.05);
  --glass-subtle-border: rgba(255,255,255,0.08);
  --text-primary: rgba(255,255,255,0.92);
  --text-secondary: rgba(255,255,255,0.55);
  --text-muted: rgba(255,255,255,0.35);
  --text-hint: rgba(255,255,255,0.22);
  --color-easy:     #22c55e;
  --color-tempo:    #f97316;
  --color-long:     #8b5cf6;
  --color-interval: #ef4444;
  --color-hills:    #eab308;
  --color-race:     #ec4899;
  --color-rest:     #6b7280;
  --color-cross:    #06b6d4;
  --color-primary:   #6366f1;
  --color-primary-h: #818cf8;
  --color-primary-s: #a5b4fc;
  --color-success: #22c55e;
  --color-danger:  #ef4444;
  --color-warning: #eab308;
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  20px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-top:    env(safe-area-inset-top, 0px);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; width: 100%; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg-base);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
}
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }
input, textarea, select { font-family: inherit; }

.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
.glass-strong {
  background: var(--glass-strong-bg);
  border: 1px solid var(--glass-strong-border);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}
```

---

## AppShell com blobs

```tsx
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden', background: '#0f1117' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: '#6366f1', filter: 'blur(90px)', opacity: .16, top: -100, left: -80 }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: '#8b5cf6', filter: 'blur(90px)', opacity: .14, bottom: 80, right: -60 }} />
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: '#22c55e', filter: 'blur(80px)', opacity: .08, top: '40%', right: '20%' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100%' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
```

---

## DayCard glass

```tsx
interface DayCardProps {
  date: string;
  sessions: TrainingSession[];
  onAddSession: () => void;
  onSessionClick: (id: string) => void;
}

export function DayCard({ date, sessions, onAddSession, onSessionClick }: DayCardProps) {
  const d = new Date(date + 'T00:00:00');
  const today = isToday(date);
  const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  return (
    <div style={{
      borderRadius: 14, marginBottom: 8, overflow: 'hidden',
      background: 'var(--glass-bg)',
      border: today ? '1px solid rgba(99,102,241,.35)' : '1px solid var(--glass-border)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: today ? '0 0 0 1px rgba(99,102,241,.2)' : 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: sessions.length > 0 ? '1px solid rgba(255,255,255,.06)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: today ? 'var(--color-primary-s)' : 'var(--text-primary)' }}>
            {d.getDate()}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: today ? 'var(--color-primary)' : 'var(--text-hint)' }}>
            {today ? 'hoje' : DAY_NAMES[d.getDay() ?? 0]}
          </span>
        </div>
        <button onClick={onAddSession} style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,.07)',
          border: '1px solid rgba(255,255,255,.10)',
          color: 'var(--text-muted)', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
      </div>

      {sessions.map((session) => {
        const Icon = SESSION_ICONS[session.type];
        const color = getTypeColor(session.type);
        return (
          <button key={session.id} onClick={() => onSessionClick(session.id)} style={{
            width: '100%', textAlign: 'left', padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent',
            borderBottom: '1px solid rgba(255,255,255,.05)',
            position: 'relative', overflow: 'hidden',
            opacity: session.status === 'skipped' ? .45 : 1,
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '3px 0 0 3px' }} />
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color={color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                {getTypeLabel(session.type)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                {session.targetDistance != null && <span>{formatDistance(session.targetDistance)}</span>}
                {session.targetDistance != null && session.targetPace && <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,.2)', flexShrink: 0 }} />}
                {session.targetPace && <span>{formatPace(session.targetPace)}</span>}
              </div>
            </div>
            <StatusBadge status={session.status} />
          </button>
        );
      })}
    </div>
  );
}
```

---

## StatusBadge

```tsx
const STATUS_CONFIG = {
  planned: { label: 'Planejado', bg: 'rgba(255,255,255,.07)',    color: 'var(--text-muted)',    border: 'rgba(255,255,255,.1)'  },
  done:    { label: 'Concluído', bg: 'rgba(34,197,94,.14)',      color: '#4ade80',              border: 'rgba(34,197,94,.2)'   },
  skipped: { label: 'Pulado',   bg: 'rgba(239,68,68,.12)',      color: '#f87171',              border: 'rgba(239,68,68,.15)'  },
};

function StatusBadge({ status }: { status: SessionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}
```

---

## KpiCard

```tsx
function KpiCard({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: React.FC<{size?: number; color?: string}> }) {
  return (
    <div style={{
      padding: '14px 12px', borderRadius: 13,
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <Icon size={14} color={color} style={{ marginBottom: 8, opacity: .7 }} />
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color, marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-hint)', fontWeight: 500, letterSpacing: '.02em' }}>
        {label}
      </div>
    </div>
  );
}
```

---

## VolumeChart — SVG puro sem biblioteca

```tsx
function VolumeChart({ data }: { data: { label: string; km: number; isCurrent: boolean }[] }) {
  const max = Math.max(...data.map(d => d.km), 1);
  const W = 280, H = 80, BAR_W = W / data.length - 6;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="xMidYMid meet">
      {data.map((week, i) => {
        const barH = Math.max((week.km / max) * H, 2);
        const x = i * (W / data.length) + 3;
        const y = H - barH;
        return (
          <g key={week.label}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={4}
              fill={week.isCurrent ? '#6366f1' : 'rgba(255,255,255,.09)'}
              opacity={week.isCurrent ? 1 : .8}
            />
            {week.isCurrent && (
              <rect x={x} y={y} width={BAR_W} height={barH} rx={4}
                fill="url(#barGrad)" opacity={.6}
              />
            )}
            <text x={x + BAR_W / 2} y={H + 14} textAnchor="middle"
              fontSize={9} fill={week.isCurrent ? '#818cf8' : 'rgba(255,255,255,.25)'} fontFamily="Inter,sans-serif">
              {week.label}
            </text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity=".8"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
```

---

## Inputs e forms glass

```tsx
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.10)',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'border-color .15s',
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'rgba(99,102,241,.5)',
};
```

## Botão primário

```tsx
<button style={{
  width: '100%', padding: '13px', borderRadius: 12,
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#fff', fontSize: 15, fontWeight: 600,
  border: 'none', cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(99,102,241,.35)',
}}>
  Salvar treino
</button>
```

## Botão destrutivo

```tsx
<button style={{
  width: '100%', padding: '12px', borderRadius: 12,
  background: 'rgba(239,68,68,.08)',
  color: '#f87171', fontSize: 14,
  border: '1px solid rgba(239,68,68,.18)', cursor: 'pointer',
}}>
  Deletar treino
</button>
```

## Section label

```tsx
<p style={{
  fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
  textTransform: 'uppercase', color: 'var(--text-hint)',
  marginBottom: 8, marginTop: 20,
}}>
  Dados do treino
</p>
```
