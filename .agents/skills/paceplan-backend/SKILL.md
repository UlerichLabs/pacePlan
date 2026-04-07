---
name: paceplan-backend
description: Boas práticas de backend para o projeto PacePlan. Use sempre que for criar, editar ou refatorar routes, services ou queries em apps/api e packages/db. Cobre arquitetura em 3 camadas, Raw SQL seguro com postgres.js, validação com Zod, TypeScript strict e limites de tamanho de arquivo.
compatibility: Designed for Claude Code. Stack: Node.js + Fastify 5 + TypeScript + Zod + PostgreSQL + postgres.js.
metadata:
  author: paceplan
  version: "1.0"
---

## Regras Absolutas

- Zero `any` explícito ou implícito
- Zero `as unknown`
- Zero comentários no código
- Zero `console.log`
- Nunca usar ORM — apenas Raw SQL via postgres.js
- SQL sempre via tagged templates: `` sql`SELECT * FROM t WHERE id = ${id}` ``
- Validar 100% das entradas com Zod antes de qualquer lógica
- Nunca expor stack trace em respostas de erro

## Arquitetura em 3 Camadas

```
apps/api/src/
  routes/     → Recebe request, valida com Zod, chama service, retorna response
  services/   → Lógica de negócio, orquestra queries, lança erros de domínio

packages/db/src/
  queries/    → Apenas SQL puro, sem lógica de negócio
```

### Responsabilidade de cada camada

**Route** — apenas:
1. Validar input com Zod
2. Chamar service
3. Retornar resposta HTTP

**Service** — apenas:
1. Receber dados já validados
2. Aplicar regras de negócio
3. Chamar queries
4. Lançar erros de domínio

**Query** — apenas:
1. Executar SQL
2. Retornar resultado tipado

## Limite de Tamanho

- **Máximo 150 linhas por arquivo**
- Route com mais de 3 endpoints → dividir em arquivos por recurso
- Service com mais de 100 linhas → dividir por responsabilidade

## Anatomia de uma Route Correta

```ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sessaoService } from '../services/sessaoService'

const criarSessaoSchema = z.object({
  nome: z.string().min(1),
  data: z.string().datetime(),
})

type CriarSessaoBody = z.infer<typeof criarSessaoSchema>

export async function sessoesRoute(app: FastifyInstance) {
  app.post<{ Body: CriarSessaoBody }>('/sessoes', {
    schema: { body: criarSessaoSchema },
  }, async (request, reply) => {
    const sessao = await sessaoService.criar(request.body)
    return reply.status(201).send(sessao)
  })
}
```

## Anatomia de um Service Correto

```ts
import { criarSessaoQuery } from '@paceplan/db'
import { Sessao, CriarSessaoInput } from '@paceplan/types'

export const sessaoService = {
  async criar(input: CriarSessaoInput): Promise<Sessao> {
    return criarSessaoQuery(input)
  },
}
```

## Anatomia de uma Query Correta

```ts
import { sql } from '../../client'
import { Sessao, CriarSessaoInput } from '@paceplan/types'

export async function criarSessaoQuery(input: CriarSessaoInput): Promise<Sessao> {
  const [sessao] = await sql<Sessao[]>`
    INSERT INTO sessoes (nome, data)
    VALUES (${input.nome}, ${input.data})
    RETURNING *
  `
  return sessao
}
```

## Tratamento de Erros

```ts
// ✅ Correto no route
const sessao = await sessaoService.buscar(id)
if (!sessao) {
  return reply.status(404).send({ error: 'Sessão não encontrada' })
}

// ✅ Correto no service
if (condicaoInvalida) {
  throw new Error('Descrição clara do problema de negócio')
}
```

## Nomenclatura

| Artefato | Padrão | Exemplo |
|---|---|---|
| Arquivo de route | camelCase | `sessoes.ts` |
| Arquivo de service | camelCase + sufixo `Service` | `sessaoService.ts` |
| Arquivo de query | camelCase + sufixo `Queries` | `sessaoQueries.ts` |
| Schema Zod | camelCase + sufixo `Schema` | `criarSessaoSchema` |
| Type inferido do Zod | PascalCase | `CriarSessaoBody` |

## Anti-padrões Proibidos

| Anti-padrão | Alternativa |
|---|---|
| SQL concatenado como string | Tagged template do postgres.js |
| Lógica de negócio na route | Mover para service |
| SQL no service | Mover para query em packages/db |
| Validação sem Zod | Schema Zod obrigatório |
| `any` em qualquer lugar | Tipo explícito ou inferido do Zod |
| Comentários | Código autoexplicativo |
| `console.log` | Remover antes do commit |
| Arquivo +150 linhas | Dividir por responsabilidade |
| Stack trace no response | Mensagem de erro genérica |