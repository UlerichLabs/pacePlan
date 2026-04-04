import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sql } from "@paceplan/db";
import {
  findActiveMacrocycle,
  createMacrocycle,
  findPhasesByMacrocycle,
  createPhase,
} from "@paceplan/db";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const createMacrocycleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  goalDistance: z.number().positive("Distância deve ser positiva"),
  raceDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  startDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
});

const createPhaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  objective: z.string().min(1, "Objetivo é obrigatório"),
  startDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  endDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  orderIndex: z.number().int().min(1),
  longRunTarget: z.number().positive().optional(),
  weeklyVolumeTarget: z.number().positive().optional(),
});

export async function macrocyclesRoutes(app: FastifyInstance): Promise<void> {
  app.get("/active", async (_req, reply) => {
    const macrocycle = await findActiveMacrocycle(sql);
    if (!macrocycle) {
      return reply.send({ data: null });
    }
    const phases = await findPhasesByMacrocycle(sql, macrocycle.id);
    return reply.send({ data: { macrocycle, phases } });
  });

  app.post("/", async (req, reply) => {
    const result = createMacrocycleSchema.safeParse(req.body);
    if (!result.success) {
      return reply.badRequest(result.error.errors[0]?.message ?? "Dados inválidos");
    }
    const macrocycle = await createMacrocycle(sql, result.data);
    return reply.code(201).send({ data: macrocycle });
  });

  app.get<{ Params: { id: string } }>("/:id/phases", async (req, reply) => {
    const phases = await findPhasesByMacrocycle(sql, req.params.id);
    return reply.send({ data: phases });
  });

  app.post<{ Params: { id: string } }>("/:id/phases", async (req, reply) => {
    const result = createPhaseSchema.safeParse(req.body);
    if (!result.success) {
      return reply.badRequest(result.error.errors[0]?.message ?? "Dados inválidos");
    }
    const phase = await createPhase(sql, req.params.id, result.data);
    return reply.code(201).send({ data: phase });
  });
}
