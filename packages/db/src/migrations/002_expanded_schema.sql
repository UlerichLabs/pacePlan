-- Migration: 002_expanded_schema
-- Expande session_type, adiciona environment, novos campos e tabelas macrocycles/phases

-- ─── Novos valores no enum session_type ──────────────────────────────────────

ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'QUALITY_RUN';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'PACE_RUN';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'RECOVERY_RUN';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'STRENGTH_LOWER';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'STRENGTH_UPPER';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'MOBILITY';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'REST';

-- ─── Enum: environment ────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE environment AS ENUM ('TREADMILL', 'OUTDOOR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Novas colunas em training_sessions ──────────────────────────────────────

ALTER TABLE training_sessions
  ADD COLUMN IF NOT EXISTS environment      environment,
  ADD COLUMN IF NOT EXISTS target_duration  INTEGER,
  ADD COLUMN IF NOT EXISTS actual_duration  INTEGER,
  ADD COLUMN IF NOT EXISTS heart_rate_avg   SMALLINT,
  ADD COLUMN IF NOT EXISTS heart_rate_max   SMALLINT,
  ADD COLUMN IF NOT EXISTS ai_report        TEXT;

-- ─── Tabela macrocycles ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS macrocycles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(255) NOT NULL,
  goal_distance  NUMERIC(5,2) NOT NULL,
  race_date      DATE NOT NULL,
  start_date     DATE NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela phases ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS phases (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  macrocycle_id          UUID NOT NULL REFERENCES macrocycles(id) ON DELETE CASCADE,
  name                   VARCHAR(255) NOT NULL,
  objective              TEXT NOT NULL,
  start_date             DATE NOT NULL,
  end_date               DATE NOT NULL,
  order_index            SMALLINT NOT NULL,
  long_run_target        NUMERIC(5,2),
  weekly_volume_target   NUMERIC(5,2),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phases_macrocycle ON phases(macrocycle_id);
CREATE INDEX IF NOT EXISTS idx_phases_dates ON phases(start_date, end_date);

-- ─── Triggers updated_at ─────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_macrocycles_updated_at ON macrocycles;
CREATE TRIGGER trg_macrocycles_updated_at
  BEFORE UPDATE ON macrocycles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_phases_updated_at ON phases;
CREATE TRIGGER trg_phases_updated_at
  BEFORE UPDATE ON phases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
