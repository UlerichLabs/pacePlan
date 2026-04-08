import { SessionType, Environment } from '@paceplan/types';
import type { TrainingSession } from '@paceplan/types';

export const mockLongRun: TrainingSession = {
  id: 'mock-long-run-id',
  date: '2026-04-13',
  type: SessionType.LONG_RUN,
  targetDistance: 18,
  targetPace: '6:30',
  environment: Environment.OUTDOOR,
  status: 'planned',
  createdAt: '2026-04-08T10:00:00.000Z',
  updatedAt: '2026-04-08T10:00:00.000Z',
};

export const mockEasyRun: TrainingSession = {
  id: 'mock-easy-run-id',
  date: '2026-04-08',
  type: SessionType.EASY_RUN,
  targetDistance: 8,
  targetPace: '5:45',
  environment: Environment.OUTDOOR,
  status: 'done',
  log: {
    actualDistance: 8.1,
    actualPace: '5:40',
    heartRateAvg: 142,
    feeling: 4,
    completedAt: '2026-04-08T07:30:00.000Z',
  },
  createdAt: '2026-04-07T20:00:00.000Z',
  updatedAt: '2026-04-08T07:30:00.000Z',
};

export const mockStrength: TrainingSession = {
  id: 'mock-strength-id',
  date: '2026-04-09',
  type: SessionType.STRENGTH_LOWER,
  notes: 'Agachamento 4x12',
  status: 'planned',
  createdAt: '2026-04-07T20:00:00.000Z',
  updatedAt: '2026-04-07T20:00:00.000Z',
};

export const mockRest: TrainingSession = {
  id: 'mock-rest-id',
  date: '2026-04-11',
  type: SessionType.REST,
  status: 'planned',
  createdAt: '2026-04-07T20:00:00.000Z',
  updatedAt: '2026-04-07T20:00:00.000Z',
};
