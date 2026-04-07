import type { Sql } from "../client.js";
import type { Macrocycle, Phase } from "@paceplan/types";

// ─── Mappers ──────────────────────────────────────────────────────────────────

function rowToMacrocycle(row: Record<string, unknown>): Macrocycle {
  return {
    id: row["id"] as string,
    name: row["name"] as string,
    goalDistance: Number(row["goal_distance"]),
    raceDate: (row["race_date"] as Date).toISOString().slice(0, 10),
    startDate: (row["start_date"] as Date).toISOString().slice(0, 10),
    isActive: row["is_active"] as boolean,
    createdAt: (row["created_at"] as Date).toISOString(),
    updatedAt: (row["updated_at"] as Date).toISOString(),
  };
}

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

// ─── Macrocycle queries ───────────────────────────────────────────────────────

export async function findActiveMacrocycle(sql: Sql): Promise<Macrocycle | null> {
  const rows = await sql`
    SELECT * FROM macrocycles WHERE is_active = TRUE LIMIT 1
  `;
  const row = rows[0];
  return row ? rowToMacrocycle(row as Record<string, unknown>) : null;
}

export interface CreateMacrocyclePayload {
  name: string;
  goalDistance: number;
  raceDate: string;
  startDate: string;
}

export async function findMacrocycleById(sql: Sql, id: string): Promise<Macrocycle | null> {
  const rows = await sql`
    SELECT * FROM macrocycles WHERE id = ${id}
  `;
  const row = rows[0];
  return row ? rowToMacrocycle(row as Record<string, unknown>) : null;
}

export async function createMacrocycle(
  sql: Sql,
  payload: CreateMacrocyclePayload
): Promise<Macrocycle> {
  const rows = await sql`
    INSERT INTO macrocycles (name, goal_distance, race_date, start_date, is_active)
    VALUES (
      ${payload.name},
      ${payload.goalDistance},
      ${payload.raceDate}::date,
      ${payload.startDate}::date,
      TRUE
    )
    RETURNING *
  `;
  const row = rows[0];
  if (!row) throw new Error("Failed to create macrocycle");
  return rowToMacrocycle(row as Record<string, unknown>);
}

export async function archiveActiveMacrocycle(sql: Sql): Promise<Macrocycle | null> {
  const rows = await sql`
    UPDATE macrocycles SET is_active = FALSE
    WHERE is_active = TRUE
    RETURNING *
  `;
  const row = rows[0];
  return row ? rowToMacrocycle(row as Record<string, unknown>) : null;
}

// ─── Phase queries ────────────────────────────────────────────────────────────

export async function findPhasesByMacrocycle(
  sql: Sql,
  macrocycleId: string
): Promise<Phase[]> {
  const rows = await sql`
    SELECT * FROM phases
    WHERE macrocycle_id = ${macrocycleId}
    ORDER BY order_index ASC
  `;
  return rows.map((r) => rowToPhase(r as Record<string, unknown>));
}

export interface CreatePhasePayload {
  name: string;
  objective: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
  longRunTarget?: number | undefined;
  weeklyVolumeTarget?: number | undefined;
}

export async function createPhase(
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
    VALUES (
      ${macrocycleId},
      ${payload.name},
      ${payload.objective},
      ${payload.startDate}::date,
      ${payload.endDate}::date,
      ${payload.orderIndex},
      ${payload.longRunTarget ?? null},
      ${payload.weeklyVolumeTarget ?? null}
    )
    RETURNING *
  `;
  const row = rows[0];
  if (!row) throw new Error("Failed to create phase");
  return rowToPhase(row as Record<string, unknown>);
}
