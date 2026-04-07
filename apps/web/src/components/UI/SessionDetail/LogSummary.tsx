import type { CSSProperties } from 'react';
import type { SessionLog, TrainingSession } from '@paceplan/types';
import { SectionLabel } from './SectionLabel';
import { DeltaBadge } from './DeltaBadge';
import { MetaRow } from './MetaRow';
import { FeelingCircles } from './FeelingCircles';
import { formatDistance, formatPace, formatPaceDelta, isPaceFaster } from '../../../services/sessionUtils';

const SECTION_RESULTADO = 'Treino realizado';
const LABEL_DISTANCIA_REAL = 'Distância real';
const LABEL_PACE_REAL = 'Pace real';
const LABEL_BPM_AVG = 'BPM médio';
const LABEL_BPM_MAX = 'BPM máximo';
const LABEL_SENSACAO = 'Sensação';
const LABEL_NOTAS = 'Notas';
const LABEL_CONCLUSAO = 'Concluído em';

const glassCard: CSSProperties = {
  borderRadius: 14, overflow: 'hidden',
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};

function formatCompletedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export interface LogSummaryProps {
  session: TrainingSession;
  log: SessionLog;
  withDist: boolean;
}

export function LogSummary({ session, log, withDist }: LogSummaryProps) {
  return (
    <>
      <SectionLabel text={SECTION_RESULTADO} />
      <div style={{ ...glassCard, border: '1px solid rgba(34,197,94,.18)' }}>
        <div style={{ padding: '4px 14px 4px' }}>
          {withDist && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{LABEL_DISTANCIA_REAL}</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.actualDistance != null ? formatDistance(log.actualDistance) : '—'}
                  </span>
                  {session.targetDistance != null && log.actualDistance != null && (() => {
                    const diff = log.actualDistance - session.targetDistance;
                    const pos = diff >= 0;
                    return <DeltaBadge text={`${pos ? '+' : '−'}${Math.abs(diff).toFixed(1)} km`} positive={pos} />;
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{LABEL_PACE_REAL}</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.actualPace != null ? formatPace(log.actualPace) : '—'}
                  </span>
                  {session.targetPace != null && log.actualPace != null && (
                    <DeltaBadge
                      text={formatPaceDelta(log.actualPace, session.targetPace)}
                      positive={isPaceFaster(log.actualPace, session.targetPace)}
                    />
                  )}
                </div>
              </div>

              {log.heartRateAvg != null && (
                <MetaRow label={LABEL_BPM_AVG} value={`${log.heartRateAvg} bpm`} />
              )}
              {log.heartRateMax != null && (
                <MetaRow label={LABEL_BPM_MAX} value={`${log.heartRateMax} bpm`} />
              )}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{LABEL_SENSACAO}</span>
            <FeelingCircles feeling={log.feeling} />
          </div>

          {log.notes != null && log.notes !== '' && (
            <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                {LABEL_NOTAS}
              </span>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                {log.notes}
              </p>
            </div>
          )}

          <div style={{ padding: '10px 0' }}>
            <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>
              {LABEL_CONCLUSAO}: {formatCompletedAt(log.completedAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
