import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { healthRoutes } from './routes/health.js';
import { sessionsRoutes } from './routes/sessions.js';
import { macrocyclesRoutes } from './routes/macrocycles.js';
import { phasesRoutes } from './routes/phases.js';

export async function build() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: '*' });
  await app.register(sensible);

  await app.register(healthRoutes);
  await app.register(sessionsRoutes, { prefix: '/api/sessions' });
  await app.register(macrocyclesRoutes, { prefix: '/api/macrocycles' });
  await app.register(phasesRoutes, { prefix: '/api/macrocycles' });

  app.setErrorHandler((error: FastifyError, _req, reply) => {
    const status = error.statusCode ?? 500;
    return reply.code(status).send({
      error: error.message,
      code: error.code ?? 'INTERNAL_ERROR',
      statusCode: status,
    });
  });

  return app;
}
