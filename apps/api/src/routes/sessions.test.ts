import { describe, it, expect, beforeEach } from 'vitest';
import { build } from '../app';
import { sql } from '@paceplan/db';

describe('POST /api/sessions', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`;
  });

  it('cria sessão de corrida com distância e pace', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: {
        date: '2026-04-13',
        type: 'LONG_RUN',
        targetDistance: 18,
        targetPace: '6:30',
        environment: 'OUTDOOR',
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data).toMatchObject({
      type: 'LONG_RUN',
      status: 'planned',
      targetDistance: 18,
      targetPace: '6:30',
    });
  });

  it('cria sessão de força sem campos de corrida', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: {
        date: '2026-04-07',
        type: 'STRENGTH_LOWER',
        notes: 'Agachamento 4x12',
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.targetDistance).toBeUndefined();
    expect(res.json().data.type).toBe('STRENGTH_LOWER');
  });

  it('cria sessão REST sem campos adicionais', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-12', type: 'REST' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.status).toBe('planned');
    expect(res.json().data.type).toBe('REST');
  });

  it('retorna 400 quando o tipo de sessão é inválido', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-13', type: 'INVALID_TYPE' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('retorna 400 quando a data está no formato errado', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '13-04-2026', type: 'EASY_RUN' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('cria sessão EASY_RUN sem pace', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: {
        date: '2026-04-08',
        type: 'EASY_RUN',
        targetDistance: 8,
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.type).toBe('EASY_RUN');
  });
});

describe('GET /api/sessions', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`;
  });

  it('retorna lista de sessões no intervalo de datas', async () => {
    const app = await build();
    await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-08', type: 'EASY_RUN', targetDistance: 8 },
    });
    const res = await app.inject({
      method: 'GET',
      url: '/api/sessions?startDate=2026-04-06&endDate=2026-04-12',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveLength(1);
  });

  it('retorna 400 sem startDate', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/sessions?endDate=2026-04-12',
    });
    expect(res.statusCode).toBe(400);
  });

  it('retorna lista vazia quando não há sessões no período', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/sessions?startDate=2026-04-06&endDate=2026-04-12',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveLength(0);
  });
});

describe('POST /api/sessions/:id/log', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`;
  });

  it('registra log de corrida e muda status para done', async () => {
    const app = await build();
    const created = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-13', type: 'LONG_RUN', targetDistance: 18 },
    });
    const { id } = created.json().data;

    const res = await app.inject({
      method: 'POST',
      url: `/api/sessions/${id}/log`,
      payload: {
        actualDistance: 18.2,
        actualPace: '6:28',
        heartRateAvg: 148,
        feeling: 4,
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.status).toBe('done');
    expect(res.json().data.log.actualDistance).toBe(18.2);
  });

  it('retorna 400 ao logar sessão já concluída', async () => {
    const app = await build();
    const created = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-13', type: 'LONG_RUN', targetDistance: 18 },
    });
    const { id } = created.json().data;
    const logPayload = { actualDistance: 18, feeling: 4 };

    await app.inject({ method: 'POST', url: `/api/sessions/${id}/log`, payload: logPayload });
    const res = await app.inject({ method: 'POST', url: `/api/sessions/${id}/log`, payload: logPayload });

    expect(res.statusCode).toBe(400);
  });

  it('retorna 400 para sessão inexistente', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions/00000000-0000-0000-0000-000000000000/log',
      payload: { feeling: 3 },
    });
    expect(res.statusCode).toBe(400);
  });

  it('registra log de sessão de força sem distância', async () => {
    const app = await build();
    const created = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-09', type: 'STRENGTH_LOWER' },
    });
    const { id } = created.json().data;

    const res = await app.inject({
      method: 'POST',
      url: `/api/sessions/${id}/log`,
      payload: { feeling: 3 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.status).toBe('done');
  });
});

describe('POST /api/sessions/:id/skip', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`;
  });

  it('muda status para skipped', async () => {
    const app = await build();
    const created = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-08', type: 'EASY_RUN', targetDistance: 8 },
    });
    const { id } = created.json().data;

    const res = await app.inject({
      method: 'POST',
      url: `/api/sessions/${id}/skip`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.status).toBe('skipped');
  });
});

describe('DELETE /api/sessions/:id', () => {
  beforeEach(async () => {
    await sql`TRUNCATE training_sessions CASCADE`;
  });

  it('deleta sessão existente com sucesso', async () => {
    const app = await build();
    const created = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { date: '2026-04-08', type: 'REST' },
    });
    const { id } = created.json().data;

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/sessions/${id}`,
    });
    expect(res.statusCode).toBe(204);
  });

  it('retorna 404 para sessão inexistente', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/sessions/00000000-0000-0000-0000-000000000000',
    });
    expect(res.statusCode).toBe(404);
  });
});
