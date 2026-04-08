# ADR 007 — Testes de integração no backend em vez de unitários por camada

**Status:** aceito
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O backend tem arquitetura em 3 camadas: route → service → query.
A abordagem clássica de testes unitários testaria cada camada
isoladamente com mocks das camadas adjacentes.

O problema: mocks de SQL são notoriamente difíceis de manter.
Um mock de query que retorna dados fabricados não detecta:
- Erros de SQL (coluna inexistente, tipo errado)
- Constraints do banco (unique, foreign key, not null)
- Comportamento real do postgres.js com tipos PostgreSQL

Para um app que usa Raw SQL diretamente, testar com banco real
é mais confiável do que mocks de SQL que mentem sobre o comportamento
real.

## Decisão

Testar route + service + query em conjunto usando app.inject()
do Fastify contra banco PostgreSQL real dedicado para testes.

Regras:
- DATABASE_URL_TEST obrigatório — abortado se ausente
- TRUNCATE nas tabelas afetadas no beforeEach de cada describe
- Cada teste cria seus próprios dados — sem dependência de fixtures globais
- app.inject() em vez de supertest — sem servidor HTTP real necessário

## Alternativas consideradas

Testes unitários por camada com mocks de SQL: detecta erros de lógica
mas não detecta erros de SQL ou constraints do banco. Mocks precisam
ser atualizados manualmente quando o schema muda. Descartado.

Testes unitários de service com mock de query: válido para lógica
complexa de negócio. Pode ser adicionado pontualmente em services
com muita lógica condicional, mas não como padrão principal. Descartado
como padrão primário.

Docker com banco efêmero: mais isolado mas adiciona complexidade
ao CI. Banco dedicado de teste é suficiente. Descartado.

## Consequências

+ Detecta erros reais de SQL — tipo, constraint, migration faltando
+ Testa o comportamento real do sistema de ponta a ponta
+ Menos mocks para manter
+ DomainErrors verificados no body da resposta HTTP real
- Testes mais lentos que unitários puros
- Requer banco PostgreSQL disponível no CI
- TRUNCATE entre testes adiciona overhead por suite
