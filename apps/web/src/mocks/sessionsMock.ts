import { Environment, SessionType } from '@paceplan/types';
import type { TrainingSession } from '@paceplan/types';

const TODAY = '2026-04-04';
const MON = '2026-03-30';
const TUE = '2026-03-31';
const WED = '2026-04-01';
const THU = '2026-04-02';
const FRI = '2026-04-03';
const SAT = '2026-04-04';
const SUN = '2026-04-05';

export const CURRENT_WEEK_SESSIONS: TrainingSession[] = [
  {
    id: 'sess-001',
    date: MON,
    type: SessionType.STRENGTH_LOWER,
    notes: 'Agachamento 4x12, Leg Press 3x15, Panturrilha 3x20',
    status: 'done',
    log: {
      actualDuration: 55,
      feeling: 4,
      notes: 'Boa sessão, pernas responderam bem',
      completedAt: `${MON}T19:00:00Z`,
    },
    createdAt: `${MON}T00:00:00Z`,
    updatedAt: `${MON}T19:30:00Z`,
  },
  {
    id: 'sess-002',
    date: TUE,
    type: SessionType.EASY_RUN,
    targetDistance: 5,
    targetPace: '6:30',
    environment: Environment.TREADMILL,
    status: 'done',
    log: {
      actualDistance: 5.1,
      actualPace: '6:28',
      feeling: 4,
      completedAt: `${TUE}T07:30:00Z`,
    },
    createdAt: `${TUE}T00:00:00Z`,
    updatedAt: `${TUE}T08:00:00Z`,
  },
  {
    id: 'sess-003',
    date: WED,
    type: SessionType.STRENGTH_UPPER,
    notes: 'Costas, peito, abdômen, lombar',
    status: 'done',
    log: {
      actualDuration: 50,
      feeling: 3,
      notes: 'Cansado mas completou tudo',
      completedAt: `${WED}T19:30:00Z`,
    },
    createdAt: `${WED}T00:00:00Z`,
    updatedAt: `${WED}T20:00:00Z`,
  },
  {
    id: 'sess-004',
    date: THU,
    type: SessionType.QUALITY_RUN,
    targetDistance: 5,
    targetPace: '5:50',
    environment: Environment.TREADMILL,
    status: 'done',
    log: {
      actualDistance: 5.0,
      actualPace: '5:48',
      heartRateAvg: 158,
      heartRateMax: 172,
      feeling: 4,
      completedAt: `${THU}T07:30:00Z`,
    },
    createdAt: `${THU}T00:00:00Z`,
    updatedAt: `${THU}T08:00:00Z`,
  },
  {
    id: 'sess-005',
    date: FRI,
    type: SessionType.MOBILITY,
    targetDuration: 30,
    status: 'done',
    log: {
      actualDuration: 35,
      feeling: 5,
      notes: 'Mobilidade de quadril e tornozelo',
      completedAt: `${FRI}T08:00:00Z`,
    },
    createdAt: `${FRI}T00:00:00Z`,
    updatedAt: `${FRI}T08:40:00Z`,
  },
  {
    id: 'sess-006',
    date: SAT,
    type: SessionType.REST,
    status: 'planned',
    createdAt: `${SAT}T00:00:00Z`,
    updatedAt: `${SAT}T00:00:00Z`,
  },
  {
    id: 'sess-007',
    date: SUN,
    type: SessionType.LONG_RUN,
    targetDistance: 8,
    targetPace: '6:45',
    environment: Environment.OUTDOOR,
    status: 'done',
    log: {
      actualDistance: 8.2,
      actualPace: '6:40',
      heartRateAvg: 148,
      heartRateMax: 165,
      feeling: 4,
      notes: 'Subida de Petrópolis, ótimo dia',
      completedAt: `${SUN}T07:00:00Z`,
    },
    createdAt: `${SUN}T00:00:00Z`,
    updatedAt: `${SUN}T08:00:00Z`,
  },
];

export const LONG_RUN_HISTORY: { week: string; km: number }[] = [
  { week: 'S1', km: 6.0 },
  { week: 'S2', km: 6.5 },
  { week: 'S3', km: 7.0 },
  { week: 'S4', km: 7.5 },
  { week: 'S5', km: 8.0 },
  { week: 'S6', km: 8.2 },
];

export const WEEKLY_VOLUME_HISTORY: { week: string; km: number; isCurrent: boolean }[] = [
  { week: 'S1', km: 5.0, isCurrent: false },
  { week: 'S2', km: 8.0, isCurrent: false },
  { week: 'S3', km: 10.5, isCurrent: false },
  { week: 'S4', km: 12.0, isCurrent: false },
  { week: 'S5', km: 14.5, isCurrent: false },
  { week: 'S6', km: 16.0, isCurrent: false },
  { week: 'S7', km: 13.0, isCurrent: false },
  { week: 'S8', km: 18.3, isCurrent: true },
];

export const MOCK_TODAY = TODAY;

export const STREAK_DAYS_14: { date: string; type: 'run' | 'strength' | 'rest' | 'empty' }[] = [
  { date: '2026-03-22', type: 'run' },
  { date: '2026-03-23', type: 'strength' },
  { date: '2026-03-24', type: 'strength' },
  { date: '2026-03-25', type: 'run' },
  { date: '2026-03-26', type: 'rest' },
  { date: '2026-03-27', type: 'run' },
  { date: '2026-03-28', type: 'rest' },
  { date: '2026-03-29', type: 'run' },
  { date: '2026-03-30', type: 'strength' },
  { date: '2026-03-31', type: 'run' },
  { date: '2026-04-01', type: 'strength' },
  { date: '2026-04-02', type: 'run' },
  { date: '2026-04-03', type: 'rest' },
  { date: '2026-04-04', type: 'rest' },
];
