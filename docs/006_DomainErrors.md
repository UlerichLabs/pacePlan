# ADR 006 — DomainErrors factory em vez de new Error()

**Status:** aceito
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O backend usava new Error('mensagem livre') nos services para
sinalizar erros de domínio. Isso criava três problemas:

1. Routes precisavam fazer try/catch e inspecionar a mensagem
   como string para decidir o status HTTP — frágil e propenso a typos
2. Sem contrato entre service e route — qualquer string era válida
3. Impossível listar os erros possíveis de um service sem ler
   toda a implementação

Com o crescimento do domínio (macrociclo, fases, pace profile)
o número de erros possíveis aumenta. Gerenciar isso com strings livres
não é sustentável.

## Decisão

Adotar o padrão DomainErrors factory em packages/types/src/errors.ts.

Estrutura:
  class DomainError extends Error com code, statusHint e detail opcional
  DomainErrors factory com métodos nomeados por caso de uso:
    DomainErrors.sessionNotFound(id)
    DomainErrors.macrocycleAlreadyActive()
    DomainErrors.phaseOverlapConflict()
    DomainErrors.invalidPaceFormat(value)
    etc.

Plugin errorHandler global no Fastify captura DomainError e mapeia
statusHint para o status HTTP da resposta. Routes sem try/catch.

## Alternativas consideradas

Opção A — code + status simples (throw new DomainError('CODE', 404)):
menos expressivo, sem factory nomeada. Descartado.

Opção B — code + status + mensagem separada: melhor que A mas
ainda não centraliza os erros. Descartado.

HTTP errors direto no service (reply.status(404)):
acopla o service ao protocolo HTTP — service não deve saber de HTTP.
Descartado.

## Consequências

+ Contrato explícito: lista de erros possíveis em um único arquivo
+ Routes sem try/catch — errorHandler global trata tudo
+ TypeScript: DomainErrors.xxx() é autocompletado pelo editor
+ Testes: assertar error code no body em vez de inspecionar mensagem
+ Vitrine: padrão reconhecível em codebases de produção
- Novo erro de domínio exige adicionar método ao factory
- statusHint no DomainError é uma sugestão — o handler pode ignorar
