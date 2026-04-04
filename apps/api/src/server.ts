import "dotenv/config";
import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { healthRoutes } from "./routes/health.js";
import { sessionsRoutes } from "./routes/sessions.js";
import { macrocyclesRoutes } from "./routes/macrocycles.js";

const PORT = parseInt(process.env["PORT"] ?? "3001", 10);
const HOST = process.env["HOST"] ?? "0.0.0.0";
const CORS_ORIGIN = process.env["CORS_ORIGIN"] ?? "http://localhost:5173";

const app = Fastify({ logger: true });

await app.register(cors, { origin: CORS_ORIGIN });
await app.register(sensible);

await app.register(healthRoutes);
await app.register(sessionsRoutes, { prefix: "/api/sessions" });
await app.register(macrocyclesRoutes, { prefix: "/api/macrocycles" });

app.setErrorHandler((error: FastifyError, _req, reply) => {
  const status = error.statusCode ?? 500;
  return reply.code(status).send({
    error: error.message,
    code: error.code ?? "INTERNAL_ERROR",
    statusCode: status,
  });
});

try {
  await app.listen({ port: PORT, host: HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
