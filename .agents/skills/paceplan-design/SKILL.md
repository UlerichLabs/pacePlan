---
name: paceplan-design
description: >
  Sistema de design e padrões visuais do PacePlan. Use sempre que for
  criar ou editar qualquer componente visual, página, layout, ícone, cor
  ou estilo. Cobre tokens de cor (dark frosted glass + light creme),
  temas via Shadcn/ui + Tailwind v4, layout responsivo, ícones e regras
  visuais absolutas.
compatibility: >
  Claude Code, Gemini CLI, Codex. Stack: React 18 + Tailwind CSS v4 +
  Shadcn/ui + Lucide React.
metadata:
  author: UlerichLabs
  version: "2.0"
  project: paceplan
---

## Filosofia de design

Frosted glass sobre fundo escuro (dark) ou creme (light).
Inspiração: macOS, iOS nativo.

Frosted ≠ liquid glass.
Frosted = opaco com blur. Não transparente, não distorce o fundo.

Sem emojis. Jamais. Todos os ícones são Lucide React.
Inter é a fonte. Importar via @fontsource/inter.

## Arquitetura de temas

# Os tokens do Shadcn/ui são sobrescritos com a identidade do PacePlan.
# Um único lugar de verdade: globals.css com @theme (Tailwind v4).
# Tailwind lê as vars. Shadcn usa as vars. Tudo propaga.
# Troca de tema via data-theme="dark" | "light" no elemento raiz.

## globals.css — definição completa de tokens

@import "tailwindcss";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;

  /* Raio padrão (usado pelo Shadcn via --radius) */
  --radius: 0.75rem;

  /* Mapeamento das cores do tema para Tailwind utilities */
  --color-background:    var(--background);
  --color-card:          var(--card);
  --color-primary:       var(--primary);
  --color-primary-fg:    var(--primary-foreground);
  --color-muted:         var(--muted);
  --color-muted-fg:      var(--muted-foreground);
  --color-border:        var(--border);
  --color-surface:       var(--surface);
  --color-surface-hover: var(--surface-hover);
}

/* ─── DARK (frosted glass) ───────────────────────────────────── */
:root,
:root[data-theme="dark"] {
  color-scheme: dark;

  /* Base */
  --background:          #0f1117;
  --foreground:          rgba(255, 255, 255, 0.92);

  /* Glass surfaces (Shadcn: card, popover, sheet) */
  --card:                rgba(255, 255, 255, 0.065);
  --card-foreground:     rgba(255, 255, 255, 0.92);
  --popover:             rgba(255, 255, 255, 0.10);
  --popover-foreground:  rgba(255, 255, 255, 0.92);

  /* Superfícies internas de componentes */
  --surface:             rgba(255, 255, 255, 0.065);
  --surface-hover:       rgba(255, 255, 255, 0.10);

  /* Primária — indigo */
  --primary:             #6366f1;
  --primary-foreground:  rgba(255, 255, 255, 0.95);
  --primary-hover:       #818cf8;
  --primary-subtle:      #a5b4fc;

  /* Texto */
  --text-primary:        rgba(255, 255, 255, 0.92);
  --text-secondary:      rgba(255, 255, 255, 0.55);
  --text-muted:          rgba(255, 255, 255, 0.35);
  --text-hint:           rgba(255, 255, 255, 0.22);

  /* Bordas glass */
  --border:              rgba(255, 255, 255, 0.10);
  --border-strong:       rgba(255, 255, 255, 0.16);
  --border-subtle:       rgba(255, 255, 255, 0.06);
  --input:               rgba(255, 255, 255, 0.08);
  --ring:                #6366f1;

  /* Semânticas */
  --color-success:       #22c55e;
  --color-success-fg:    #4ade80;
  --color-danger:        #ef4444;
  --color-danger-fg:     #f87171;
  --color-warning:       #eab308;
  --color-warning-fg:    #fbbf24;

  /* Blobs de cor (aplicados no background do app shell) */
  --blob-1: radial-gradient(300px at 10% 20%,
              rgba(99,102,241,.18) 0%, transparent 70%);
  --blob-2: radial-gradient(250px at 90% 80%,
              rgba(139,92,246,.18) 0%, transparent 70%);
  --blob-3: radial-gradient(200px at 75% 40%,
              rgba(34,197,94,.10) 0%, transparent 70%);

  /* Glass blur levels */
  --blur-card:   blur(24px);
  --blur-nav:    blur(40px);
  --blur-badge:  blur(16px);

  /* Muted (Shadcn: muted, secondary button) */
  --muted:           rgba(255, 255, 255, 0.06);
  --muted-foreground: rgba(255, 255, 255, 0.45);
  --secondary:        rgba(255, 255, 255, 0.08);
  --secondary-foreground: rgba(255, 255, 255, 0.75);
  --accent:           rgba(99, 102, 241, 0.15);
  --accent-foreground: #a5b4fc;
  --destructive:      #ef4444;
  --destructive-foreground: rgba(255, 255, 255, 0.95);
}

