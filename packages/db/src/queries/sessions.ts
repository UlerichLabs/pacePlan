import type { Sql } from "../client.js";
import type {
  TrainingSession,
  SessionStatus,
  SessionType,
  CreateSessionPayload,
  UpdateSessionPayload,
  LogSessionPayload,
} from "@paceplan/types";

// ─── Mapper: row → domain ─────────────────────────────────────────────────────

function rowToSession(row: Record<string, unknown>): TrainingSession {
  const session: TrainingSession = {
    id: row["id"] as string,
    date: (row["date"] as Date).toISOString().slice(0, 10),
    type: row["type"] as SessionType,
    status: row["status"] as SessionStatus,
    createdAt: (row["created_at"] as Date).toISOString(),
    updatedAt: (row["updated_at"] as Date).toISOString(),
  };

  if (row["target_distance"] != null) {
    session.targetDistance = Number(row["target_distance"]);
  }
  if (row["target_pace"] != null) {
    session.targetPace = row["target_pace"] as string;
  }
  if (row["notes"] != null) {
    session.notes = row["notes"] as string;
  }

  if (row["status"] === "done" && row["actual_distance"] != null) {
    session.log = {
      actualDistance: Number(row["actual_distance"]),
      actualPace: row["actual_pace"] as string,
      feeling: row["feeling"] as 1 | 2 | 3 | 4 | 5,
      notes: row["log_notes"] as string | undefined,
      completedAt: (row["completed_at"] as Date).toISOString(),
    };
  }

  return session;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function findSessionsByDateRange(
  sql: Sql,
  startDate: string,
  endDate: string
): Promise<TrainingSession[]> {
  const rows = await sql`
    SELECT * FROM training_sessions
    WHERE date BETWEEN ${startDate}::date AND ${endDate}::date
    ORDER BY date ASC, created_at ASC
  `;
  return rows.map((r) => rowToSession(r as Record<string, unknown>));
}

export async function findSessionById(
  sql: Sql,
  id: string
): Promise<TrainingSession | null> {
  const rows = await sql`
    SELECT * FROM training_sessions WHERE id = ${id}
  `;
  const row = rows[0];
  return row ? rowToSession(row as Record<string, unknown>) : null;
}

export async function createSession(
  sql: Sql,
  payload: CreateSessionPayload
): Promise<TrainingSession> {
  const rows = await sql`
    INSERT INTO training_sessions (date, type, target_distance, target_pace, notes)
    VALUES (
      ${payload.date}::date,
      ${payload.type},
      ${payload.targetDistance ?? null},
      ${payload.targetPace ?? null},
      ${payload.notes ?? null}
    )
    RETURNING *
  `;
  const row = rows[0];
  if (!row) throw new Error("Failed to create session");
  return rowToSession(row as Record<string, unknown>);
}

export async function updateSession(
  sql: Sql,
  id: string,
  payload: UpdateSessionPayload
): Promise<TrainingSession | null> {
  const rows = await sql`
    UPDATE training_sessions SET
      date            = COALESCE(${payload.date ?? null}::date, date),
      type            = COALESCE(${payload.type ?? null}::session_type, type),
      target_distance = COALESCE(${payload.targetDistance ?? null}, target_distance),
      target_pace     = COALESCE(${payload.targetPace ?? null}, target_pace),
      notes           = COALESCE(${payload.notes ?? null}, notes)
    WHERE id = ${id}
    RETURNING *
  `;
  const row = rows[0];
  return row ? rowToSession(row as Record<string, unknown>) : null;
}

export async function logSession(
  sql: Sql,
  id: string,
  payload: LogSessionPayload
): Promise<TrainingSession | null> {
  const rows = await sql`
    UPDATE training_sessions SET
      status          = 'done',
      actual_distance = ${payload.actualDistance},
      actual_pace     = ${payload.actualPace},
      feeling         = ${payload.feeling},
      log_notes       = ${payload.notes ?? null},
      completed_at    = NOW()
    WHERE id = ${id} AND status = 'planned'
    RETURNING *
  `;
  const row = rows[0];
  return row ? rowToSession(row as Record<string, unknown>) : null;
}

export async function skipSession(
  sql: Sql,
  id: string
): Promise<TrainingSession | null> {
  const rows = await sql`
    UPDATE training_sessions SET status = 'skipped'
    WHERE id = ${id} AND status = 'planned'
    RETURNING *
  `;
  const row = rows[0];
  return row ? rowToSession(row as Record<string, unknown>) : null;
}

export async function reactivateSession(
  sql: Sql,
  id: string
): Promise<TrainingSession | null> {
  const rows = await sql`
    UPDATE training_sessions SET status = 'planned'
    WHERE id = ${id} AND status = 'skipped'
    RETURNING *
  `;
  const row = rows[0];
  return row ? rowToSession(row as Record<string, unknown>) : null;
}

export async function deleteSession(sql: Sql, id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM training_sessions WHERE id = ${id}
  `;
  return result.count > 0;
}
