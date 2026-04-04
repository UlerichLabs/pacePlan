import type { Macrocycle, Phase } from '@paceplan/types';

export const MACROCYCLE_MOCK: Macrocycle = {
  id: 'macro-001',
  name: 'Meia Maratona — Novembro 2026',
  goalDistance: 21,
  raceDate: '2026-11-30',
  startDate: '2026-04-01',
  isActive: true,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
};

export const PHASES_MOCK: Phase[] = [
  {
    id: 'phase-001',
    macrocycleId: 'macro-001',
    name: 'Construção de Base',
    objective: 'Consolidar 10 km de forma confortável e adaptar o corpo ao volume semanal',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    order: 1,
    longRunTarget: 10,
    weeklyVolumeTarget: 18,
  },
  {
    id: 'phase-002',
    macrocycleId: 'macro-001',
    name: 'Expansão de Volume',
    objective: 'Aumentar progressivamente o volume semanal e o longão',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    order: 2,
    longRunTarget: 15,
    weeklyVolumeTarget: 30,
  },
  {
    id: 'phase-003',
    macrocycleId: 'macro-001',
    name: 'Especificidade',
    objective: 'Treinar no ritmo alvo da prova e consolidar longões de 18–19 km',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    order: 3,
    longRunTarget: 19,
    weeklyVolumeTarget: 40,
  },
  {
    id: 'phase-004',
    macrocycleId: 'macro-001',
    name: 'Polimento (Taper)',
    objective: 'Reduzir volume mantendo intensidade, chegar fresco para a prova',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    order: 4,
    longRunTarget: 8,
    weeklyVolumeTarget: 12,
  },
];
