export { sql } from "./client.js";
export type { Sql } from "./client.js";

export {
  findSessionsByDateRange,
  findSessionById,
  createSession,
  updateSession,
  logSession,
  skipSession,
  reactivateSession,
  deleteSession,
} from "./queries/sessions.js";

export {
  findActiveMacrocycle,
  findMacrocycleById,
  createMacrocycle,
  archiveActiveMacrocycle,
  findPhasesByMacrocycle,
  createPhase,
} from "./queries/macrocycles.js";

export type { CreateMacrocyclePayload } from "./queries/macrocycles.js";

export { insertPhase, checkPhaseOverlap, findPhaseByIdAndMacrocycle, updatePhase } from "./queries/phaseQueries.js";
