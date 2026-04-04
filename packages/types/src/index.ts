// ─── Session Types ────────────────────────────────────────────────────────────

export enum SessionType {
  EASY_RUN = "EASY_RUN",
  TEMPO_RUN = "TEMPO_RUN",
  LONG_RUN = "LONG_RUN",
  INTERVAL = "INTERVAL",
  HILL_REPS = "HILL_REPS",
  RACE = "RACE",
  REST_DAY = "REST_DAY",
  CROSS_TRAINING = "CROSS_TRAINING",
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  [SessionType.EASY_RUN]: "Easy Run",
  [SessionType.TEMPO_RUN]: "Tempo Run",
  [SessionType.LONG_RUN]: "Long Run",
  [SessionType.INTERVAL]: "Interval",
  [SessionType.HILL_REPS]: "Hill Reps",
  [SessionType.RACE]: "Race",
  [SessionType.REST_DAY]: "Rest Day",
  [SessionType.CROSS_TRAINING]: "Cross Training",
};

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  [SessionType.EASY_RUN]: "#22C55E",
  [SessionType.TEMPO_RUN]: "#F97316",
  [SessionType.LONG_RUN]: "#8B5CF6",
  [SessionType.INTERVAL]: "#EF4444",
  [SessionType.HILL_REPS]: "#EAB308",
  [SessionType.RACE]: "#EC4899",
  [SessionType.REST_DAY]: "#6B7280",
  [SessionType.CROSS_TRAINING]: "#06B6D4",
};

export const SESSION_TYPES_WITH_DISTANCE: SessionType[] = [
  SessionType.EASY_RUN,
  SessionType.TEMPO_RUN,
  SessionType.LONG_RUN,
  SessionType.INTERVAL,
  SessionType.HILL_REPS,
  SessionType.RACE,
  SessionType.CROSS_TRAINING,
];

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
  actualDistance: number;
  actualPace: string;
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
  targetPace?: string | undefined;
  notes?: string | undefined;
  status: SessionStatus;
  log?: SessionLog | undefined;
  createdAt: string;
  updatedAt: string;
}

// ─── Training Cycle (Fase 2) ──────────────────────────────────────────────────

export interface TrainingCycle {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateSessionPayload {
  date: string;
  type: SessionType;
  targetDistance?: number | undefined;
  targetPace?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateSessionPayload {
  date?: string | undefined;
  type?: SessionType | undefined;
  targetDistance?: number | undefined;
  targetPace?: string | undefined;
  notes?: string | undefined;
}

export interface LogSessionPayload {
  actualDistance: number;
  actualPace: string;
  feeling: FeelingScale;
  notes?: string | undefined;
}

export interface CreateCyclePayload {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
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
