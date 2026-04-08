---
name: paceplan-frontend
description: >
  Boas práticas de frontend para o PacePlan. Use sempre que for criar,
  editar ou refatorar componentes React, páginas, hooks ou services em
  apps/web. Cobre TypeScript estrito, Tailwind v4, Shadcn/ui, TanStack
  Query, testes com Vitest + Testing Library e nomenclatura.
compatibility: >
  Claude Code. Stack: React 18 + Vite 6 + TypeScript + React Router Dom 6
  + Tailwind CSS v4 + Shadcn/ui + TanStack Query v5 + Lucide React +
  Vitest + Testing Library.
metadata:
  author: UlerichLabs
  version: "2.0"
  project: paceplan
---

## Regras Absolutas (nunca violar)

- Zero `any` explícito ou implícito
- Zero `as unknown`
- Zero comentários no código
- Zero `console.log`
- Zero libs de UI além de Shadcn/ui (sem MUI, sem Chakra, sem Ant)
- Apenas Lucide React para ícones — nunca emoji como ícone de UI
- Sempre named export: `export function Component()` — nunca default
- `tsconfig` com `"jsx": "react-jsx"` — nunca importar React manualmente
- Zero inline styles — toda estilização via Tailwind classes ou CSS vars
- Zero classes Tailwind hardcoded com cor/espaçamento fora do design token

## Stack obrigatória

| Camada        | Lib                        | Versão |
|---------------|----------------------------|--------|
| Estilização   | Tailwind CSS               | v4     |
| Componentes   | Shadcn/ui (headless+tw)    | latest |
| Data fetching | TanStack Query             | v5     |
| Ícones        | Lucide React               | latest |
| Roteamento    | React Router Dom           | v6     |
| Testes unit   | Vitest + Testing Library   | latest |

## Tailwind — regras de uso

# Usar classes utilitárias do Tailwind para tudo
# Design tokens vivem em tailwind.config.ts (compartilhado com mobile)
# Variantes responsivas: mobile-first (sm:, md:, lg:)

✅  <div className="flex gap-2 p-4 rounded-lg bg-surface">
❌  <div style={{ display: 'flex', gap: 8, padding: 16 }}>
❌  <div className="bg-[#1a1a2e]">  ← arbitrary value proibido

# Valores dinâmicos calculados em runtime: CSS Custom Property via style
✅  <div style={{ '--progress': `${pct}%` }} className="w-[--progress]">

## Shadcn/ui — regras de uso

# Instalar só o que precisar: `pnpm dlx shadcn@latest add button`
# Componentes vivem em apps/web/src/components/ui/ — nunca editar direto
# Customizar via className prop (variantes Tailwind), nunca via CSS inline
# Se shadcn não tem o componente → criar em components/UI/ seguindo
#   o mesmo padrão: variantes com cva(), forwardRef, acessibilidade

## TanStack Query — regras de uso

# Todo fetch de dado do servidor = TanStack Query
# Zero useState + useEffect para dados remotos
# Query keys como constantes em packages/api-client/src/keys.ts

✅  const { data, isPending } = useQuery({
      queryKey: sessionKeys.week(startDate),
      queryFn: () => getSessions(startDate, endDate),
    })

❌  const [sessions, setSessions] = useState([])
    useEffect(() => { fetch(...).then(setSessions) }, [])

# Mutations: useMutation + onSuccess invalida a query afetada
# Prefetch no loader do React Router quando possível

## Limite de tamanho de arquivo

- Máximo 200 linhas por arquivo `.tsx`
- Ao atingir 150 linhas → avaliar extração imediata
- Páginas em /pages são apenas orquestração: sem lógica ou JSX pesado

## Quando extrair um componente

Extraia quando o bloco:
- Tem responsabilidade visual própria (badge, card, gráfico, banner)
- Pode receber props isoladas sem precisar do estado da página
- Tem mais de 40 linhas de JSX
- Se repete em mais de um lugar

## Estrutura de diretórios

apps/web/src/
  components/
    ui/             → Shadcn/ui instalados (nunca editar)
    UI/             → Genéricos customizados do projeto
    Dashboard/      → Exclusivos do Dashboard
    SessionDetail/  → Exclusivos de SessionDetail
    SessionForm/    → Formulários de sessão
    WeekView/       → Visão semanal
    History/        → Histórico
  pages/            → Apenas orquestração
  hooks/            → useNome.ts (lógica local de UI)
  styles/           → globals.css (só resets e CSS vars do tema)

# Lógica de negócio, hooks de dados e services vivem em packages/
# Nunca colocar fetch ou lógica de domínio dentro de apps/web/src/

## Nomenclatura

| Artefato          | Padrão                  | Exemplo              |
|-------------------|-------------------------|----------------------|
| Componentes/Páginas | PascalCase            | KPIBanner.tsx        |
| Hooks locais      | camelCase + prefixo use | useSessionForm.ts    |
| Testes            | mesmo nome + .test      | KPIBanner.test.tsx   |

## Anatomia de um componente correto

import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Session } from '@paceplan/types'

interface Props {
  label: string
  value: number
  session: Session
  className?: string
}

export function KPIBanner({ label, value, session, className }: Props) {
  return (
    <div className={cn('flex items-center gap-2 p-3 rounded-lg', className)}>
      <TrendingUp size={16} className="text-primary" />
      <span className="text-sm text-muted-foreground">
        {label}: {value}
      </span>
    </div>
  )
}

## Testes — obrigatório

# Coverage mínimo: 80% global (gate no CI — build falha abaixo disso)
# packages/utils e packages/ui-logic: 80% mínimo (lógica pura)
# O que testar por camada:

packages/utils      → lógica pura: formatPace, calcZone, etc.
packages/ui-logic   → hooks: renderizar, disparar eventos, checar estado
apps/web components → componentes críticos: SessionCard, KPIBanner, DayCard

# Exemplo de teste de hook
import { renderHook, act } from '@testing-library/react'
import { useSessionForm } from '@paceplan/ui-logic'

it('marks session as done after log submit', async () => {
  const { result } = renderHook(() => useSessionForm('session-id'))
  await act(() => result.current.submit(mockLog))
  expect(result.current.status).toBe('done')
})

# Exemplo de teste de componente
import { render, screen } from '@testing-library/react'
import { SessionCard } from './SessionCard'

it('shows pace target for running sessions', () => {
  render(<SessionCard session={mockLongRun} />)
  expect(screen.getByText('5:30 /km')).toBeInTheDocument()
})

## Anti-padrões proibidos

| Anti-padrão                   | Alternativa                      |
|-------------------------------|----------------------------------|
| Arquivo +200 linhas           | Extrair sub-componentes          |
| Props drilling +3 níveis      | Componente composto              |
| useState + useEffect p/ fetch | TanStack Query                   |
| Fetch direto em componente    | Hook em packages/ui-logic        |
| any em props                  | Interface tipada                 |
| Comentários                   | Código autoexplicativo           |
| console.log                   | Remover antes do commit          |
| Inline style (exceto --var)   | Tailwind classes                 |
| Cor/espaçamento arbitrary     | Design token do tailwind.config  |
| Default export                | Named export                     |
| Emoji como ícone              | Lucide React                     |
