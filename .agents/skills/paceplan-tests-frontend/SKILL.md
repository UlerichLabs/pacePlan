---
name: paceplan-tests-utils
description: >
  Padrões de teste para @paceplan/utils — lógica pura, formatadores,
  calculadoras de pace e helpers de domínio. Use quando for escrever ou
  corrigir testes em packages/utils. Invoque ao mencionar "testar utils",
  "testar formatPace", "testar calcPaceZones" ou qualquer função de
  packages/utils.
compatibility: Claude Code. Stack: Vitest + TypeScript.
metadata:
  author: UlerichLabs
  version: "1.0"
  project: paceplan
---

## Contexto

packages/utils contém lógica pura sem dependências externas.
Testes são simples: entrada → saída esperada. Zero mocks, zero setup.

## Regras absolutas

- Zero mocks — funções puras não precisam
- Zero setup de banco ou servidor
- Cada describe cobre uma função
- Cada it cobre um caso ou edge case
- Nomear: it('retorna X quando Y')
- Coverage mínimo: 80% — gate no CI

## Estrutura de arquivo

packages/utils/src/
  paceUtils.ts          → formatPace, paceToSeconds, secondsToPace
  paceUtils.test.ts     ← mesmo diretório da fonte
  calcPaceZones.ts
  calcPaceZones.test.ts
  sessionUtils.ts
  sessionUtils.test.ts
  dateUtils.ts
  dateUtils.test.ts

## Anatomia de um teste correto

import { describe, it, expect } from 'vitest'
import { formatPace, paceToSeconds, secondsToPace } from './paceUtils'

describe('formatPace', () => {
  it('adiciona /km ao pace no formato MM:SS', () => {
    expect(formatPace('5:30')).toBe('5:30/km')
  })

  it('retorna string vazia quando pace é vazio', () => {
    expect(formatPace('')).toBe('')
  })
})

describe('paceToSeconds', () => {
  it('converte 5:30 para 330 segundos', () => {
    expect(paceToSeconds('5:30')).toBe(330)
  })

  it('converte 10:05 corretamente', () => {
    expect(paceToSeconds('10:05')).toBe(605)
  })
})

describe('secondsToPace', () => {
  it('converte 330 para 5:30', () => {
    expect(secondsToPace(330)).toBe('5:30')
  })

  it('adiciona zero à esquerda nos segundos', () => {
    expect(secondsToPace(305)).toBe('5:05')
  })
})

## Testes da calculadora de pace

import { describe, it, expect } from 'vitest'
import { calcPaceZones, getPaceForSessionType } from './calcPaceZones'
import { SessionType } from '@paceplan/types'

describe('calcPaceZones', () => {
  it('gera zona easy com +60~90s para referência TARGET_RACE', () => {
    const zones = calcPaceZones('5:00', 'TARGET_RACE')
    const easyMinSec = paceToSeconds(zones.easy.min)
    const easyMaxSec = paceToSeconds(zones.easy.max)
    expect(easyMinSec).toBeGreaterThanOrEqual(paceToSeconds('5:00') + 50)
    expect(easyMaxSec).toBeLessThanOrEqual(paceToSeconds('5:00') + 100)
  })

  it('todas as zonas têm min e max no formato MM:SS', () => {
    const zones = calcPaceZones('5:00', 'RACE_10K')
    const paceRegex = /^\d{1,2}:\d{2}$/
    for (const zone of Object.values(zones)) {
      expect(zone.min).toMatch(paceRegex)
      expect(zone.max).toMatch(paceRegex)
    }
  })

  it('min sempre mais lento que max em cada zona', () => {
    const zones = calcPaceZones('4:30', 'RACE_5K')
    for (const zone of Object.values(zones)) {
      expect(paceToSeconds(zone.min)).toBeGreaterThan(paceToSeconds(zone.max))
    }
  })
})

describe('getPaceForSessionType', () => {
  it('retorna zona easy para EASY_RUN', () => {
    const zones = calcPaceZones('5:00', 'TARGET_RACE')
    const pace = getPaceForSessionType(SessionType.EASY_RUN, zones)
    expect(pace).toEqual(zones.easy)
  })

  it('retorna null para REST', () => {
    const zones = calcPaceZones('5:00', 'TARGET_RACE')
    expect(getPaceForSessionType(SessionType.REST, zones)).toBeNull()
  })
})

## Testes de sessionUtils

import { describe, it, expect } from 'vitest'
import { isRunningSession, isStrengthSession, getTypeLabel } from './sessionUtils'
import { SessionType } from '@paceplan/types'

describe('isRunningSession', () => {
  it('retorna true para LONG_RUN', () => {
    expect(isRunningSession(SessionType.LONG_RUN)).toBe(true)
  })

  it('retorna false para STRENGTH_LOWER', () => {
    expect(isRunningSession(SessionType.STRENGTH_LOWER)).toBe(false)
  })

  it('retorna false para REST', () => {
    expect(isRunningSession(SessionType.REST)).toBe(false)
  })
})

describe('getTypeLabel', () => {
  it('retorna label correto para cada SessionType', () => {
    expect(getTypeLabel(SessionType.EASY_RUN)).toBe('Easy Run')
    expect(getTypeLabel(SessionType.STRENGTH_LOWER)).toBe('Força — Inferiores')
    expect(getTypeLabel(SessionType.REST)).toBe('Descanso')
  })
})
