import { sql } from "@paceplan/db";
import { findActiveMacrocycle, createMacrocycle, type CreateMacrocyclePayload } from "@paceplan/db";
import type { Macrocycle } from "@paceplan/types";
import { ERROR_CODES, ERROR_MESSAGES, DomainError } from "../utils/errorCodes.js";

export const macrocycleService = {
  async create(input: CreateMacrocyclePayload): Promise<Macrocycle> {
    const activeMacrocycle = await findActiveMacrocycle(sql);
    
    if (activeMacrocycle) {
      throw new DomainError(
        ERROR_MESSAGES.MACROCYCLE.ALREADY_ACTIVE,
        ERROR_CODES.MACROCYCLE.ALREADY_ACTIVE,
        409
      );
    }

    return createMacrocycle(sql, input);
  }
};
