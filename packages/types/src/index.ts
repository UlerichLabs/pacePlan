// ─── Session Types ────────────────────────────────────────────────────────────

export enum SessionType {
  EASY_RUN = "EASY_RUN",
  QUALITY_RUN = "QUALITY_RUN",
  LONG_RUN = "LONG_RUN",
  PACE_RUN = "PACE_RUN",
  RECOVERY_RUN = "RECOVERY_RUN",
  RACE = "RACE",
  STRENGTH_LOWER = "STRENGTH_LOWER",
  STRENGTH_UPPER = "STRENGTH_UPPER",
  MOBILITY = "MOBILITY",
  REST = "REST",
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  [SessionType.EASY_RUN]: "Easy Run",
  [SessionType.QUALITY_RUN]: "Quality Run",
  [SessionType.LONG_RUN]: "Long Run",
  [SessionType.PACE_RUN]: "Pace Run",
  [SessionType.RECOVERY_RUN]: "Recovery Run",
  [SessionType.RACE]: "Race",
  [SessionType.STRENGTH_LOWER]: "Força — Inferiores",
  [SessionType.STRENGTH_UPPER]: "Força — Superiores",
  [SessionType.MOBILITY]: "Mobilidade",
  [SessionType.REST]: "Descanso",
};

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  [SessionType.EASY_RUN]: "#22c55e",
  [SessionType.QUALITY_RUN]: "#f97316",
  [SessionType.LONG_RUN]: "#8b5cf6",
  [SessionType.PACE_RUN]: "#ec4899",
  [SessionType.RECOVERY_RUN]: "#06b6d4",
  [SessionType.RACE]: "#eab308",
  [SessionType.STRENGTH_LOWER]: "#6366f1",
  [SessionType.STRENGTH_UPPER]: "#818cf8",
  [SessionType.MOBILITY]: "#64748b",
  [SessionType.REST]: "#334155",
};

export const RUNNING_TYPES: SessionType[] = [
  SessionType.EASY_RUN,
  SessionType.QUALITY_RUN,
  SessionType.LONG_RUN,
  SessionType.PACE_RUN,
  SessionType.RECOVERY_RUN,
  SessionType.RACE,
];

export const STRENGTH_TYPES: SessionType[] = [
  SessionType.STRENGTH_LOWER,
  SessionType.STRENGTH_UPPER,
];

// ─── Environment ──────────────────────────────────────────────────────────────

export enum Environment {
  TREADMILL = "TREADMILL",
  OUTDOOR = "OUTDOOR",
}

// ─── Session Status ───────────────────────────────────────────────────────────

export type SessionStatus = "planned" | "done" | "skipped";

// ─── Feeling Scale ────────────────────────────────────────────────────────────

export type FeelingScale = 1 | 2 | 3 | 4 | 5;

export const FEELING_LABELS: Record<FeelingScale, string> = {
  1: "Muito difícil",
  2: "Difícil",
  3: "OK",
  4: "Bem",
  5: "Ótimo",
};

// ─── Session Log ──────────────────────────────────────────────────────────────

export interface SessionLog {
  actualDistance?: number | undefined;
  actualDuration?: number | undefined;
  actualPace?: string | undefined;
  heartRateAvg?: number | undefined;
  heartRateMax?: number | undefined;
  feeling: FeelingScale;
  notes?: string | undefined;
  completedAt: string;
}

// ─── Training Session ─────────────────────────────────────────────────────────

export interface TrainingSession {
  id: string;
  date: string;
  type: SessionType;
  targetDistance?: number | undefined;
  targetDuration?: number | undefined;
  targetPace?: string | undefined;
  environment?: Environment | undefined;
  notes?: string | undefined;
  status: SessionStatus;
  log?: SessionLog | undefined;
  createdAt: string;
  updatedAt: string;
}

// ─── Macrocycle ───────────────────────────────────────────────────────────────

export interface Macrocycle {
  id: string;
  name: string;
  goalDistance: number;
  raceDate: string;
  startDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Phase ────────────────────────────────────────────────────────────────────

export interface Phase {
  id: string;
  macrocycleId: string;
  name: string;
  objective: string;
  startDate: string;
  endDate: string;
  order: number;
  longRunTarget?: number | undefined;
  weeklyVolumeTarget?: number | undefined;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateSessionPayload {
  date: string;
  type: SessionType;
  targetDistance?: number | undefined;
  targetDuration?: number | undefined;
  targetPace?: string | undefined;
  environment?: Environment | undefined;
  notes?: string | undefined;
}

export interface UpdateSessionPayload {
  date?: string | undefined;
  type?: SessionType | undefined;
  targetDistance?: number | undefined;
  targetDuration?: number | undefined;
  targetPace?: string | undefined;
  environment?: Environment | undefined;
  notes?: string | undefined;
}

export interface LogSessionPayload {
  actualDistance?: number | undefined;
  actualDuration?: number | undefined;
  actualPace?: string | undefined;
  heartRateAvg?: number | undefined;
  heartRateMax?: number | undefined;
  feeling: FeelingScale;
  notes?: string | undefined;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  message?: string | undefined;
}

export interface ApiError {
  error: string;
  code: string;
  statusCode: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Dashboard / Stats ────────────────────────────────────────────────────────

export interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  totalPlanned: number;
  totalCompleted: number;
  distancePlanned: number;
  distanceCompleted: number;
  sessionCount: number;
}

export interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  weeklyKm: number;
  monthlyKm: number;
  monthlySessionCount: number;
  weeklyVolume: WeekSummary[];
}