/* ─── LIGHT (frosted glass creme) ───────────────────────────── */
:root[data-theme="light"] {
  color-scheme: light;

  /* Base creme */
  --background:          #faf8f4;
  --foreground:          rgba(15, 17, 23, 0.88);

  /* Glass surfaces — vidro fosco sobre creme */
  --card:                rgba(255, 255, 255, 0.72);
  --card-foreground:     rgba(15, 17, 23, 0.88);
  --popover:             rgba(255, 255, 255, 0.88);
  --popover-foreground:  rgba(15, 17, 23, 0.88);

  --surface:             rgba(255, 255, 255, 0.72);
  --surface-hover:       rgba(255, 255, 255, 0.90);

  /* Primária — indigo (mesma no light) */
  --primary:             #6366f1;
  --primary-foreground:  rgba(255, 255, 255, 0.95);
  --primary-hover:       #4f46e5;
  --primary-subtle:      #6366f1;

  /* Texto */
  --text-primary:        rgba(15, 17, 23, 0.88);
  --text-secondary:      rgba(15, 17, 23, 0.55);
  --text-muted:          rgba(15, 17, 23, 0.38);
  --text-hint:           rgba(15, 17, 23, 0.22);

  /* Bordas glass creme */
  --border:              rgba(15, 17, 23, 0.10);
  --border-strong:       rgba(15, 17, 23, 0.18);
  --border-subtle:       rgba(15, 17, 23, 0.06);
  --input:               rgba(15, 17, 23, 0.08);
  --ring:                #6366f1;

  /* Semânticas (mesmas — funcionam nos dois temas) */
  --color-success:       #16a34a;
  --color-success-fg:    #15803d;
  --color-danger:        #dc2626;
  --color-danger-fg:     #b91c1c;
  --color-warning:       #ca8a04;
  --color-warning-fg:    #a16207;

  /* Blobs creme — mais sutis */
  --blob-1: radial-gradient(300px at 10% 20%,
              rgba(99,102,241,.10) 0%, transparent 70%);
  --blob-2: radial-gradient(250px at 90% 80%,
              rgba(139,92,246,.10) 0%, transparent 70%);
  --blob-3: radial-gradient(200px at 75% 40%,
              rgba(34,197,94,.06) 0%, transparent 70%);

  --blur-card:   blur(20px);
  --blur-nav:    blur(32px);
  --blur-badge:  blur(12px);

  --muted:            rgba(15, 17, 23, 0.05);
  --muted-foreground: rgba(15, 17, 23, 0.48);
  --secondary:        rgba(15, 17, 23, 0.06);
  --secondary-foreground: rgba(15, 17, 23, 0.75);
  --accent:           rgba(99, 102, 241, 0.10);
  --accent-foreground: #6366f1;
  --destructive:      #dc2626;
  --destructive-foreground: rgba(255, 255, 255, 0.95);
}

## Cores por SessionType

# Definir como constante tipada em packages/types/src/session-colors.ts
# Usar nos componentes via className Tailwind ou style={{ color: SESSION_COLORS[type] }}
# Esses valores são fixos — não mudam entre temas

export const SESSION_COLORS: Record = {
  EASY_RUN:       '#22c55e',
  QUALITY_RUN:    '#f97316',
  LONG_RUN:       '#8b5cf6',
  PACE_RUN:       '#6366f1',
  RECOVERY_RUN:   '#06b6d4',
  RACE:           '#ec4899',
  STRENGTH_LOWER: '#f59e0b',
  STRENGTH_UPPER: '#f59e0b',
  MOBILITY:       '#14b8a6',
  REST:           '#6b7280',
}

## Ícones por SessionType (Lucide)

