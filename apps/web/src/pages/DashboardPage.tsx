import { useState } from 'react';
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
      <div className="h-full flex items-center justify-center">
        <span className="text-sm text-[--text-muted]">{LABEL_CARREGANDO}</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 pt-4 pb-8">
      {currentPhase && (
        <div className="glass rounded-card px-[18px] py-4 mb-3 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-[.10em] uppercase text-primary-subtle mb-1.5">
              {LABEL_PHASE_TAG} {currentPhase.order} · {LABEL_SEMANA} {weekInPhase} {LABEL_DE} {totalWeeksInPhase}
            </div>
            <div className="text-base font-bold text-foreground mb-0.5">
              {currentPhase.order} — {currentPhase.name}
            </div>
            <div className="text-[11px] text-[--text-muted] mb-3">
              {currentPhase.objective}
            </div>
            <div className="progress-track">
              <div
                className="progress-bar w-[--progress]"
                style={{ '--progress': `${phaseProgressPct}%` } as React.CSSProperties}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[36px] font-extrabold text-primary-subtle tracking-tight leading-none">
              {weeksToRace}
            </div>
            <div className="text-[10px] text-[--text-muted] mt-1 tracking-[.02em]">
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

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="glass rounded-card p-4">
          <div className="text-[10px] font-semibold tracking-[.08em] uppercase text-[--text-hint] mb-3">
            {LABEL_PROGR_LONGAO}
          </div>
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-[22px] font-bold text-violet tracking-tight">
              {lastLongRun.toFixed(1)} km
            </span>
            {longRunTarget > 0 && (
              <div className="text-right">
                <div className="text-[10px] text-[--text-muted]">
                  {LABEL_META_FASE} {longRunTarget} km
                </div>
                <div className={`text-[10px] font-semibold ${longRunDelta >= 0 ? 'text-success-fg' : 'text-destructive'}`}>
                  {longRunDelta >= 0 ? '+' : ''}{longRunDelta.toFixed(1)} km
                </div>
              </div>
            )}
          </div>
          <LongRunProgressChart data={longRunChartData} phaseTarget={longRunTarget} />
          <div className="flex gap-3.5 mt-2">
            <div className="flex items-center gap-[5px]">
              <div className="w-4 h-0.5 rounded-sm bg-violet" />
              <span className="text-[9px] text-[--text-muted]">{LABEL_REALIZADO}</span>
            </div>
            {longRunTarget > 0 && (
              <div className="flex items-center gap-[5px]">
                <div className="w-4 border-t-2 border-dashed border-primary opacity-70" />
                <span className="text-[9px] text-[--text-muted]">{LABEL_META}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="glass rounded-card px-4 py-3.5">
            <div className="text-[10px] font-semibold tracking-[.08em] uppercase text-[--text-hint] mb-2.5">
              {LABEL_STREAK_CONSIST}
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-[28px] font-extrabold text-warning-fg tracking-tight">
                {streak}
              </span>
              <span className="text-[11px] text-[--text-muted]">{LABEL_STREAK}</span>
            </div>
            <StreakDots days={streakDots} />
            <div className="flex gap-2.5 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-success/50" />
                <span className="text-[9px] text-[--text-muted]">corrida</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-accent" />
                <span className="text-[9px] text-[--text-muted]">força</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-surface" />
                <span className="text-[9px] text-[--text-muted]">descanso</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-card px-4 py-3.5 flex-1">
            <div className="text-[10px] font-semibold tracking-[.08em] uppercase text-[--text-hint] mb-3">
              {LABEL_VOLUME_SEMANA}
            </div>
            <VolumeTypeBar label={LABEL_CORRIDA}    count={volumeByType.run}      max={volumeMax} color="var(--success)" />
            <VolumeTypeBar label={LABEL_FORCA}      count={volumeByType.strength} max={volumeMax} color="var(--primary)" />
            <VolumeTypeBar label={LABEL_MOBILIDADE} count={volumeByType.mobility} max={volumeMax} color="#64748b" />
          </div>
        </div>
      </div>

      <div className="glass rounded-card p-4">
        <div className="text-[10px] font-semibold tracking-[.08em] uppercase text-[--text-hint] mb-2.5">
          {LABEL_VOLUME_CHART}
        </div>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[20px] font-bold text-success-fg tracking-tight">
            {currentWeekVolume.toFixed(1)} km
          </span>
          {phaseTarget > 0 && (
            <span className="text-[10px] text-[--text-muted]">
              {LABEL_META_SEMANAL}: {phaseTarget} km
            </span>
          )}
        </div>
        <WeeklyVolumeChart data={volumeChartData} target={phaseTarget} />
      </div>
    </div>
  );
}
