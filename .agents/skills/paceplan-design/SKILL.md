---
name: paceplan-design
description: Sistema de design e padrões visuais do PacePlan — frosted glass dark, Lucide icons, Inter font, layout responsivo com sidebar esquerda no desktop e bottom bar no mobile. Use sempre que for criar ou editar qualquer componente visual, página, layout, ícone, cor ou estilo no apps/web. Invoque quando o usuário mencionar "design", "visual", "layout", "responsivo", "glass", "ícone", "componente", "página", ou quando for implementar qualquer UI do projeto.
license: Proprietary
metadata:
  author: UlerichLabs
  version: "1.0"
  project: paceplan
compatibility: Claude Code, Gemini CLI, Codex — qualquer agente com suporte ao padrão Agent Skills
---

## Filosofia de design

**Frosted glass dark** — vidro fosco sobre fundo escuro com blobs de cor. Inspiração: macOS, iOS nativo.
Diferença crítica: frosted ≠ liquid glass. Frosted é **opaco com blur**, não transparente que distorce o fundo.

**Sem emojis. Jamais.** Todos os ícones são Lucide React (`lucide-react`). SVG inline no CSS, `lucide-react` nos componentes React.

**Inter** é a fonte. Importar via `@fontsource/inter` ou Google Fonts no `index.html`.

---

## Tokens de design

### Fundo e blobs
```css
--bg-base: #0f1117;           /* fundo principal — hardcoded, não inverte */

/* Blobs de cor atrás do glass — criam a profundidade que o frosted foca */
/* Blob 1: indigo 300px blur(80px) opacity .18 — top-left */
/* Blob 2: roxo 250px blur(80px) opacity .18 — bottom-right */
/* Blob 3: verde 200px blur(80px) opacity .10 — mid-right (opcional) */
```

### Glass surfaces
```css
/* Nível 1 — cards padrão */
--glass-bg: rgba(255, 255, 255, 0.065);
--glass-border: rgba(255, 255, 255, 0.10);
--glass-blur: blur(24px);

/* Nível 2 — nav, modals, elementos sobre outros glass */
--glass-strong-bg: rgba(255, 255, 255, 0.10);
--glass-strong-border: rgba(255, 255, 255, 0.16);
--glass-strong-blur: blur(40px);

/* Nível 3 — tooltips, badges flutuantes */
--glass-subtle-bg: rgba(255, 255, 255, 0.05);
--glass-subtle-border: rgba(255, 255, 255, 0.08);
--glass-subtle-blur: blur(16px);
```

### Texto
```css
--text-primary: rgba(255, 255, 255, 0.92);
--text-secondary: rgba(255, 255, 255, 0.55);
--text-muted: rgba(255, 255, 255, 0.35);
--text-hint: rgba(255, 255, 255, 0.22);
```

### Cores por SessionType
```css
--color-easy:     #22c55e;   /* EASY_RUN */
--color-tempo:    #f97316;   /* TEMPO_RUN */
--color-long:     #8b5cf6;   /* LONG_RUN */
--color-interval: #ef4444;   /* INTERVAL */
--color-hills:    #eab308;   /* HILL_REPS */
--color-race:     #ec4899;   /* RACE */
--color-rest:     #6b7280;   /* REST_DAY */
--color-cross:    #06b6d4;   /* CROSS_TRAINING */
```

### Brand / primária
```css
--color-primary:    #6366f1;
--color-primary-h:  #818cf8;   /* hover / active / highlights */
--color-primary-s:  #a5b4fc;   /* texto sobre fundo escuro */
```

### Semânticas
```css
--color-success: #22c55e;   → texto: #4ade80
--color-danger:  #ef4444;   → texto: #f87171
--color-warning: #eab308;   → texto: #fbbf24
```

---

## Ícones por SessionType (Lucide)

