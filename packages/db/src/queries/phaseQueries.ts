import type { Sql } from "../client.js";
import type { Phase, CreatePhasePayload, UpdatePhasePayload } from "@paceplan/types";

function rowToPhase(row: Record<string, unknown>): Phase {
  const phase: Phase = {
    id: row["id"] as string,
    macrocycleId: row["macrocycle_id"] as string,
    name: row["name"] as string,
    objective: row["objective"] as string,
    startDate: (row["start_date"] as Date).toISOString().slice(0, 10),
    endDate: (row["end_date"] as Date).toISOString().slice(0, 10),
    order: Number(row["order_index"]),
  };

  if (row["long_run_target"] != null) {
    phase.longRunTarget = Number(row["long_run_target"]);
  }
  if (row["weekly_volume_target"] != null) {
    phase.weeklyVolumeTarget = Number(row["weekly_volume_target"]);
  }

  return phase;
}

export async function insertPhase(
  sql: Sql,
  macrocycleId: string,
  payload: CreatePhasePayload
): Promise<Phase> {
  const rows = await sql`
    INSERT INTO phases (
      macrocycle_id, name, objective,
      start_date, end_date, order_index,
      long_run_target, weekly_volume_target
    )
    SELECT
      ${macrocycleId},
      ${payload.name},
      ${payload.objective},
      ${payload.startDate}::date,
      ${payload.endDate}::date,
      COALESCE((SELECT MAX(order_index) FROM phases WHERE macrocycle_id = ${macrocycleId}), 0) + 1,
      ${payload.longRunTarget ?? null},
      ${payload.weeklyVolumeTarget ?? null}
    RETURNING *
  `;
  const row = rows[0];
  if (!row) throw new Error("Failed to insert phase");
  return rowToPhase(row as Record<string, unknown>);
}

export async function findPhaseByIdAndMacrocycle(
  sql: Sql,
  phaseId: string,
  macrocycleId: string
): Promise<Phase | null> {
  const rows = await sql`
    SELECT * FROM phases
    WHERE id = ${phaseId}
      AND macrocycle_id = ${macrocycleId}
  `;
  const row = rows[0];
  return row ? rowToPhase(row as Record<string, unknown>) : null;
}

export async function updatePhase(
  sql: Sql,
  phaseId: string,
  payload: UpdatePhasePayload
): Promise<Phase | null> {
  const name = payload.name ?? null;
  const objective = payload.objective ?? null;
  const startDate = payload.startDate ?? null;
  const endDate = payload.endDate ?? null;

  const rows = await sql`
    UPDATE phases SET
      name                 = COALESCE(${name}, name),
      objective            = COALESCE(${objective}, objective),
      start_date           = COALESCE(${startDate}::date, start_date),
      end_date             = COALESCE(${endDate}::date, end_date),
      long_run_target      = ${payload.longRunTarget !== undefined ? payload.longRunTarget : sql`long_run_target`},
      weekly_volume_target = ${payload.weeklyVolumeTarget !== undefined ? payload.weeklyVolumeTarget : sql`weekly_volume_target`}
    WHERE id = ${phaseId}
    RETURNING *
  `;
  const row = rows[0];
  return row ? rowToPhase(row as Record<string, unknown>) : null;
}

export async function checkPhaseOverlap(
  sql: Sql,
  macrocycleId: string,
  startDate: string,
  endDate: string,
  excludePhaseId?: string
): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM phases
    WHERE macrocycle_id = ${macrocycleId}
      AND start_date < ${endDate}::date
      AND end_date > ${startDate}::date
      ${excludePhaseId !== undefined ? sql`AND id != ${excludePhaseId}` : sql``}
    LIMIT 1
  `;
  return rows.length > 0;
}
