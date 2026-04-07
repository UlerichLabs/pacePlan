import type { CSSProperties } from 'react';
import { Activity, CalendarDays, TrendingUp, Zap } from 'lucide-react';

const LABEL_KM_SEMANA = 'KMs corrida esta semana';
const LABEL_META_KM = 'meta';
const LABEL_ULTIMO_LONGAO = 'Último longão';
const LABEL_META_ERA = 'meta era';
const LABEL_STREAK = 'dias seguidos';
const LABEL_TREINOS_FEITOS = 'treinos feitos';
const LABEL_ESTA_SEMANA = 'esta semana';

const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.065)',
  border: '1px solid rgba(255,255,255,0.10)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 14,
};

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
      <div style={{ ...GLASS, padding: '14px 12px' }}>
        <Activity size={14} color="#22c55e" style={{ marginBottom: 8, opacity: 0.8 }} />
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: '#22c55e', marginBottom: 2 }}>
          {weeklyRunKm.toFixed(1)}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-hint)', fontWeight: 500, letterSpacing: '.02em', marginBottom: 2 }}>
          {LABEL_KM_SEMANA}
        </div>
        {phaseTarget > 0 && (
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
            {LABEL_META_KM} {phaseTarget} km
          </div>
        )}
      </div>

      <div style={{ ...GLASS, padding: '14px 12px' }}>
        <TrendingUp size={14} color="#8b5cf6" style={{ marginBottom: 8, opacity: 0.8 }} />
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: '#8b5cf6', marginBottom: 2 }}>
          {lastLongRun.toFixed(1)}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-hint)', fontWeight: 500, letterSpacing: '.02em', marginBottom: 2 }}>
          {LABEL_ULTIMO_LONGAO}
        </div>
        {longRunTarget > 0 && (
          <div style={{ fontSize: 9, color: longRunDelta >= 0 ? '#4ade80' : '#f87171' }}>
            {LABEL_META_ERA} {longRunTarget} km {longRunDelta >= 0 ? '✓' : '↓'}
          </div>
        )}
      </div>

      <div style={{ ...GLASS, padding: '14px 12px' }}>
        <Zap size={14} color="#eab308" style={{ marginBottom: 8, opacity: 0.8 }} />
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: '#eab308', marginBottom: 2 }}>
          {streak}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-hint)', fontWeight: 500, letterSpacing: '.02em' }}>
          {LABEL_STREAK}
        </div>
      </div>

      <div style={{ ...GLASS, padding: '14px 12px' }}>
        <CalendarDays size={14} color="#6366f1" style={{ marginBottom: 8, opacity: 0.8 }} />
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: '#818cf8', marginBottom: 2 }}>
          {done}/{total}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-hint)', fontWeight: 500, letterSpacing: '.02em', marginBottom: 2 }}>
          {LABEL_TREINOS_FEITOS}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          {LABEL_ESTA_SEMANA}
        </div>
      </div>
    </div>
  );
}
