---
name: paceplan-tests-backend
description: >
  Padrões de teste para routes, services e queries do backend PacePlan.
  Use quando for escrever ou corrigir testes em apps/api ou packages/db.
  Invoque ao mencionar "testar route", "testar service", "testar query",
  "testar endpoint" ou qualquer arquivo de apps/api ou packages/db.
compatibility: Claude Code. Stack: Vitest + Fastify + PostgreSQL.
metadata:
  author: UlerichLabs
  version: "1.0"
  project: paceplan
---

## Contexto

Testes end-to-end internos: route + service + query em conjunto.
Banco PostgreSQL real dedicado para testes — sem mocks de SQL.
Variável de ambiente: DATABASE_URL_TEST
Schema recriado via truncate antes de cada suite.

## Regras absolutas

- Zero mocks de SQL — banco real sempre
- Zero testes de service isolado — testar via route com app.inject
- Truncate nas tabelas afetadas no beforeEach de cada describe
- DATABASE_URL_TEST obrigatório — nunca rodar contra banco de produção
- Sempre verificar statusCode E body na mesma asserção
- DomainError codes verificados no body — nunca só o statusCode
- Coverage mínimo: 80% — gate no CI

## Setup — builder do app

# Criar em apps/api/src/app.ts — exportar função build separada do listen
# Reutilizada em todos os testes e no entrypoint

import Fastify from 'fastify'
import { errorHandler } from './plugins/errorHandler'
import { sessionsRoute } from './routes/sessions'
import { macrocyclesRoute } from './routes/macrocycles'

export async function build() {
  const app = Fastify()
  await app.register(errorHandler)
  await app.register(sessionsRoute, { prefix: '/api' })
  await app.register(macrocyclesRoute, { prefix: '/api' })
  return app
}

## Anatomia de teste de route

import { describe, it, expect, beforeEach } from 'vitest'
import { build } from '../src/app'
import { sql } from '@paceplan/db'

describe('POST /api/sessions', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`
  })

  it('cria sessão de corrida com distância e pace', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: {
        date:            '2026-04-13',
        type:            'LONG_RUN',
        targetDistance:  18,
        targetPace:      '6:30',
        environment:     'OUTDOOR',
      },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json()).toMatchObject({
      type:           'LONG_RUN',
      status:         'planned',
      targetDistance: 18,
      targetPace:     '6:30',
    })
  })

  it('retorna 422 quando corrida não tem distância nem duração', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-13', type: 'EASY_RUN' },
    })
    expect(res.statusCode).toBe(422)
    expect(res.json().error).toBe('INVALID_DATE_RANGE')
  })

  it('cria sessão de força sem campos de corrida', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: {
        date:  '2026-04-07',
        type:  'STRENGTH_LOWER',
        notes: 'Agachamento 4x12',
      },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().targetDistance).toBeUndefined()
  })

  it('cria sessão REST sem nenhum campo adicional', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-12', type: 'REST' },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().status).toBe('planned')
  })
})

describe('POST /api/sessions/:id/log', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`
  })

  it('registra log de corrida e muda status para done', async () => {
    const app = await build()
    const created = await app.inject({
      method: 'POST', url: '/api/sessions',
      payload: { date: '2026-04-13', type: 'LONG_RUN', targetDistance: 18 },
    })
    const { id } = created.json()

    const res = await app.inject({
      method: 'POST',
      url: `/api/sessions/${id}/log`,
      payload: {
        actualDistance: 18.2,
        actualPace:     '6:28',
        heartRateAvg:   148,
        feeling:        4,
      },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().status).toBe('done')
    expect(res.json().actualDistance).toBe(18.2)
  })

  it('retorna 409 ao logar sessão já concluída', async () => {
    const app = await build()
    const created = await app.inject({
      method: 'POST', url: '/api/sessions',
      payload: { date: '2026-04-13', type: 'LONG_RUN', targetDistance: 18 },
    })
    const { id } = created.json()
    const logPayload = { actualDistance: 18, feeling: 4 }

    await app.inject({ method: 'POST', url: `/api/sessions/${id}/log`, payload: logPayload })
    const res = await app.inject({ method: 'POST', url: `/api/sessions/${id}/log`, payload: logPayload })

    expect(res.statusCode).toBe(409)
    expect(res.json().error).toBe('SESSION_ALREADY_LOGGED')
  })

  it('retorna 404 para sessão inexistente', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions/00000000-0000-0000-0000-000000000000/log',
      payload: { feeling: 3 },
    })
    expect(res.statusCode).toBe(404)
    expect(res.json().error).toBe('SESSION_NOT_FOUND')
  })
})

describe('POST /api/macrocycles', () => {
  beforeEach(async () => {
    await sql`TRUNCATE macrocycles CASCADE`
  })

  it('cria macrociclo com sucesso', async () => {
    const app = await build()
    const res = await app.inject({
      method: 'POST',
      url: '/api/macrocycles',
      payload: {
        name:         'Meia Maratona — Novembro 2026',
        goalDistance: 21,
        raceDate:     '2026-11-15',
        startDate:    '2026-04-01',
      },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().isActive).toBe(true)
  })

  it('retorna 409 quando já existe macrociclo ativo', async () => {
    const app = await build()
    const payload = {
      name: 'Teste', goalDistance: 21,
      raceDate: '2026-11-15', startDate: '2026-04-01',
    }
    await app.inject({ method: 'POST', url: '/api/macrocycles', payload })
    const res = await app.inject({ method: 'POST', url: '/api/macrocycles', payload })

    expect(res.statusCode).toBe(409)
    expect(res.json().error).toBe('MACROCYCLE_ALREADY_ACTIVE')
  })
})

## vitest.config.ts para o backend

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles:  ['./src/test-setup.ts'],
    coverage: {
      provider:  'v8',
      reporter:  ['text', 'lcov'],
      threshold: { global: { lines: 80, functions: 80, branches: 80 } },
    },
  },
})

## test-setup.ts

import { sql } from '@paceplan/db'

if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST não definida — abortando testes')
}

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
