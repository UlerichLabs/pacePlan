import type { Sql } from "../client.js";
import type {
  TrainingSession,
  SessionStatus,
  SessionType,
  Environment,
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
  if (row["target_duration"] != null) {
    session.targetDuration = Number(row["target_duration"]);
  }
  if (row["target_pace"] != null) {
    session.targetPace = row["target_pace"] as string;
  }
  if (row["environment"] != null) {
    session.environment = row["environment"] as Environment;
  }
  if (row["notes"] != null) {
    session.notes = row["notes"] as string;
  }

  if (row["status"] === "done" && row["feeling"] != null) {
    session.log = {
      feeling: row["feeling"] as 1 | 2 | 3 | 4 | 5,
      completedAt: (row["completed_at"] as Date).toISOString(),
    };

    if (row["actual_distance"] != null) {
      session.log.actualDistance = Number(row["actual_distance"]);
    }
    if (row["actual_duration"] != null) {
      session.log.actualDuration = Number(row["actual_duration"]);
    }
    if (row["actual_pace"] != null) {
      session.log.actualPace = row["actual_pace"] as string;
    }
    if (row["heart_rate_avg"] != null) {
      session.log.heartRateAvg = Number(row["heart_rate_avg"]);
    }
    if (row["heart_rate_max"] != null) {
      session.log.heartRateMax = Number(row["heart_rate_max"]);
    }
    if (row["log_notes"] != null) {
      session.log.notes = row["log_notes"] as string;
    }
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
    INSERT INTO training_sessions (
      date, type, target_distance, target_duration,
      target_pace, environment, notes
    )
    VALUES (
      ${payload.date}::date,
      ${payload.type},
      ${payload.targetDistance ?? null},
      ${payload.targetDuration ?? null},
      ${payload.targetPace ?? null},
      ${payload.environment ?? null},
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
      date             = COALESCE(${payload.date ?? null}::date, date),
      type             = COALESCE(${payload.type ?? null}::session_type, type),
      target_distance  = COALESCE(${payload.targetDistance ?? null}, target_distance),
      target_duration  = COALESCE(${payload.targetDuration ?? null}, target_duration),
      target_pace      = COALESCE(${payload.targetPace ?? null}, target_pace),
      environment      = COALESCE(${payload.environment ?? null}::environment, environment),
      notes            = COALESCE(${payload.notes ?? null}, notes)
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
      status           = 'done',
      actual_distance  = ${payload.actualDistance ?? null},
      actual_duration  = ${payload.actualDuration ?? null},
      actual_pace      = ${payload.actualPace ?? null},
      heart_rate_avg   = ${payload.heartRateAvg ?? null},
      heart_rate_max   = ${payload.heartRateMax ?? null},
      feeling          = ${payload.feeling},
      log_notes        = ${payload.notes ?? null},
      completed_at     = NOW()
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
