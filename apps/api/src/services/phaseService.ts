import { sql } from "@paceplan/db";
import { findMacrocycleById, insertPhase, checkPhaseOverlap } from "@paceplan/db";
import type { Phase, CreatePhasePayload } from "@paceplan/types";
import { ERROR_CODES, ERROR_MESSAGES, DomainError } from "../utils/errorCodes.js";

export const phaseService = {
  async create(macrocycleId: string, input: CreatePhasePayload): Promise<Phase> {
    const macrocycle = await findMacrocycleById(sql, macrocycleId);

    if (!macrocycle) {
      throw new DomainError(
        ERROR_MESSAGES.MACROCYCLE.NOT_FOUND,
        ERROR_CODES.MACROCYCLE.NOT_FOUND,
        404
      );
    }

    if (input.startDate < macrocycle.startDate || input.endDate > macrocycle.raceDate) {
      throw new DomainError(
        ERROR_MESSAGES.PHASE.OUT_OF_BOUNDS,
        ERROR_CODES.PHASE.OUT_OF_BOUNDS,
        400
      );
    }

    const hasOverlap = await checkPhaseOverlap(sql, macrocycleId, input.startDate, input.endDate);

    if (hasOverlap) {
      throw new DomainError(
        ERROR_MESSAGES.PHASE.OVERLAP,
        ERROR_CODES.PHASE.OVERLAP,
        409
      );
    }

    return insertPhase(sql, macrocycleId, input);
  },
};
