---
name: paceplan-components
description: Padrões de componentes React do PacePlan — estrutura, props, lógica de estado, hooks e exemplos de código. Use junto com paceplan-design para visual. Invoque quando for criar componentes React, implementar lógica de UI, usar hooks useSessions ou useWeek, ou trabalhar com formulários e interações em apps/web.
license: Proprietary
metadata:
  author: UlerichLabs
  version: "1.0"
  project: paceplan
compatibility: Claude Code, Gemini CLI, Codex — qualquer agente com suporte ao padrão Agent Skills
---

## Regras absolutas de código

- ZERO `any` ou `as unknown`
- ZERO emojis — sempre Lucide icons
- ZERO bibliotecas de UI (MUI, Chakra, Radix, shadcn, etc)
- ZERO CSS modules, styled-components, Tailwind
- ZERO class components React
- ZERO `console.log`
- ZERO comentários no código
- ZERO tipos duplicados que existem em `@paceplan/types`
- Para visual e design system, consultar também a skill `paceplan-design`

---

## Estrutura de página padrão

```tsx
export function MinhaPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-muted)', display: 'flex' }}>
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
          Título
        </h1>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* conteúdo */}
      </div>
    </div>
  );
}
```

---

## Hooks disponíveis

### useSessions(startDate, endDate)
```ts
const {
  sessions,          // TrainingSession[]
  loading,           // boolean
  error,             // string | null
  createSession,     // (payload: CreateSessionPayload) => Promise<TrainingSession>
  updateSession,     // (id: string, payload: UpdateSessionPayload) => Promise<TrainingSession>
  logSession,        // (id: string, payload: LogSessionPayload) => Promise<TrainingSession>
  skipSession,       // (id: string) => Promise<void>
  reactivateSession, // (id: string) => Promise<void>
  deleteSession,     // (id: string) => Promise<void>
  refetch,           // () => Promise<void>
} = useSessions(startDate, endDate);
```

### useWeek(initialDate?)
```ts
const {
  weekStart,       // string YYYY-MM-DD (segunda-feira)
  weekEnd,         // string YYYY-MM-DD (domingo)
  days,            // string[] — 7 datas da semana
  isCurrentWeek,   // boolean
  goToPrevWeek,    // () => void
  goToNextWeek,    // () => void
  goToCurrentWeek, // () => void
} = useWeek();
```

---

## Utilitários (sessionUtils.ts)

```ts
getTypeColor(type: SessionType): string      // ex: "#22c55e"
getTypeLabel(type: SessionType): string      // ex: "Easy Run"
hasDistance(type: SessionType): boolean      // false só para REST_DAY
formatPace(pace: string): string             // "5:30" → "5:30/km"
formatDistance(km: number): string           // 10.5 → "10.5 km"
formatDate(iso: string): string              // "seg., 7 de abr."
isToday(iso: string): boolean
```

---

## PaceInput

```tsx
function PaceInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isValid = !value || /^\d{1,2}:\d{2}$/.test(value);
  return (
    <input
      type="text" placeholder="5:30" value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', padding: '11px 14px', borderRadius: 10,
        background: 'rgba(255,255,255,.06)',
        border: `1px solid ${isValid ? 'rgba(255,255,255,.10)' : 'rgba(239,68,68,.4)'}`,
        color: 'var(--text-primary)', fontSize: 14, outline: 'none',
      }}
    />
  );
}
```

## SessionTypeSelect

```tsx
<select value={type} onChange={(e) => setType(e.target.value as SessionType)}
  style={{
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.10)',
    color: 'var(--text-primary)', fontSize: 14,
  }}>
  {Object.values(SessionType).map((t) => (
    <option key={t} value={t} style={{ background: '#1a1d27' }}>
      {SESSION_TYPE_LABELS[t]}
    </option>
  ))}
</select>
```

## FeelingScale

```tsx
const feelings = [1, 2, 3, 4, 5] as const;
<div style={{ display: 'flex', gap: 6 }}>
  {feelings.map((f) => (
    <button key={f} onClick={() => setFeeling(f as FeelingScale)} style={{
      flex: 1, height: 44, borderRadius: 10,
      background: feeling === f ? 'rgba(99,102,241,.25)' : 'rgba(255,255,255,.06)',
      border: `1px solid ${feeling === f ? 'rgba(99,102,241,.5)' : 'rgba(255,255,255,.08)'}`,
      color: feeling === f ? 'var(--color-primary-s)' : 'var(--text-muted)',
      fontSize: 11, fontWeight: feeling === f ? 700 : 500, cursor: 'pointer',
    }}>
      {FEELING_LABELS[f as FeelingScale]}
    </button>
  ))}
</div>
```

Ver exemplos completos de componentes visuais em skill `paceplan-design` → references/components.md.
