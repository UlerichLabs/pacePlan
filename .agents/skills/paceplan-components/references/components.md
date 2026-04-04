# Exemplos de componentes — PacePlan

## Card de sessão (barra lateral colorida)

```tsx
<div style={{
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 14px', marginBottom: 8,
  borderRadius: 12, border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
}}>
  <div style={{
    width: 4, borderRadius: 2, alignSelf: 'stretch',
    background: getTypeColor(session.type), flexShrink: 0,
  }} />
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
        {getTypeLabel(session.type)}
      </span>
      <span style={{ fontSize: 11, color: STATUS_COLOR[session.status] }}>
        {STATUS_LABEL[session.status]}
      </span>
    </div>
    <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
      {session.targetDistance != null && (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {formatDistance(session.targetDistance)}
        </span>
      )}
      {session.targetPace && (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {formatPace(session.targetPace)}
        </span>
      )}
    </div>
  </div>
</div>
```

## Input genérico

```tsx
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  style={{
    width: '100%', padding: '10px 12px',
    borderRadius: 8, border: '1px solid var(--color-border)',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text)', fontSize: 14,
    outline: 'none',
  }}
/>
```

## PaceInput (MM:SS com validação)

```tsx
function PaceInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isValid = !value || /^\d{1,2}:\d{2}$/.test(value);
  return (
    <input
      type="text"
      placeholder="5:30"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid ${isValid ? 'var(--color-border)' : 'var(--color-danger)'}`,
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)', fontSize: 14, outline: 'none',
      }}
    />
  );
}
```

## SessionTypeSelect

```tsx
import { SessionType, SESSION_TYPE_LABELS } from '@paceplan/types';

<select
  value={type}
  onChange={(e) => setType(e.target.value as SessionType)}
  style={{
    width: '100%', padding: '10px 12px',
    borderRadius: 8, border: '1px solid var(--color-border)',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text)', fontSize: 14,
  }}
>
  {Object.values(SessionType).map((t) => (
    <option key={t} value={t}>{SESSION_TYPE_LABELS[t]}</option>
  ))}
</select>
```

## FeelingScale (1–5)

```tsx
import { FEELING_LABELS, type FeelingScale } from '@paceplan/types';

const feelings = [1, 2, 3, 4, 5] as const;

<div style={{ display: 'flex', gap: 6 }}>
  {feelings.map((f) => (
    <button
      key={f}
      onClick={() => setFeeling(f as FeelingScale)}
      style={{
        flex: 1, height: 44, borderRadius: 8,
        background: feeling === f ? 'var(--color-primary)' : 'var(--color-surface-2)',
        border: `1px solid ${feeling === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
        color: 'var(--color-text)',
        fontSize: 11, fontWeight: feeling === f ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      {FEELING_LABELS[f as FeelingScale]}
    </button>
  ))}
</div>
```

## KPI Card (dashboard)

```tsx
interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
}

function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <div style={{
      borderRadius: 12, border: '1px solid var(--color-border)',
      background: 'var(--color-surface)', padding: 16,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--color-text-hint)', marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
```

## Badge de status

```tsx
const STATUS_COLOR: Record<string, string> = {
  planned: 'var(--color-text-hint)',
  done:    'var(--color-success)',
  skipped: 'var(--color-danger)',
};
const STATUS_LABEL: Record<string, string> = {
  planned: 'Planejado',
  done:    'Concluído',
  skipped: 'Pulado',
};

<span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLOR[session.status] }}>
  {STATUS_LABEL[session.status]}
</span>
```

## VolumeChart — barras SVG inline (sem biblioteca)

```tsx
function VolumeChart({ weeks }: { weeks: { label: string; km: number; isCurrent: boolean }[] }) {
  const max = Math.max(...weeks.map((w) => w.km), 1);
  const BAR_H = 120;

  return (
    <svg width="100%" viewBox={`0 0 ${weeks.length * 60} ${BAR_H + 32}`}>
      {weeks.map((week, i) => {
        const barH = (week.km / max) * BAR_H;
        const x = i * 60 + 8;
        return (
          <g key={week.label}>
            <rect
              x={x} y={BAR_H - barH} width={44} height={barH}
              rx={4}
              fill={week.isCurrent ? 'var(--color-primary)' : 'var(--color-surface-2)'}
            />
            <text
              x={x + 22} y={BAR_H + 16}
              textAnchor="middle" fontSize={10}
              fill="var(--color-text-hint)"
            >
              {week.label}
            </text>
            {week.km > 0 && (
              <text
                x={x + 22} y={BAR_H - barH - 4}
                textAnchor="middle" fontSize={10}
                fill="var(--color-text-muted)"
              >
                {week.km.toFixed(0)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
```
