import { describe, it, expect, beforeEach } from 'vitest';
import { build } from '../app';
import { sql } from '@paceplan/db';

const validPayload = {
  name: 'Meia Maratona — Novembro 2026',
  goalDistance: 21,
  raceDate: '2026-11-15',
  startDate: '2026-04-01',
};

describe('POST /api/macrocycles', () => {
  beforeEach(async () => {
    await sql`TRUNCATE macrocycles CASCADE`;
  });

  it('cria macrociclo com sucesso', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/macrocycles',
      payload: validPayload,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().macrocycle.isActive).toBe(true);
    expect(res.json().macrocycle.name).toBe('Meia Maratona — Novembro 2026');
  });

  it('retorna 409 quando já existe macrociclo ativo', async () => {
    const app = await build();
    await app.inject({ method: 'POST', url: '/api/macrocycles', payload: validPayload });
    const res = await app.inject({ method: 'POST', url: '/api/macrocycles', payload: validPayload });

    expect(res.statusCode).toBe(409);
    expect(res.json().code).toBe('409.010');
  });

  it('retorna 400 quando o nome está vazio', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/macrocycles',
      payload: { ...validPayload, name: '' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('retorna 400 quando startDate é posterior a raceDate', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/macrocycles',
      payload: { ...validPayload, startDate: '2026-12-01' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('retorna 400 quando goalDistance é negativo', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/macrocycles',
      payload: { ...validPayload, goalDistance: -5 },
    });
    expect(res.statusCode).toBe(400);
  });

  it('retorna 400 quando nome tem menos de 3 caracteres', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'POST',
      url: '/api/macrocycles',
      payload: { ...validPayload, name: 'AB' },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/macrocycles/active', () => {
  beforeEach(async () => {
    await sql`TRUNCATE macrocycles CASCADE`;
  });

  it('retorna null quando não há macrociclo ativo', async () => {
    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/macrocycles/active',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toBeNull();
  });

  it('retorna macrociclo ativo com suas fases', async () => {
    const app = await build();
    await app.inject({ method: 'POST', url: '/api/macrocycles', payload: validPayload });
    const res = await app.inject({
      method: 'GET',
      url: '/api/macrocycles/active',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.macrocycle.isActive).toBe(true);
    expect(Array.isArray(res.json().data.phases)).toBe(true);
  });
});
