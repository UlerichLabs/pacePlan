-- Migration: 001_initial_schema
-- PacePlan - schema inicial
-- Execução: psql $DATABASE_URL -f 001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enum: session_type ───────────────────────────────────────────────────────

CREATE TYPE session_type AS ENUM (
  'EASY_RUN',
  'TEMPO_RUN',
  'LONG_RUN',
  'INTERVAL',
  'HILL_REPS',
  'RACE',
  'REST_DAY',
  'CROSS_TRAINING'
);

-- ─── Enum: session_status ─────────────────────────────────────────────────────

CREATE TYPE session_status AS ENUM (
  'planned',
  'done',
  'skipped'
);

-- ─── Table: training_sessions ─────────────────────────────────────────────────

CREATE TABLE training_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date             DATE NOT NULL,
  type             session_type NOT NULL,
  target_distance  NUMERIC(6, 2),
  target_pace      VARCHAR(6),                      -- formato MM:SS
  notes            TEXT,
  status           session_status NOT NULL DEFAULT 'planned',

  -- log de execução (null se não concluído)
  actual_distance  NUMERIC(6, 2),
  actual_pace      VARCHAR(6),
  feeling          SMALLINT CHECK (feeling BETWEEN 1 AND 5),
  log_notes        TEXT,
  completed_at     TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table: training_cycles ───────────────────────────────────────────────────

CREATE TABLE training_cycles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  goal        TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_dates CHECK (end_date > start_date)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_sessions_date ON training_sessions(date);
CREATE INDEX idx_sessions_status ON training_sessions(status);
CREATE INDEX idx_sessions_type ON training_sessions(type);
CREATE INDEX idx_sessions_date_status ON training_sessions(date, status);

-- ─── Function: updated_at trigger ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cycles_updated_at
  BEFORE UPDATE ON training_cycles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
