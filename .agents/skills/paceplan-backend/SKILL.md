---
name: paceplan-backend
description: >
  Boas práticas de backend para o PacePlan. Use sempre que for criar,
  editar ou refatorar routes, services ou queries em apps/api e
  packages/db. Cobre arquitetura em 3 camadas, Raw SQL com postgres.js,
  validação com Zod, DomainErrors tipados e testes com Vitest.
compatibility: >
  Claude Code. Stack: Node.js + Fastify 5 + TypeScript + Zod +
  PostgreSQL + postgres.js + Vitest.
metadata:
  author: UlerichLabs
  version: "2.0"
  project: paceplan
---

## Regras Absolutas

- Zero `any` explícito ou implícito
- Zero `as unknown`
- Zero comentários no código
- Zero `console.log`
- Nunca usar ORM — apenas Raw SQL via postgres.js
- SQL sempre via tagged templates: sql`SELECT * FROM t WHERE id = ${id}`
- Validar 100% das entradas com Zod antes de qualquer lógica
- Nunca expor stack trace em respostas de erro
- Erros de domínio sempre via DomainErrors factory — nunca `new Error()`

## Arquitetura em 3 camadas

apps/api/src/
  routes/       → Valida input, chama service, retorna HTTP response
  services/     → Lógica de negócio, orquestra queries, lança DomainErrors

packages/db/src/
  queries/      → SQL puro, sem lógica de negócio, retorno tipado

packages/types/src/
  errors.ts     → DomainError class + DomainErrors factory

## DomainError — packages/types/src/errors.ts

# Classe base + factory com todos os erros do domínio.
# Routes capturam DomainError e mapeiam para status HTTP.
# Services apenas lançam — nunca sabem o status HTTP.

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusHint: number,
    public readonly detail?: string
  ) {
    super(code)
    this.name = 'DomainError'
  }
}

export const DomainErrors = {
  sessionNotFound: (id?: string) =>
    new DomainError('SESSION_NOT_FOUND', 404, id),

  sessionAlreadyLogged: (id: string) =>
    new DomainError('SESSION_ALREADY_LOGGED', 409, id),

  sessionNotDone: (id: string) =>
    new DomainError('SESSION_NOT_DONE', 422, id),

  macrocycleAlreadyActive: () =>
    new DomainError('MACROCYCLE_ALREADY_ACTIVE', 409),

  macrocycleNotFound: (id?: string) =>
    new DomainError('MACROCYCLE_NOT_FOUND', 404, id),

  phaseNotFound: (id?: string) =>
    new DomainError('PHASE_NOT_FOUND', 404, id),

  phaseOverlapConflict: () =>
    new DomainError('PHASE_OVERLAP_CONFLICT', 409),

  invalidPaceFormat: (value: string) =>
    new DomainError('INVALID_PACE_FORMAT', 422, value),

  invalidDateRange: () =>
    new DomainError('INVALID_DATE_RANGE', 422),
}

## Tratamento de DomainError no plugin global

# Registrar em apps/api/src/plugins/errorHandler.ts
# Routes não precisam de try/catch para DomainError — o plugin captura.

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) {
      return reply.status(error.statusHint).send({
        error: error.code,
        detail: error.detail,
      })
    }

    if (error.validation) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        detail: error.message,
      })
    }

    return reply.status(500).send({ error: 'INTERNAL_ERROR' })
  })
}

## Anatomia de uma Route correta

# Route: valida input com Zod, chama service, retorna response.
# Sem try/catch — o errorHandler global captura DomainError.

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sessionService } from '../services/sessionService'

const createSessionSchema = z.object({
  date:            z.string().date(),
  type:            z.nativeEnum(SessionType),
  targetDistance:  z.number().positive().optional(),
  targetDuration:  z.number().int().positive().optional(),
  targetPace:      z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  environment:     z.nativeEnum(Environment).optional(),
  notes:           z.string().max(500).optional(),
})

type CreateSessionBody = z.infer

export async function sessionsRoute(app: FastifyInstance) {
  app.post<{ Body: CreateSessionBody }>('/sessions', {
    schema: { body: createSessionSchema },
  }, async (request, reply) => {
    const session = await sessionService.create(request.body)
    return reply.status(201).send(session)
  })

  app.post<{ Params: { id: string } }>(
    '/sessions/:id/log',
    { schema: { params: z.object({ id: z.string().uuid() }) } },
    async (request, reply) => {
      const session = await sessionService.log(request.params.id, request.body)
      return reply.send(session)
    }
  )
}

## Anatomia de um Service correto

# Service: lógica de negócio, regras de domínio, lança DomainErrors.
# Nunca acessa HTTP. Nunca retorna status code.

import { sessionQueries } from '@paceplan/db'
import { DomainErrors } from '@paceplan/types'
import type { CreateSessionInput, LogSessionInput, TrainingSession } from '@paceplan/types'

