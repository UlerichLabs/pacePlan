import { type CSSProperties, useState } from 'react';
import { SessionType } from '@paceplan/types';
import type { TrainingSession } from '@paceplan/types';
import { useMacrocycle } from '../hooks/useMacrocycle';
import { useSessions } from '../hooks/useSessions';
import { isRunningSession, isStrengthSession } from '../services/sessionUtils';
import { KPIBanner } from '../components/UI/Dashboard/KPIBanner';
import { LongRunProgressChart } from '../components/UI/Dashboard/LongRunProgressChart';
import { WeeklyVolumeChart } from '../components/UI/Dashboard/WeeklyVolumeChart';
import { StreakDots, type StreakDayType } from '../components/UI/Dashboard/StreakDots';
import { VolumeTypeBar } from '../components/UI/Dashboard/VolumeTypeBar';

const LABEL_PHASE_TAG = 'FASE';
const LABEL_SEMANA = 'SEMANA';
const LABEL_DE = 'DE';
const LABEL_WEEKS_TO_RACE = 'semanas para a prova';
const LABEL_STREAK = 'dias seguidos';
const LABEL_PROGR_LONGAO = 'Progressão do longão';
const LABEL_META_FASE = 'meta fase:';
const LABEL_REALIZADO = 'realizado';
const LABEL_META = 'meta fase';
const LABEL_STREAK_CONSIST = 'Streak de consistência';
const LABEL_CORRIDA = 'Corrida';
const LABEL_FORCA = 'Força';
const LABEL_MOBILIDADE = 'Mobilidade';
const LABEL_VOLUME_SEMANA = 'Volume — semana atual';
const LABEL_VOLUME_CHART = 'Volume de corrida — 8 semanas';
const LABEL_META_SEMANAL = 'meta semanal';
const LABEL_CARREGANDO = 'Carregando...';

const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.065)',
  border: '1px solid rgba(255,255,255,0.10)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 14,
};

