import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { DATE_REGEX } from "../utils/validation.js";
import { phaseService } from "../services/phaseService.js";
import { ERROR_CODES, ERROR_MESSAGES, DomainError } from "../utils/errorCodes.js";

const nameObjectiveRefine = (val: string, ctx: z.RefinementCtx) => {
  if (val.trim().length === 0 || val.trim().length < 3) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.PHASE.INVALID_NAME_OBJECTIVE });
  }
};

const createPhaseSchema = z.object({
  name: z.string().superRefine(nameObjectiveRefine),
  objective: z.string().superRefine(nameObjectiveRefine),
  startDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  endDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD"),
  longRunTarget: z.number().positive().optional(),
  weeklyVolumeTarget: z.number().positive().optional(),
}).refine(data => data.startDate < data.endDate, {
  message: "A data de início deve ser anterior à data de término",
  path: ["startDate"],
});

const updatePhaseSchema = z.object({
  name: z.string().superRefine(nameObjectiveRefine).optional(),
  objective: z.string().superRefine(nameObjectiveRefine).optional(),
  startDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD").optional(),
  endDate: z.string().regex(DATE_REGEX, "Data deve estar no formato YYYY-MM-DD").optional(),
  longRunTarget: z.number().positive().nullable().optional(),
  weeklyVolumeTarget: z.number().positive().nullable().optional(),
}).refine(data => {
  if (data.startDate && data.endDate) return data.startDate < data.endDate;
  return true;
}, {
  message: "A data de início deve ser anterior à data de término",
  path: ["startDate"],
});

type CreatePhaseBody = z.infer<typeof createPhaseSchema>;
type UpdatePhaseBody = z.infer<typeof updatePhaseSchema>;

function extractPhaseError(message: string): string {
  if (message === ERROR_MESSAGES.PHASE.INVALID_NAME_OBJECTIVE) {
    return ERROR_CODES.PHASE.INVALID_NAME_OBJECTIVE;
  }
  return "400.000";
}

export async function phasesRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { id: string }; Body: CreatePhaseBody }>("/:id/phases", async (req, reply) => {
    const result = createPhaseSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Dados inválidos";
      throw new DomainError(message, extractPhaseError(message), 400);
    }

    const phase = await phaseService.create(req.params.id, result.data);

    return reply.code(201).send({
      status: "SUCCESS",
      code: ERROR_CODES.PHASE.CREATED,
      message: ERROR_MESSAGES.PHASE.CREATED.replace("{name}", phase.name),
      phase,
    });
  });

  app.patch<{ Params: { id: string; phaseId: string }; Body: UpdatePhaseBody }>(
    "/:id/phases/:phaseId",
    async (req, reply) => {
      const result = updatePhaseSchema.safeParse(req.body);
      if (!result.success) {
        const message = result.error.errors[0]?.message ?? "Dados inválidos";
        throw new DomainError(message, extractPhaseError(message), 400);
      }

      const phase = await phaseService.update(req.params.id, req.params.phaseId, result.data);

      return reply.send({
        status: "SUCCESS",
        code: ERROR_CODES.PHASE.UPDATED,
        message: ERROR_MESSAGES.PHASE.UPDATED.replace("{name}", phase.name),
        phase,
      });
    }
  );
}
