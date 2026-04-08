import { Activity, CalendarDays, TrendingUp, Zap } from 'lucide-react';

const LABEL_KM_SEMANA = 'KMs corrida esta semana';
const LABEL_META_KM = 'meta';
const LABEL_ULTIMO_LONGAO = 'Último longão';
const LABEL_META_ERA = 'meta era';
const LABEL_STREAK = 'dias seguidos';
const LABEL_TREINOS_FEITOS = 'treinos feitos';
const LABEL_ESTA_SEMANA = 'esta semana';

export interface KPIBannerProps {
  weeklyRunKm: number;
  phaseTarget: number;
  lastLongRun: number;
  longRunTarget: number;
  longRunDelta: number;
  streak: number;
  done: number;
  total: number;
}

export function KPIBanner({
  weeklyRunKm,
  phaseTarget,
  lastLongRun,
  longRunTarget,
  longRunDelta,
  streak,
  done,
  total,
}: KPIBannerProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 mb-3">
      <div className="glass rounded-card p-3">
        <Activity size={14} className="text-success mb-2 opacity-80" />
        <div className="text-[22px] font-bold tracking-tight text-success mb-0.5">
          {weeklyRunKm.toFixed(1)}
        </div>
        <div className="text-[9px] text-[--text-hint] font-medium tracking-[.02em] mb-0.5">
          {LABEL_KM_SEMANA}
        </div>
        {phaseTarget > 0 && (
          <div className="text-[9px] text-[--text-muted]">
            {LABEL_META_KM} {phaseTarget} km
          </div>
        )}
      </div>

      <div className="glass rounded-card p-3">
        <TrendingUp size={14} className="text-violet mb-2 opacity-80" />
        <div className="text-[22px] font-bold tracking-tight text-violet mb-0.5">
          {lastLongRun.toFixed(1)}
        </div>
        <div className="text-[9px] text-[--text-hint] font-medium tracking-[.02em] mb-0.5">
          {LABEL_ULTIMO_LONGAO}
        </div>
        {longRunTarget > 0 && (
          <div className={`text-[9px] ${longRunDelta >= 0 ? 'text-success-fg' : 'text-destructive'}`}>
            {LABEL_META_ERA} {longRunTarget} km {longRunDelta >= 0 ? '✓' : '↓'}
          </div>
        )}
      </div>

      <div className="glass rounded-card p-3">
        <Zap size={14} className="text-warning-fg mb-2 opacity-80" />
        <div className="text-[22px] font-bold tracking-tight text-warning-fg mb-0.5">
          {streak}
        </div>
        <div className="text-[9px] text-[--text-hint] font-medium tracking-[.02em]">
          {LABEL_STREAK}
        </div>
      </div>

      <div className="glass rounded-card p-3">
        <CalendarDays size={14} className="text-primary mb-2 opacity-80" />
        <div className="text-[22px] font-bold tracking-tight text-primary-subtle mb-0.5">
          {done}/{total}
        </div>
        <div className="text-[9px] text-[--text-hint] font-medium tracking-[.02em] mb-0.5">
          {LABEL_TREINOS_FEITOS}
        </div>
        <div className="text-[9px] text-[--text-muted]">
          {LABEL_ESTA_SEMANA}
        </div>
      </div>
    </div>
  );
}
