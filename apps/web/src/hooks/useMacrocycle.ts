import { useCallback, useEffect, useState } from 'react';
import type { Macrocycle, Phase } from '@paceplan/types';
import { macrocycleService } from '../services/macrocycleService';

export interface MacrocycleContext {
  macrocycle: Macrocycle | null;
  phases: Phase[];
  currentPhase: Phase | null;
  weekInPhase: number;
  totalWeeksInPhase: number;
  weeksToRace: number;
  phaseProgressPct: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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
  const [macrocycle, setMacrocycle] = useState<Macrocycle | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMacrocycle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await macrocycleService.getActive();
      if (data) {
        setMacrocycle(data.macrocycle);
        setPhases(data.phases);
      } else {
        setMacrocycle(null);
        setPhases([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar macrociclo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMacrocycle();
  }, [fetchMacrocycle]);

  const today = new Date().toISOString().slice(0, 10);
  const currentPhase = macrocycle ? getCurrentPhase(phases, today) : null;
  const weekInPhase = currentPhase ? getWeekNumberInPhase(currentPhase, today) : 0;
  const totalWeeksInPhase = currentPhase ? getTotalWeeksInPhase(currentPhase) : 0;
  const weeksToRace = macrocycle ? getWeeksToRace(macrocycle.raceDate, today) : 0;
  const phaseProgressPct = currentPhase ? getPhaseProgressPct(currentPhase, today) : 0;

  return {
    macrocycle,
    phases,
    currentPhase,
    weekInPhase,
    totalWeeksInPhase,
    weeksToRace,
    phaseProgressPct,
    loading,
    error,
    refetch: fetchMacrocycle,
  };
}
