import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sql } from "@paceplan/db";
import {
  findActiveMacrocycle,
  findMacrocycleById,
  findPhasesByMacrocycle,
} from "@paceplan/db";
import { DATE_REGEX } from "../utils/validation.js";
import { macrocycleService } from "../services/macrocycleService.js";
import { ERROR_CODES, ERROR_MESSAGES, DomainError } from "../utils/errorCodes.js";

const createMacrocycleSchema = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.MACROCYCLE.NAME_EMPTY });
    } else if (val.length < 3 || val.length > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.MACROCYCLE.NAME_LENGTH });
    }
  }),
  goalDistance: z.number().positive(ERROR_MESSAGES.MACROCYCLE.INVALID_DISTANCE),
  raceDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  startDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
}).refine(data => data.startDate < data.raceDate, {
  message: ERROR_MESSAGES.MACROCYCLE.INVALID_DATES,
  path: ["startDate"]
});

export async function macrocyclesRoutes(app: FastifyInstance): Promise<void> {
  app.get("/active/context", async (_req, reply) => {
    const result = await macrocycleService.getActiveContext();
    return reply.send({
      status: "SUCCESS",
      code: result.code,
      context: result.context,
    });
  });

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
      const message = result.error.errors[0]?.message ?? "Dados inválidos";
      let code = "400.000";
      if (message === ERROR_MESSAGES.MACROCYCLE.NAME_EMPTY) code = ERROR_CODES.MACROCYCLE.NAME_EMPTY;
      if (message === ERROR_MESSAGES.MACROCYCLE.NAME_LENGTH) code = ERROR_CODES.MACROCYCLE.NAME_LENGTH;
      if (message === ERROR_MESSAGES.MACROCYCLE.INVALID_DATES) code = ERROR_CODES.MACROCYCLE.INVALID_DATES;
      if (message === ERROR_MESSAGES.MACROCYCLE.INVALID_DISTANCE) code = ERROR_CODES.MACROCYCLE.INVALID_DISTANCE;

      throw new DomainError(message, code, 400);
    }

    const macrocycle = await macrocycleService.create(result.data);
    return reply.code(201).send({
      status: "SUCCESS",
      code: ERROR_CODES.MACROCYCLE.CREATED,
      message: ERROR_MESSAGES.MACROCYCLE.CREATED.replace('{name}', macrocycle.name),
      macrocycle,
    });
  });

  app.patch("/active/archive", async (_req, reply) => {
    const macrocycle = await macrocycleService.archiveActive();
    return reply.send({
      status: "SUCCESS",
      code: ERROR_CODES.MACROCYCLE.ARCHIVED,
      message: ERROR_MESSAGES.MACROCYCLE.ARCHIVED,
      macrocycle,
    });
  });

  app.get<{ Params: { id: string } }>("/:id/phases", async (req, reply) => {
    const macrocycle = await findMacrocycleById(sql, req.params.id);
    if (!macrocycle) return reply.notFound("Macrociclo não encontrado");
    const phases = await findPhasesByMacrocycle(sql, macrocycle.id);
    return reply.send({ data: phases });
  });
}