```tsx
import {
  Activity,    // EASY_RUN
  Timer,       // TEMPO_RUN
  TrendingUp,  // LONG_RUN
  Zap,         // INTERVAL
  Mountain,    // HILL_REPS
  Trophy,      // RACE
  Moon,        // REST_DAY
  Bike,        // CROSS_TRAINING
} from 'lucide-react';

const SESSION_ICONS: Record<SessionType, React.FC<{ size?: number; color?: string }>> = {
  EASY_RUN:       Activity,
  TEMPO_RUN:      Timer,
  LONG_RUN:       TrendingUp,
  INTERVAL:       Zap,
  HILL_REPS:      Mountain,
  RACE:           Trophy,
  REST_DAY:       Moon,
  CROSS_TRAINING: Bike,
};
```

Tamanho padrão nos cards: `size={16}`. Nos ícones decorativos de KPI: `size={14}`.

---

## Layout responsivo — REGRA CRÍTICA

```
Mobile  (< 768px) → Bottom navigation bar (fixa na base)
Desktop (≥ 768px) → Sidebar esquerda fixa (largura 220px)
```

### Implementação com CSS

```css
.app-shell {
  display: flex;
  height: 100dvh;
  background: #0f1117;
  overflow: hidden;
}

/* Sidebar — desktop */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Bottom bar — mobile */
.bottom-nav {
  display: none;
}

@media (max-width: 767px) {
  .app-shell {
    flex-direction: column;
  }
  .sidebar {
    display: none;
  }
  .bottom-nav {
    display: flex;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 10px 0 max(6px, env(safe-area-inset-bottom));
    background: rgba(15, 17, 23, 0.9);
    backdrop-filter: blur(40px);
    flex-shrink: 0;
  }
  .main-content {
    padding: 16px;
    padding-bottom: 0;
  }
}
```

### Estrutura React

```tsx
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />                {/* visível só desktop */}
      <main className="main-content">{children}</main>
      <BottomNav />              {/* visível só mobile */}
    </div>
  );
}
```

### Sidebar (desktop)

```tsx
function Sidebar() {
  return (
    <nav className="sidebar">
      <div style={{ marginBottom: 32, paddingLeft: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#a5b4fc', letterSpacing: '-.01em' }}>
          PacePlan
        </span>
      </div>
      {NAV_ITEMS.map(item => (
        <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, marginBottom: 2,
          color: isActive ? '#a5b4fc' : 'rgba(255,255,255,.4)',
          background: isActive ? 'rgba(99,102,241,.12)' : 'transparent',
          fontSize: 14, fontWeight: isActive ? 600 : 500,
          transition: 'all .15s',
        })}>
          <item.Icon size={17} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

### Bottom Nav (mobile)

```tsx
function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: isActive ? '#a5b4fc' : 'rgba(255,255,255,.28)',
          transition: 'color .15s',
        })}>
          <item.Icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

### Nav items

```tsx
import { CalendarDays, Activity, ScrollText } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/week',      label: 'Semana',   Icon: CalendarDays },
  { to: '/dashboard', label: 'Stats',    Icon: Activity },
  { to: '/history',   label: 'Histórico', Icon: ScrollText },
];
```

---

## Padrão glass — mixin reutilizável

Criar em `apps/web/src/styles/glass.css`:

```css
.glass {
  background: rgba(255, 255, 255, 0.065);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

---

## Regras absolutas de visual

- ZERO emojis em qualquer lugar — sempre Lucide
- ZERO cores hardcoded no JS — sempre via CSS custom properties ou constantes tipadas
- ZERO light mode — o app é 100% dark
- ZERO border-radius acima de 16px em cards (20px só no container raiz)
- ZERO sombras com `box-shadow` colorido pesado — no máximo `box-shadow: 0 0 12px rgba(cor, .3)` no card do dia atual
- `backdrop-filter` SEMPRE acompanhado de `-webkit-backdrop-filter`
- Accent bar lateral dos cards: sempre 3px de largura, `border-radius: 3px 0 0 3px`

Ver exemplos completos de componentes em [references/components.md](references/components.md).
