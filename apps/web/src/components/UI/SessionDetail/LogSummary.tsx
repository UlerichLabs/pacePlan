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
      <div className="glass rounded-card overflow-hidden border-success/18">
        <div className="px-3.5 py-1">
          {withDist && (
            <>
              <div className="flex justify-between items-center py-2.5 border-b border-[--border-subtle]">
                <span className="text-sm text-[--text-muted]">{LABEL_DISTANCIA_REAL}</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-foreground">
                    {log.actualDistance != null ? formatDistance(log.actualDistance) : '—'}
                  </span>
                  {session.targetDistance != null && log.actualDistance != null && (() => {
                    const diff = log.actualDistance - session.targetDistance;
                    const pos = diff >= 0;
                    return <DeltaBadge text={`${pos ? '+' : '−'}${Math.abs(diff).toFixed(1)} km`} positive={pos} />;
                  })()}
                </div>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-[--border-subtle]">
                <span className="text-sm text-[--text-muted]">{LABEL_PACE_REAL}</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-foreground">
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

          <div className="flex justify-between items-center py-2.5 border-b border-[--border-subtle]">
            <span className="text-sm text-[--text-muted]">{LABEL_SENSACAO}</span>
            <FeelingCircles feeling={log.feeling} />
          </div>

          {log.notes != null && log.notes !== '' && (
            <div className="py-2.5 border-b border-[--border-subtle]">
              <span className="text-[11px] text-[--text-hint] uppercase tracking-[.06em] font-semibold">
                {LABEL_NOTAS}
              </span>
              <p className="text-sm text-[--text-secondary] mt-1 leading-relaxed">
                {log.notes}
              </p>
            </div>
          )}

          <div className="py-2.5">
            <span className="text-xs text-[--text-hint]">
              {LABEL_CONCLUSAO}: {formatCompletedAt(log.completedAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