export const sessionService = {
  async create(input: CreateSessionInput): Promise {
    if (input.type && isRunningSession(input.type)) {
      if (!input.targetDistance && !input.targetDuration) {
        throw DomainErrors.invalidDateRange()
      }
      if (input.targetPace && !/^\d{1,2}:\d{2}$/.test(input.targetPace)) {
        throw DomainErrors.invalidPaceFormat(input.targetPace)
      }
    }
    return sessionQueries.create(input)
  },

  async log(id: string, input: LogSessionInput): Promise {
    const session = await sessionQueries.findById(id)
    if (!session) throw DomainErrors.sessionNotFound(id)
    if (session.status === 'done') throw DomainErrors.sessionAlreadyLogged(id)
    return sessionQueries.log(id, input)
  },
}

## Anatomia de uma Query correta

# Query: SQL puro, sem lógica de negócio.
# Sempre retorno tipado. Nunca lança DomainError — retorna null se não encontrar.

import { sql } from '../../client'
import type { TrainingSession, CreateSessionInput } from '@paceplan/types'

export const sessionQueries = {
  async findById(id: string): Promise {
    const [session] = await sql`
      SELECT * FROM training_sessions
      WHERE id = ${id}
    `
    return session ?? null
  },

  async create(input: CreateSessionInput): Promise {
    const [session] = await sql`
      INSERT INTO training_sessions (
        date, type, target_distance, target_duration,
        target_pace, environment, notes, status
      ) VALUES (
        ${input.date}, ${input.type}, ${input.targetDistance ?? null},
        ${input.targetDuration ?? null}, ${input.targetPace ?? null},
        ${input.environment ?? null}, ${input.notes ?? null}, 'planned'
      )
      RETURNING *
    `
    return session
  },

  async log(id: string, input: LogSessionInput): Promise {
    const [session] = await sql`
      UPDATE training_sessions SET
        actual_distance  = ${input.actualDistance ?? null},
        actual_duration  = ${input.actualDuration ?? null},
        actual_pace      = ${input.actualPace ?? null},
        heart_rate_avg   = ${input.heartRateAvg ?? null},
        heart_rate_max   = ${input.heartRateMax ?? null},
        feeling          = ${input.feeling},
        log_notes        = ${input.notes ?? null},
        status           = 'done',
        updated_at       = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return session
  },
}

## Testes — obrigatório

# Coverage mínimo: 80% global (gate no CI — build falha abaixo disso)
# Estratégia: routes + services + queries em conjunto
# Banco de teste: PostgreSQL dedicado, schema recriado antes de cada suite
# Variável de ambiente: DATABASE_URL_TEST

import { build } from '../src/app'
import { sql } from '@paceplan/db'

describe('POST /sessions', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`
  })

  it('creates a running session with distance and pace', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: {
        date: '2026-04-10',
        type: 'LONG_RUN',
        targetDistance: 18,
        targetPace: '6:30',
        environment: 'OUTDOOR',
      },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json()).toMatchObject({
      type: 'LONG_RUN',
      status: 'planned',
      targetDistance: 18,
    })
  })

  it('returns 422 when running session has no distance or duration', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: { date: '2026-04-10', type: 'EASY_RUN' },
    })
    expect(res.statusCode).toBe(422)
    expect(res.json().error).toBe('INVALID_DATE_RANGE')
  })

  it('returns 409 when logging an already logged session', async () => {
    const app = await build()
    await app.inject({ method: 'POST', url: '/sessions/mock-id/log', payload: mockLog })
    const res = await app.inject({ method: 'POST', url: '/sessions/mock-id/log', payload: mockLog })
    expect(res.statusCode).toBe(409)
    expect(res.json().error).toBe('SESSION_ALREADY_LOGGED')
  })
})

## Limite de tamanho de arquivo

- Máximo 150 linhas por arquivo
- Route com mais de 3 endpoints → dividir por recurso
- Service com mais de 100 linhas → dividir por responsabilidade

## Nomenclatura

| Artefato            | Padrão                      | Exemplo                  |
|---------------------|-----------------------------|--------------------------|
| Arquivo de route    | camelCase                   | sessions.ts              |
| Arquivo de service  | camelCase + Service         | sessionService.ts        |
| Arquivo de query    | camelCase + Queries         | sessionQueries.ts        |
| Schema Zod          | camelCase + Schema          | createSessionSchema      |
| Type inferido Zod   | PascalCase                  | CreateSessionBody        |
| Teste               | mesmo nome + .test          | sessionService.test.ts   |

## Anti-padrões proibidos

| Anti-padrão                    | Alternativa                        |
|--------------------------------|------------------------------------|
| SQL concatenado como string    | Tagged template do postgres.js     |
| Lógica de negócio na route     | Mover para service                 |
| SQL no service                 | Mover para query em packages/db    |
| Validação sem Zod              | Schema Zod obrigatório             |
| `new Error()` no service       | DomainErrors factory               |
| try/catch de DomainError na route | errorHandler global             |
| `any` em qualquer lugar        | Tipo explícito ou inferido do Zod  |
| Comentários                    | Código autoexplicativo             |
| `console.log`                  | Remover antes do commit            |
| Arquivo +150 linhas            | Dividir por responsabilidade       |
| Stack trace no response        | Mensagem de erro genérica          |
