# ADR 008 — Raw SQL via postgres.js em vez de ORM

**Status:** aceito
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O backend precisava de uma estratégia de acesso ao banco de dados.
As opções principais para o ecossistema Node.js + PostgreSQL são:
ORMs (Prisma, Drizzle, TypeORM) ou SQL direto (postgres.js, pg).

O domínio do PacePlan tem queries com características específicas:
- Agregações por semana (volume de corrida, streak)
- Cálculos de fase atual baseados em datas
- Joins entre macrociclo, fases e sessões

Queries desse tipo ficam mais claras em SQL do que em DSL de ORM.

## Decisão

Adotar Raw SQL via postgres.js com tagged templates.

Regras:
- SQL sempre via tagged template: sql`SELECT ... WHERE id = ${id}`
- Nunca concatenação de string — postgres.js parametriza automaticamente
- Queries vivem em packages/db/src/queries/ — nunca em services
- Retorno sempre tipado com generics: sql<Tipo[]>`...`

## Alternativas consideradas

Prisma: excelente DX, migrations automáticas, type-safe.
Mas gera SQL que nem sempre é ótimo para agregações complexas,
e adiciona uma camada de abstração que obscurece o que está
acontecendo no banco. Descartado.

Drizzle: SQL-first, mais próximo do Raw SQL. Válido mas adiciona
uma DSL para aprender. Para um projeto educacional/vitrine,
SQL real é mais didático. Descartado.

TypeORM: legacy, decorator-heavy, não recomendado para projetos novos.
Descartado.

## Consequências

+ Queries complexas escritas diretamente em SQL — sem DSL intermediária
+ postgres.js parametriza automaticamente — zero SQL injection
+ Performance previsível — sem query gerada por ORM
+ Vitrine: SQL real é mais impressionante e didático que DSL de ORM
- Migrations manuais — sem geração automática pelo ORM
- Sem type-safety automática do schema — tipos escritos manualmente
- Mais verboso para CRUDs simples
