# ADR 004 — Monorepo com packages compartilhados

**Status:** aceito
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O projeto já usava Turborepo com @paceplan/types compartilhado.
Com a decisão de adicionar React Native como alvo futuro (ver ADR 005),
foi necessário pensar em quais camadas podem ser compartilhadas entre
web e mobile sem reescrita.

A pergunta central: o que em apps/web não é "como isso aparece na tela"?
Services de API, hooks de negócio, utilitários de pace e formatadores
são JavaScript puro — não dependem de DOM, CSS ou APIs de browser.
Esses podem e devem viver fora de apps/web.

## Decisão

Expandir os packages compartilhados com quatro responsabilidades:

packages/types      → interfaces, enums, DTOs, DomainError (já existia)
packages/utils      → lógica pura: pace calc, formatadores, date utils
packages/api-client → serviços de API, query keys TanStack Query
packages/ui-logic   → hooks de negócio (useWeek, useSessions, useMacrocycleActive)

Regra: se o código não tem JSX, CSS ou referência a DOM → vai para packages/.
apps/web importa de packages/ — nunca o contrário.

## Alternativas consideradas

Manter tudo em apps/web: simples agora, mas obriga reescrita
total da lógica quando o mobile for criado. Descartado.

Monorepo sem packages (só apps): mesma lógica duplicada em web
e mobile. Descartado.

## Consequências

+ apps/mobile (React Native) importa os mesmos packages — zero
  reescrita de lógica de negócio, hooks e API calls
+ packages/utils testado uma vez, funciona nos dois apps
+ Separação clara de responsabilidades — componentes são só visual
+ Vitrine: arquitetura que escala para múltiplos targets
- Migração necessária: mover services e hooks de apps/web para packages/
- Build do Turborepo precisa incluir os novos packages no pipeline
