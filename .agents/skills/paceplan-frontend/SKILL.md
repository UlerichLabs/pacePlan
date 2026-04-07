---
name: paceplan-frontend
description: Boas práticas de frontend para o projeto PacePlan. Use sempre que for criar, editar ou refatorar componentes React, páginas, hooks ou services do frontend em apps/web. Cobre regras de TypeScript, tamanho de arquivos, extração de componentes, estilização com CSS Custom Properties e nomenclatura.
compatibility: Designed for Claude Code. Stack: React 18 + Vite 6 + TypeScript + React Router Dom 6 + Lucide React + Vanilla CSS.
metadata:
  author: paceplan
  version: "1.0"
---

## Regras Absolutas

- Zero `any` explícito ou implícito
- Zero `as unknown`
- Zero comentários no código
- Zero `console.log`
- Zero libs de UI externas (sem Tailwind, sem MUI, sem Chakra)
- Apenas Lucide React para ícones
- Sempre named export: `export function Component()` — nunca default export
- `tsconfig` com `"jsx": "react-jsx"` — nunca importar React manualmente

## Limite de Tamanho

- **Máximo 200 linhas por arquivo `.tsx`**
- Ao atingir 150 linhas, avaliar extração imediata
- Páginas em `/pages` são apenas orquestração — sem lógica ou JSX pesado inline

## Quando Extrair um Componente

Extraia quando o bloco:
- Tem responsabilidade visual própria (badge, card, gráfico, banner)
- Pode receber props isoladas sem precisar de todo o estado da página
- Tem mais de 40 linhas de JSX
- Se repete em mais de um lugar

## Onde Colocar Componentes

```
apps/web/src/
  components/
    UI/             → Genéricos reutilizáveis
    Dashboard/      → Exclusivos do Dashboard
    SessionDetail/  → Exclusivos de SessionDetail
    SessionForm/    → Formulários
    WeekView/       → Visão semanal
    History/        → Histórico
  pages/            → Apenas orquestração
  hooks/            → useNome.ts
  services/         → Chamadas à API
  styles/           → global.css e variáveis
```

## Nomenclatura

| Artefato | Padrão | Exemplo |
|---|---|---|
| Componentes / Páginas | PascalCase | `KPIBanner.tsx` |
| Hooks | camelCase com prefixo `use` | `useSessionData.ts` |
| Services / utilitários | camelCase | `sessionService.ts` |

## Anatomia de um Componente Correto

```tsx
import { TrendingUp } from 'lucide-react'
import { Sessao } from '@paceplan/types'

interface Props {
  label: string
  value: number
  sessao: Sessao
}

export function KPIBanner({ label, value, sessao }: Props) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <TrendingUp size={16} color="var(--color-primary)" />
      <span style={{ color: 'var(--color-text)' }}>{label}: {value}</span>
    </div>
  )
}
```

## Estilização

- CSS Custom Properties para valores fixos (cores, espaçamentos)
- Inline styles para valores dinâmicos (calculados em runtime)
- Nunca hardcodar hex/rgb — sempre variável CSS

```tsx
// ✅ Correto
<div style={{ color: 'var(--color-text)', padding: 'var(--space-3)' }}>

// ❌ Errado
<div style={{ color: '#333', padding: '12px' }}>
```

## Anti-padrões Proibidos

| Anti-padrão | Alternativa |
|---|---|
| Arquivo +200 linhas | Extrair sub-componentes |
| Props drilling +3 níveis | Componente composto |
| Lógica inline na página | Hook ou service |
| `any` em props | Interface tipada |
| Comentários | Código autoexplicativo |
| `console.log` | Remover antes do commit |
| Cor/espaçamento hardcoded | CSS Custom Property |
| Default export | Named export |