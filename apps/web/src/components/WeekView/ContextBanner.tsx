import type { ActiveContext } from '../../services/macrocycleService';

const CODE_NO_CURRENT_PHASE = '200.010';

const LABEL_FASE = 'FASE';
const LABEL_SEMANA = 'SEMANA';
const LABEL_DE = 'DE';
const LABEL_TRANSICAO = 'Semana de Transição';
const LABEL_LONG_RUN = 'Long run alvo';
const LABEL_VOLUME = 'Volume semanal';
const LABEL_KM = 'km';

interface Props {
  context: ActiveContext | null;
  responseCode: string | null;
  loading: boolean;
}

function getPhaseProgressPct(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

export function ContextBanner({ context, responseCode, loading }: Props) {
  if (loading || !context) return null;

  const { macrocycle, currentPhase, progress } = context;

  if (responseCode === CODE_NO_CURRENT_PHASE || !currentPhase || !progress) {
    return (
      <div className="px-4 py-[11px] shrink-0 bg-accent/70 border-b border-primary/15">
        <div className="text-[10px] font-bold tracking-[.08em] uppercase text-primary-subtle mb-0.5">
          {LABEL_TRANSICAO}
        </div>
        <div className="text-xs text-[--text-muted]">
          {macrocycle.goalDistance} {LABEL_KM} · {macrocycle.raceDate}
        </div>
      </div>
    );
  }

  const progressPct = getPhaseProgressPct(currentPhase.startDate, currentPhase.endDate);
  const hasTargets = currentPhase.weeklyVolumeTarget != null || currentPhase.longRunTarget != null;

  return (
    <div className="px-4 py-3 border-b border-[--border-subtle] bg-[--surface] shrink-0">
      <div className="text-[10px] font-bold tracking-[.08em] uppercase text-primary-subtle mb-[5px]">
        {LABEL_FASE} {currentPhase.order} · {LABEL_SEMANA} {progress.currentWeekNumber} {LABEL_DE} {progress.totalWeeksInPhase}
      </div>
      <div className={`text-[13px] font-semibold text-foreground ${hasTargets ? 'mb-1' : 'mb-2'}`}>
        {currentPhase.name}
      </div>
      {hasTargets && (
        <div className="flex gap-3 mb-2">
          {currentPhase.weeklyVolumeTarget != null && (
            <span className="text-[11px] text-[--text-muted]">
              {LABEL_VOLUME}:{' '}
              <strong className="text-[--text-secondary]">
                {currentPhase.weeklyVolumeTarget} {LABEL_KM}
              </strong>
            </span>
          )}
          {currentPhase.longRunTarget != null && (
            <span className="text-[11px] text-[--text-muted]">
              {LABEL_LONG_RUN}:{' '}
              <strong className="text-[--text-secondary]">
                {currentPhase.longRunTarget} {LABEL_KM}
              </strong>
            </span>
          )}
        </div>
      )}
      <div className="progress-track">
        <div
          className="progress-bar w-[--progress]"
          style={{ '--progress': `${progressPct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
