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
      <div style={{
        padding: '11px 16px', flexShrink: 0,
        background: 'rgba(99,102,241,.07)',
        borderBottom: '1px solid rgba(99,102,241,.15)',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
          textTransform: 'uppercase', color: '#818cf8', marginBottom: 2,
        }}>
          {LABEL_TRANSICAO}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {macrocycle.goalDistance} {LABEL_KM} · {macrocycle.raceDate}
        </div>
      </div>
    );
  }

  const progressPct = getPhaseProgressPct(currentPhase.startDate, currentPhase.endDate);
  const hasTargets = currentPhase.weeklyVolumeTarget != null || currentPhase.longRunTarget != null;

  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      background: 'rgba(255,255,255,.03)',
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
        textTransform: 'uppercase', color: '#818cf8', marginBottom: 5,
      }}>
        {LABEL_FASE} {currentPhase.order} · {LABEL_SEMANA} {progress.currentWeekNumber} {LABEL_DE} {progress.totalWeeksInPhase}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: hasTargets ? 4 : 8 }}>
        {currentPhase.name}
      </div>
      {hasTargets && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {currentPhase.weeklyVolumeTarget != null && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {LABEL_VOLUME}:{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>
                {currentPhase.weeklyVolumeTarget} {LABEL_KM}
              </strong>
            </span>
          )}
          {currentPhase.longRunTarget != null && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {LABEL_LONG_RUN}:{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>
                {currentPhase.longRunTarget} {LABEL_KM}
              </strong>
            </span>
          )}
        </div>
      )}
      <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <div style={{
          width: `${progressPct}%`, height: '100%', borderRadius: 3,
          background: 'linear-gradient(90deg, #6366f1, #818cf8)',
        }} />
      </div>
    </div>
  );
}