function getWeekMondayStr(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function computeWeeklyRunKm(sessions: TrainingSession[], weekStart: string, weekEnd: string): number {
  return sessions
    .filter(s => s.date >= weekStart && s.date <= weekEnd && s.status === 'done' && isRunningSession(s.type))
    .reduce((sum, s) => sum + (s.log?.actualDistance ?? 0), 0);
}

function computeLastLongRunKm(sessions: TrainingSession[]): number {
  const runs = sessions
    .filter(s => s.type === SessionType.LONG_RUN && s.status === 'done' && s.log?.actualDistance != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return runs[runs.length - 1]?.log?.actualDistance ?? 0;
}

function computeStreak(sessions: TrainingSession[], today: string): number {
  let streak = 0;
  const base = new Date(`${today}T00:00:00`);
  for (let i = 0; i < 60; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const daySessions = sessions.filter(s => s.date === dateStr);
    if (daySessions.length === 0) break;
    const counts = daySessions.some(s =>
      s.status === 'done' || (s.type === SessionType.REST && s.status !== 'skipped')
    );
    if (!counts) break;
    streak++;
  }
  return streak;
}

function computeSessionCount(sessions: TrainingSession[], weekStart: string, weekEnd: string): { done: number; total: number } {
  const week = sessions.filter(s => s.date >= weekStart && s.date <= weekEnd);
  return { done: week.filter(s => s.status === 'done').length, total: week.length };
}

function computeVolumeByType(sessions: TrainingSession[], weekStart: string, weekEnd: string): { run: number; strength: number; mobility: number } {
  const done = sessions.filter(s => s.date >= weekStart && s.date <= weekEnd && s.status === 'done');
  return {
    run:      done.filter(s => isRunningSession(s.type)).length,
    strength: done.filter(s => isStrengthSession(s.type)).length,
    mobility: done.filter(s => s.type === SessionType.MOBILITY).length,
  };
}

function buildVolumeChartData(sessions: TrainingSession[], currentWeekStart: string): { week: string; km: number; isCurrent: boolean }[] {
  return Array.from({ length: 8 }, (_, i) => {
    const offset = (7 - i) * 7;
    const wStart = addDays(currentWeekStart, -offset);
    const wEnd   = addDays(wStart, 6);
    const km = sessions
      .filter(s => s.date >= wStart && s.date <= wEnd && s.status === 'done' && isRunningSession(s.type))
      .reduce((sum, s) => sum + (s.log?.actualDistance ?? 0), 0);
    return { week: `S${i + 1}`, km, isCurrent: i === 7 };
  });
}

function buildLongRunChartData(sessions: TrainingSession[], currentWeekStart: string): { week: string; km: number }[] {
  const data: { week: string; km: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const offset = (7 - i) * 7;
    const wStart = addDays(currentWeekStart, -offset);
    const wEnd   = addDays(wStart, 6);
    const longRuns = sessions.filter(s =>
      s.date >= wStart && s.date <= wEnd &&
      s.type === SessionType.LONG_RUN && s.status === 'done' && s.log?.actualDistance != null
    );
    const km = longRuns.reduce((max, s) => Math.max(max, s.log?.actualDistance ?? 0), 0);
    if (km > 0) data.push({ week: `S${i + 1}`, km });
  }
  return data;
}



function buildStreakDots(sessions: TrainingSession[], today: string): { date: string; type: StreakDayType }[] {
  return Array.from({ length: 14 }, (_, i) => {
    const dateStr = addDays(today, -(13 - i));
    const day = sessions.filter(s => s.date === dateStr && s.status !== 'skipped');
    if (day.length === 0) return { date: dateStr, type: 'empty' as const };
    if (day.some(s => isRunningSession(s.type) && s.status === 'done')) return { date: dateStr, type: 'run' as const };
    if (day.some(s => isStrengthSession(s.type) && s.status === 'done')) return { date: dateStr, type: 'strength' as const };
    return { date: dateStr, type: 'rest' as const };
  });
}

export function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [currentWeekStart] = useState(() => getWeekMondayStr(new Date()));
  const [currentWeekEnd]   = useState(() => addDays(getWeekMondayStr(new Date()), 6));
  const [rangeStart]       = useState(() => addDays(getWeekMondayStr(new Date()), -49));

  const { currentPhase, weekInPhase, totalWeeksInPhase, weeksToRace, phaseProgressPct, loading: macroLoading } = useMacrocycle();
  const { sessions, loading: sessionsLoading } = useSessions(rangeStart, currentWeekEnd);

  const isLoading = macroLoading || sessionsLoading;

  const weeklyRunKm  = computeWeeklyRunKm(sessions, currentWeekStart, currentWeekEnd);
  const lastLongRun  = computeLastLongRunKm(sessions);
  const streak       = computeStreak(sessions, today);
  const { done, total } = computeSessionCount(sessions, currentWeekStart, currentWeekEnd);
  const volumeByType = computeVolumeByType(sessions, currentWeekStart, currentWeekEnd);
  const phaseTarget    = currentPhase?.weeklyVolumeTarget ?? 0;
  const longRunTarget  = currentPhase?.longRunTarget ?? 0;
  const longRunDelta   = lastLongRun - longRunTarget;
  const volumeMax      = Math.max(volumeByType.run, volumeByType.strength, volumeByType.mobility, 1);
  const volumeChartData   = buildVolumeChartData(sessions, currentWeekStart);
  const longRunChartData  = buildLongRunChartData(sessions, currentWeekStart);
  const streakDots        = buildStreakDots(sessions, today);
  const currentWeekVolume = volumeChartData.find(w => w.isCurrent)?.km ?? 0;

  if (isLoading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{LABEL_CARREGANDO}</span>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 16px 32px' }}>
      <div style={{ position: 'relative', minHeight: '100%' }}>

        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: '#6366f1', filter: 'blur(90px)', opacity: 0.14, top: -80, left: -60 }} />
          <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: '#8b5cf6', filter: 'blur(90px)', opacity: 0.12, bottom: 100, right: -50 }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: '#22c55e', filter: 'blur(80px)', opacity: 0.07, top: '45%', right: '15%' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {currentPhase && (
            <div style={{ ...GLASS, padding: '16px 18px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: '#818cf8', marginBottom: 6 }}>
                  {LABEL_PHASE_TAG} {currentPhase.order} · {LABEL_SEMANA} {weekInPhase} {LABEL_DE} {totalWeeksInPhase}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {currentPhase.order} — {currentPhase.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {currentPhase.objective}
                </div>
                <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${phaseProgressPct}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#a5b4fc', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {weeksToRace}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '.02em' }}>
                  {LABEL_WEEKS_TO_RACE}
                </div>
              </div>
            </div>
          )}

          <KPIBanner
            weeklyRunKm={weeklyRunKm}
            phaseTarget={phaseTarget}
            lastLongRun={lastLongRun}
            longRunTarget={longRunTarget}
            longRunDelta={longRunDelta}
            streak={streak}
            done={done}
            total={total}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ ...GLASS, padding: '16px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 12 }}>
                {LABEL_PROGR_LONGAO}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6', letterSpacing: '-.02em' }}>
                  {lastLongRun.toFixed(1)} km
                </span>
                {longRunTarget > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {LABEL_META_FASE} {longRunTarget} km
                    </div>
                    <div style={{ fontSize: 10, color: longRunDelta >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                      {longRunDelta >= 0 ? '+' : ''}{longRunDelta.toFixed(1)} km
                    </div>
                  </div>
                )}
              </div>
              <LongRunProgressChart data={longRunChartData} phaseTarget={longRunTarget} />
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 16, height: 2, borderRadius: 1, background: '#8b5cf6' }} />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{LABEL_REALIZADO}</span>
                </div>
                {longRunTarget > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 16, height: 0, borderTop: '2px dashed #6366f1', opacity: 0.7 }} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{LABEL_META}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ ...GLASS, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 10 }}>
                  {LABEL_STREAK_CONSIST}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#eab308', letterSpacing: '-.03em' }}>
                    {streak}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{LABEL_STREAK}</span>
                </div>
                <StreakDots days={streakDots} />
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(34,197,94,0.5)' }} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>corrida</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(99,102,241,0.5)' }} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>força</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>descanso</span>
                  </div>
                </div>
              </div>

              <div style={{ ...GLASS, padding: '14px 16px', flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 12 }}>
                  {LABEL_VOLUME_SEMANA}
                </div>
                <VolumeTypeBar label={LABEL_CORRIDA}    count={volumeByType.run}      max={volumeMax} color="#22c55e" />
                <VolumeTypeBar label={LABEL_FORCA}      count={volumeByType.strength} max={volumeMax} color="#6366f1" />
                <VolumeTypeBar label={LABEL_MOBILIDADE} count={volumeByType.mobility} max={volumeMax} color="#64748b" />
              </div>
            </div>
          </div>

          <div style={{ ...GLASS, padding: '16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 10 }}>
              {LABEL_VOLUME_CHART}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#4ade80', letterSpacing: '-.02em' }}>
                {currentWeekVolume.toFixed(1)} km
              </span>
              {phaseTarget > 0 && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {LABEL_META_SEMANAL}: {phaseTarget} km
                </span>
              )}
            </div>
            <WeeklyVolumeChart data={volumeChartData} target={phaseTarget} />
          </div>

        </div>
      </div>
    </div>
  );
}
