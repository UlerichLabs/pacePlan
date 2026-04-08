# ADR 002 — Shadcn/ui como biblioteca de componentes base

**Status:** aceito
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O PacePlan precisava de componentes base acessíveis e bem construídos:
Button, Input, Select, Dialog, Badge. A skill anterior proibia qualquer
biblioteca de UI, o que levava a reimplementações manuais com gaps
de acessibilidade (falta de :focus-visible, aria-*, keyboard nav).

Reimplementar esses componentes do zero a cada feature cria:
- Risco de regressões de acessibilidade
- Inconsistência visual entre páginas
- Tempo desperdiçado em infraestrutura, não em produto

## Decisão

Adotar Shadcn/ui como biblioteca de componentes base.

Shadcn é fundamentalmente diferente de MUI ou Chakra:
os componentes são copiados para o projeto (não instalados como
dependência opaca) e customizados via Tailwind + cva.

Estratégia de customização: opção A — sobrescrever as CSS vars do
Shadcn com os tokens do PacePlan (--background, --card, --primary etc)
mapeados para o design system frosted glass dark/light.

Componentes Shadcn instalados sob demanda via:
  pnpm dlx shadcn@latest add button input select dialog badge

## Alternativas consideradas

Radix UI primitives direto: acessibilidade correta mas sem estilos —
ainda precisaria de toda a estilização Tailwind manualmente. Shadcn
é Radix + estilos Tailwind prontos. Descartado por ser subconjunto do Shadcn.

MUI / Chakra: sistema de tema próprio que conflita com Tailwind,
bundle maior, não funciona no React Native. Descartado.

Reimplementação manual: gaps de acessibilidade, tempo desperdiçado.
Descartado.

## Consequências

+ Componentes acessíveis por padrão (Radix primitives)
+ Código dos componentes visível e editável no projeto
+ Customização via Tailwind — sem sistema de tema paralelo
+ Variantes tipadas via cva() — padrão consistente
+ Vitrine: uso maduro de ferramentas do ecossistema atual
- Componentes precisam ser instalados individualmente
- Atualizações manuais (não via npm update)
- CSS vars do Shadcn precisam ser mapeadas para os tokens do PacePlan
