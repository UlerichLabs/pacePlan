import type { Macrocycle, Phase } from '@paceplan/types';
import { MACROCYCLE_MOCK, PHASES_MOCK } from '../mocks/macrocycleMock';

export interface MacrocycleContext {
  macrocycle: Macrocycle;
  phases: Phase[];
  currentPhase: Phase | null;
  weekInPhase: number;
  totalWeeksInPhase: number;
  weeksToRace: number;
  phaseProgressPct: number;
}

function getCurrentPhase(phases: Phase[], today: string): Phase | null {
  return phases.find((p) => p.startDate <= today && p.endDate >= today) ?? null;
}

function getWeekNumberInPhase(phase: Phase, today: string): number {
  const start = new Date(phase.startDate);
  const current = new Date(today);
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

function getTotalWeeksInPhase(phase: Phase): number {
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}

function getWeeksToRace(raceDate: string, today: string): number {
  const race = new Date(raceDate);
  const now = new Date(today);
  const diffDays = Math.floor((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.ceil(diffDays / 7));
}

function getPhaseProgressPct(phase: Phase, today: string): number {
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  const current = new Date(today);
  const total = end.getTime() - start.getTime();
  const elapsed = current.getTime() - start.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function useMacrocycle(): MacrocycleContext {
  const today = new Date().toISOString().slice(0, 10);
  const macrocycle = MACROCYCLE_MOCK;
  const phases = PHASES_MOCK;
  const currentPhase = getCurrentPhase(phases, today);

  const weekInPhase = currentPhase ? getWeekNumberInPhase(currentPhase, today) : 1;
  const totalWeeksInPhase = currentPhase ? getTotalWeeksInPhase(currentPhase) : 0;
  const weeksToRace = getWeeksToRace(macrocycle.raceDate, today);
  const phaseProgressPct = currentPhase ? getPhaseProgressPct(currentPhase, today) : 0;

  return {
    macrocycle,
    phases,
    currentPhase,
    weekInPhase,
    totalWeeksInPhase,
    weeksToRace,
    phaseProgressPct,
  };
}
