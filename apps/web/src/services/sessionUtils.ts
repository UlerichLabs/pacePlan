import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Dumbbell,
  Gauge,
  Moon,
  PersonStanding,
  Timer,
  Trophy,
  TrendingUp,
  Wind,
} from 'lucide-react';
import {
  Environment,
  RUNNING_TYPES,
  SESSION_TYPE_COLORS,
  SESSION_TYPE_LABELS,
  SessionType,
  STRENGTH_TYPES,
} from '@paceplan/types';

export const SESSION_ICONS: Record<SessionType, LucideIcon> = {
  [SessionType.EASY_RUN]:       Activity,
  [SessionType.QUALITY_RUN]:    Timer,
  [SessionType.LONG_RUN]:       TrendingUp,
  [SessionType.PACE_RUN]:       Gauge,
  [SessionType.RECOVERY_RUN]:   Wind,
  [SessionType.RACE]:           Trophy,
  [SessionType.STRENGTH_LOWER]: Dumbbell,
  [SessionType.STRENGTH_UPPER]: Dumbbell,
  [SessionType.MOBILITY]:       PersonStanding,
  [SessionType.REST]:           Moon,
};

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
