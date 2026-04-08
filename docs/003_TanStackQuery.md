# ADR 003 — TanStack Query v5 para data fetching

**Status:** aceito
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O frontend usava useState + useEffect para buscar dados da API.
Esse padrão criava problemas recorrentes:

1. Race conditions em navegação rápida entre semanas
2. Cache manual — cada hook recarregava dados que já haviam sido
   buscados recentemente
3. Estado de loading/error reimplementado em cada hook
4. Invalidação de cache após mutations feita manualmente com refetch()
   — propenso a bugs quando múltiplos componentes dependem do mesmo dado

Com a expansão do modelo de domínio (macrociclo, fases, pace profile,
week template) o número de endpoints aumenta significativamente.
Gerenciar server state manualmente não escala.

## Decisão

Adotar TanStack Query v5 para todo fetch de dado do servidor.

Regras de uso:
- Zero useState + useEffect para dados remotos
- Query keys centralizadas em packages/api-client/src/keys.ts
- Mutations invalidam as queries afetadas via queryClient.invalidateQueries
- Hooks de dados vivem em packages/ui-logic — nunca em apps/web diretamente
- Estado local de UI (navegação de semana, formulários) continua em useState

## Alternativas consideradas

SWR: API similar mas menos features — sem mutations integradas,
sem prefetch no loader do React Router. Descartado.

Redux Toolkit Query: overhead de configuração desnecessário para
um app sem estado global complexo. Descartado.

Manter useState + useEffect: não escala com o crescimento do domínio.
Descartado.

## Consequências

+ Cache automático — dados da semana atual não são refetchados
  desnecessariamente ao navegar entre páginas
+ isPending / isFetching distintos — UX de loading mais precisa
+ Invalidação declarativa após mutations — sem refetch() manual
+ Prefetch no loader do React Router — dados prontos antes do render
+ Vitrine: padrão reconhecível por qualquer dev React em 2025
- QueryClientWrapper obrigatório em todos os testes de hook
- Migração necessária dos hooks existentes
