import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sql } from "@paceplan/db";
import { SessionType, Environment } from "@paceplan/types";
import {
  findSessionsByDateRange,
  findSessionById,
  createSession,
  updateSession,
  logSession,
  skipSession,
  reactivateSession,
  deleteSession,
} from "@paceplan/db";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PACE_REGEX = /^\d{1,2}:\d{2}$/;

const createSchema = z.object({
  date: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  type: z.nativeEnum(SessionType),
  targetDistance: z.number().positive().optional(),
  targetDuration: z.number().int().positive().optional(),
  targetPace: z.string().regex(PACE_REGEX, "Pace deve estar no formato MM:SS").optional(),
  environment: z.nativeEnum(Environment).optional(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  date: z.string().regex(DATE_REGEX).optional(),
  type: z.nativeEnum(SessionType).optional(),
  targetDistance: z.number().positive().optional(),
  targetDuration: z.number().int().positive().optional(),
  targetPace: z.string().regex(PACE_REGEX).optional(),
  environment: z.nativeEnum(Environment).optional(),
  notes: z.string().optional(),
});

const logSchema = z.object({
  actualDistance: z.number().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  actualPace: z.string().regex(PACE_REGEX, "Pace deve estar no formato MM:SS").optional(),
  heartRateAvg: z.number().int().positive().optional(),
  heartRateMax: z.number().int().positive().optional(),
  feeling: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  ]),
  notes: z.string().optional(),
});

export async function sessionsRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { startDate?: string; endDate?: string } }>(
    "/",
    async (req, reply) => {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return reply.badRequest("startDate e endDate são obrigatórios");
      }
      if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
        return reply.badRequest("Datas devem estar no formato YYYY-MM-DD");
      }
      const sessions = await findSessionsByDateRange(sql, startDate, endDate);
      return reply.send({ data: sessions });
    }
  );

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const session = await findSessionById(sql, req.params.id);
    if (!session) return reply.notFound("Sessão não encontrada");
    return reply.send({ data: session });
  });

  app.post("/", async (req, reply) => {
    const result = createSchema.safeParse(req.body);
    if (!result.success) {
      return reply.badRequest(result.error.errors[0]?.message ?? "Dados inválidos");
    }
    const session = await createSession(sql, result.data);
    return reply.code(201).send({ data: session });
  });

  app.patch<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const result = updateSchema.safeParse(req.body);
    if (!result.success) {
      return reply.badRequest(result.error.errors[0]?.message ?? "Dados inválidos");
    }
    const session = await updateSession(sql, req.params.id, result.data);
    if (!session) return reply.notFound("Sessão não encontrada");
    return reply.send({ data: session });
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const deleted = await deleteSession(sql, req.params.id);
    if (!deleted) return reply.notFound("Sessão não encontrada");
    return reply.code(204).send();
  });

  app.post<{ Params: { id: string } }>("/:id/log", async (req, reply) => {
    const result = logSchema.safeParse(req.body);
    if (!result.success) {
      return reply.badRequest(result.error.errors[0]?.message ?? "Dados inválidos");
    }
    const session = await logSession(sql, req.params.id, result.data);
    if (!session) {
      return reply.badRequest("Sessão não encontrada ou já foi concluída");
    }
    return reply.send({ data: session });
  });

  app.post<{ Params: { id: string } }>("/:id/skip", async (req, reply) => {
    const session = await skipSession(sql, req.params.id);
    if (!session) {
      return reply.badRequest("Sessão não encontrada ou não está planejada");
    }
    return reply.send({ data: session });
  });

  app.post<{ Params: { id: string } }>("/:id/reactivate", async (req, reply) => {
    const session = await reactivateSession(sql, req.params.id);
    if (!session) {
      return reply.badRequest("Sessão não encontrada ou não está pulada");
    }
    return reply.send({ data: session });
  });
}
