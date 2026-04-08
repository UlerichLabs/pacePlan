import { sql } from "@paceplan/db";
import {
  findActiveMacrocycle,
  createMacrocycle,
  archiveActiveMacrocycle,
  getActiveMacrocycleContext,
  type CreateMacrocyclePayload,
} from "@paceplan/db";
import type { Macrocycle, Phase } from "@paceplan/types";
import { ERROR_CODES, ERROR_MESSAGES, DomainError } from "../utils/errorCodes.js";

interface ActiveContextProgress {
  currentWeekNumber: number;
  totalWeeksInPhase: number;
}

interface ActiveContextResult {
  code: string;
  context: {
    macrocycle: Macrocycle;
    currentPhase: Phase | null;
    progress: ActiveContextProgress | null;
  };
}

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
  },

  async archiveActive(): Promise<Macrocycle> {
    const archived = await archiveActiveMacrocycle(sql);

    if (!archived) {
      throw new DomainError(
        ERROR_MESSAGES.MACROCYCLE.NOT_FOUND,
        ERROR_CODES.MACROCYCLE.NOT_FOUND,
        404
      );
    }

    return archived;
  },

  async getActiveContext(): Promise<ActiveContextResult> {
    const result = await getActiveMacrocycleContext(sql, new Date());

    if (!result) {
      throw new DomainError(
        ERROR_MESSAGES.MACROCYCLE.NOT_FOUND,
        ERROR_CODES.MACROCYCLE.NOT_FOUND,
        404
      );
    }

    const { macrocycle, phase } = result;

    if (!phase) {
      return {
        code: ERROR_CODES.CONTEXT.NO_CURRENT_PHASE,
        context: { macrocycle, currentPhase: null, progress: null },
      };
    }

    const MS_PER_DAY = 86400000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const phaseStart = new Date(phase.startDate);
    phaseStart.setHours(0, 0, 0, 0);
    const phaseEnd = new Date(phase.endDate);
    phaseEnd.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.floor((today.getTime() - phaseStart.getTime()) / MS_PER_DAY);
    const totalDays = Math.floor((phaseEnd.getTime() - phaseStart.getTime()) / MS_PER_DAY) + 1;

    return {
      code: ERROR_CODES.CONTEXT.SUCCESS,
      context: {
        macrocycle,
        currentPhase: phase,
        progress: {
          currentWeekNumber: Math.floor(daysSinceStart / 7) + 1,
          totalWeeksInPhase: Math.ceil(totalDays / 7),
        },
      },
    };
  },
};
