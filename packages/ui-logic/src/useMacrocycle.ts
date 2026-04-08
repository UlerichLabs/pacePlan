import { useQuery } from '@tanstack/react-query';
import type { Macrocycle, Phase } from '@paceplan/types';
import { macrocycleKeys } from '@paceplan/api-client';
import { macrocycleService } from '@paceplan/api-client';
import {
  getCurrentPhase,
  getPhaseProgressPct,
  getTotalWeeksInPhase,
  getWeekNumberInPhase,
  getWeeksToRace,
} from '@paceplan/utils';

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
  refetch: () => void;
}

export function useMacrocycle(): MacrocycleContext {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: macrocycleKeys.active(),
    queryFn: () => macrocycleService.getActive(),
  });

  const macrocycle = data?.macrocycle ?? null;
  const phases = data?.phases ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const currentPhase = macrocycle ? getCurrentPhase(phases, today) : null;
  const weekInPhase = currentPhase ? getWeekNumberInPhase(currentPhase, today) : 0;
  const totalWeeks = currentPhase ? getTotalWeeksInPhase(currentPhase) : 0;
  const weeksToRace = macrocycle ? getWeeksToRace(macrocycle.raceDate, today) : 0;
  const phaseProgressPct = currentPhase ? getPhaseProgressPct(currentPhase, today) : 0;

  return {
    macrocycle,
    phases,
    currentPhase,
    weekInPhase,
    totalWeeksInPhase: totalWeeks,
    weeksToRace,
    phaseProgressPct,
    loading: isPending,
    error: error?.message ?? null,
    refetch,
  };
}
