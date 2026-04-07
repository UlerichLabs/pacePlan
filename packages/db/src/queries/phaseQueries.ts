import type { Sql } from "../client.js";
import type { Phase, CreatePhasePayload } from "@paceplan/types";

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

export async function checkPhaseOverlap(
  sql: Sql,
  macrocycleId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM phases
    WHERE macrocycle_id = ${macrocycleId}
      AND start_date < ${endDate}::date
      AND end_date > ${startDate}::date
    LIMIT 1
  `;
  return rows.length > 0;
}
