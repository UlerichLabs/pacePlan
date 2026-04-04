import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bike,
  Moon,
  Mountain,
  Timer,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { SESSION_TYPE_COLORS, SESSION_TYPE_LABELS, SessionType } from '@paceplan/types';

export const SESSION_ICONS: Record<SessionType, LucideIcon> = {
  [SessionType.EASY_RUN]:       Activity,
  [SessionType.TEMPO_RUN]:      Timer,
  [SessionType.LONG_RUN]:       TrendingUp,
  [SessionType.INTERVAL]:       Zap,
  [SessionType.HILL_REPS]:      Mountain,
  [SessionType.RACE]:           Trophy,
  [SessionType.REST_DAY]:       Moon,
  [SessionType.CROSS_TRAINING]: Bike,
};

export function getTypeColor(type: SessionType): string {
  return SESSION_TYPE_COLORS[type].toLowerCase();
}

export function getTypeLabel(type: SessionType): string {
  return SESSION_TYPE_LABELS[type];
}

export function hasDistance(type: SessionType): boolean {
  return type !== SessionType.REST_DAY;
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
