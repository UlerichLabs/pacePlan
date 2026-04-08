import {
  Environment,
  RUNNING_TYPES,
  SESSION_TYPE_COLORS,
  SESSION_TYPE_LABELS,
  SessionType,
  STRENGTH_TYPES,
} from '@paceplan/types';
import type { Phase } from '@paceplan/types';

export function isRunningSession(type: SessionType): boolean {
  return RUNNING_TYPES.includes(type);
}

export function isStrengthSession(type: SessionType): boolean {
  return STRENGTH_TYPES.includes(type);
}

export function getTypeColor(type: SessionType): string {
  return SESSION_TYPE_COLORS[type];
}

export function getTypeLabel(type: SessionType): string {
  return SESSION_TYPE_LABELS[type];
}

export function hasDistance(type: SessionType): boolean {
  return isRunningSession(type);
}

export function getEnvironmentLabel(env: Environment): string {
  return env === Environment.TREADMILL ? 'Esteira' : 'Rua';
}

export function formatPace(pace: string): string {
  return `${pace}/km`;
}

export function formatDistance(km: number): string {
  return `${km} km`;
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function isToday(iso: string): boolean {
  return iso === new Date().toISOString().slice(0, 10);
}

export function parsePaceToSeconds(pace: string): number {
  const parts = pace.split(':');
  const mm = parseInt(parts[0] ?? '0', 10);
  const ss = parseInt(parts[1] ?? '0', 10);
  return mm * 60 + ss;
}

export function formatPaceDelta(actual: string, target: string): string {
  const delta = parsePaceToSeconds(actual) - parsePaceToSeconds(target);
  const abs = Math.abs(delta);
  const mm = Math.floor(abs / 60);
  const ss = abs % 60;
  const sign = delta <= 0 ? '−' : '+';
  return `${sign}${mm}:${ss.toString().padStart(2, '0')}/km`;
}

export function isPaceFaster(actual: string, target: string): boolean {
  return parsePaceToSeconds(actual) < parsePaceToSeconds(target);
}

export function getCurrentPhase(phases: Phase[], today: string): Phase | null {
  return phases.find((p) => p.startDate <= today && p.endDate >= today) ?? null;
}

export function getWeekNumberInPhase(phase: Phase, today: string): number {
  const start = new Date(phase.startDate);
  const current = new Date(today);
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

export function getTotalWeeksInPhase(phase: Phase): number {
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}

export function getWeeksToRace(raceDate: string, today: string): number {
  const race = new Date(raceDate);
  const now = new Date(today);
  const diffDays = Math.floor((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.ceil(diffDays / 7));
}

export function getPhaseProgressPct(phase: Phase, today: string): number {
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  const current = new Date(today);
  const total = end.getTime() - start.getTime();
  const elapsed = current.getTime() - start.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}