import {
  Activity,     // EASY_RUN
  Flame,        // QUALITY_RUN
  TrendingUp,   // LONG_RUN
  Target,       // PACE_RUN
  Wind,         // RECOVERY_RUN
  Trophy,       // RACE
  Dumbbell,     // STRENGTH_LOWER + STRENGTH_UPPER
  Waves,        // MOBILITY
  Moon,         // REST
} from 'lucide-react'

export const SESSION_ICONS: Record = {
  EASY_RUN:       Activity,
  QUALITY_RUN:    Flame,
  LONG_RUN:       TrendingUp,
  PACE_RUN:       Target,
  RECOVERY_RUN:   Wind,
  RACE:           Trophy,
  STRENGTH_LOWER: Dumbbell,
  STRENGTH_UPPER: Dumbbell,
  MOBILITY:       Waves,
  REST:           Moon,
}

# Tamanho padrão nos cards: size={16}
# Ícones decorativos de KPI: size={14}
# Ícones de navegação: size={20}

## Glass — classes utilitárias

# Adicionar em globals.css como @layer components
# Usar className="glass" nos componentes — nunca reescrever os valores inline

@layer components {
  .glass {
    background: var(--card);
    border: 1px solid var(--border);
    backdrop-filter: var(--blur-card);
    -webkit-backdrop-filter: var(--blur-card);
  }

  .glass-strong {
    background: var(--popover);
    border: 1px solid var(--border-strong);
    backdrop-filter: var(--blur-nav);
    -webkit-backdrop-filter: var(--blur-nav);
  }

  .glass-subtle {
    background: var(--muted);
    border: 1px solid var(--border-subtle);
    backdrop-filter: var(--blur-badge);
    -webkit-backdrop-filter: var(--blur-badge);
  }

  .app-bg {
    background-color: var(--background);
    background-image: var(--blob-1), var(--blob-2), var(--blob-3);
  }
}

## Layout responsivo

# Mobile  (< 768px) → Bottom navigation bar fixa na base
# Desktop (≥ 768px) → Sidebar esquerda fixa 220px

/* globals.css */
@layer components {
  .app-shell {
    display: flex;
    height: 100dvh;
    overflow: hidden;
  }

  .sidebar {
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 24px 12px;
    background: rgba(255, 255, 255, 0.04);
    border-right: 1px solid var(--border);
    backdrop-filter: var(--blur-nav);
    -webkit-backdrop-filter: var(--blur-nav);
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .bottom-nav { display: none; }

  @media (max-width: 767px) {
    .app-shell       { flex-direction: column; }
    .sidebar         { display: none; }
    .main-content    { padding: 16px; }
    .bottom-nav {
      display: flex;
      border-top: 1px solid var(--border);
      padding: 10px 0 max(6px, env(safe-area-inset-bottom));
      background: color-mix(in srgb, var(--background) 90%, transparent);
      backdrop-filter: var(--blur-nav);
      -webkit-backdrop-filter: var(--blur-nav);
      flex-shrink: 0;
    }
  }
}

## Troca de tema

# Aplicar data-theme no elemento raiz — nunca via classe CSS
# Persistir preferência em localStorage com chave "paceplan-theme"
# Respeitar prefers-color-scheme como valor inicial

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('paceplan-theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('paceplan-theme', theme)
  }, [theme])

  return (
    
      {children}
    
  )
}

## Nav items

import { CalendarDays, Activity, ScrollText } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/week',      label: 'Semana',    Icon: CalendarDays },
  { to: '/dashboard', label: 'Stats',     Icon: Activity },
  { to: '/history',   label: 'Histórico', Icon: ScrollText },
]

## Regras visuais absolutas

- ZERO emojis — sempre Lucide React
- ZERO cores hardcoded no JS — sempre SESSION_COLORS ou vars CSS
- ZERO light mode implementado com classes (usar data-theme)
- ZERO border-radius acima de 16px em cards (20px só no container raiz)
- ZERO box-shadow colorido pesado — máximo 0 0 12px rgba(cor, .3)
- backdrop-filter SEMPRE acompanhado de -webkit-backdrop-filter
- Accent bar lateral nos cards: 3px largura, border-radius: 3px 0 0 3px
- Long Run SEMPRE com destaque visual — borda cor --color-long
- Todas as cores de SessionType vivem em SESSION_COLORS (packages/types)
- Troca de tema SEMPRE via data-theme no documentElement
