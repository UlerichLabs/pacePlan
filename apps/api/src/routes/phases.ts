import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { DATE_REGEX } from "../utils/validation.js";
import { phaseService } from "../services/phaseService.js";
import { ERROR_CODES, ERROR_MESSAGES, DomainError } from "../utils/errorCodes.js";

const createPhaseSchema = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.PHASE.INVALID_NAME_OBJECTIVE });
    } else if (val.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.PHASE.INVALID_NAME_OBJECTIVE });
    }
  }),
  objective: z.string().superRefine((val, ctx) => {
    if (val.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.PHASE.INVALID_NAME_OBJECTIVE });
    } else if (val.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.PHASE.INVALID_NAME_OBJECTIVE });
    }
  }),
  startDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  endDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  longRunTarget: z.number().positive().optional(),
  weeklyVolumeTarget: z.number().positive().optional(),
}).refine(data => data.startDate < data.endDate, {
  message: "A data de início deve ser anterior à data de término",
  path: ["startDate"],
});

type CreatePhaseBody = z.infer<typeof createPhaseSchema>;

export async function phasesRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { id: string }; Body: CreatePhaseBody }>("/:id/phases", async (req, reply) => {
    const result = createPhaseSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Dados inválidos";
      const isNameObjectiveError = message === ERROR_MESSAGES.PHASE.INVALID_NAME_OBJECTIVE;
      const code = isNameObjectiveError
        ? ERROR_CODES.PHASE.INVALID_NAME_OBJECTIVE
        : "400.000";
      throw new DomainError(message, code, 400);
    }

    const phase = await phaseService.create(req.params.id, result.data);

    return reply.code(201).send({
      status: "SUCCESS",
      code: ERROR_CODES.PHASE.CREATED,
      message: ERROR_MESSAGES.PHASE.CREATED.replace("{name}", phase.name),
      phase,
    });
  });
}
