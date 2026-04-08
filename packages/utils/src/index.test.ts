import { describe, it, expect } from 'vitest';
import { SessionType, Environment } from '@paceplan/types';
import type { Phase } from '@paceplan/types';
import {
  isRunningSession,
  isStrengthSession,
  getTypeColor,
  getTypeLabel,
  hasDistance,
  getEnvironmentLabel,
  formatPace,
  formatDistance,
  parsePaceToSeconds,
  formatPaceDelta,
  isPaceFaster,
  getCurrentPhase,
  getWeekNumberInPhase,
  getTotalWeeksInPhase,
  getWeeksToRace,
  getPhaseProgressPct,
} from './index';

describe('isRunningSession', () => {
  it('retorna true para LONG_RUN', () => {
    expect(isRunningSession(SessionType.LONG_RUN)).toBe(true);
  });

  it('retorna true para EASY_RUN', () => {
    expect(isRunningSession(SessionType.EASY_RUN)).toBe(true);
  });

  it('retorna true para QUALITY_RUN', () => {
    expect(isRunningSession(SessionType.QUALITY_RUN)).toBe(true);
  });

  it('retorna true para PACE_RUN', () => {
    expect(isRunningSession(SessionType.PACE_RUN)).toBe(true);
  });

  it('retorna true para RECOVERY_RUN', () => {
    expect(isRunningSession(SessionType.RECOVERY_RUN)).toBe(true);
  });

  it('retorna true para RACE', () => {
    expect(isRunningSession(SessionType.RACE)).toBe(true);
  });

  it('retorna false para STRENGTH_LOWER', () => {
    expect(isRunningSession(SessionType.STRENGTH_LOWER)).toBe(false);
  });

  it('retorna false para STRENGTH_UPPER', () => {
    expect(isRunningSession(SessionType.STRENGTH_UPPER)).toBe(false);
  });

  it('retorna false para MOBILITY', () => {
    expect(isRunningSession(SessionType.MOBILITY)).toBe(false);
  });

  it('retorna false para REST', () => {
    expect(isRunningSession(SessionType.REST)).toBe(false);
  });
});

describe('isStrengthSession', () => {
  it('retorna true para STRENGTH_LOWER', () => {
    expect(isStrengthSession(SessionType.STRENGTH_LOWER)).toBe(true);
  });

  it('retorna true para STRENGTH_UPPER', () => {
    expect(isStrengthSession(SessionType.STRENGTH_UPPER)).toBe(true);
  });

  it('retorna false para EASY_RUN', () => {
    expect(isStrengthSession(SessionType.EASY_RUN)).toBe(false);
  });

  it('retorna false para REST', () => {
    expect(isStrengthSession(SessionType.REST)).toBe(false);
  });
});

describe('getTypeColor', () => {
  it('retorna cor correta para EASY_RUN', () => {
    expect(getTypeColor(SessionType.EASY_RUN)).toBe('#22c55e');
  });

  it('retorna cor correta para LONG_RUN', () => {
    expect(getTypeColor(SessionType.LONG_RUN)).toBe('#8b5cf6');
  });

  it('retorna cor correta para REST', () => {
    expect(getTypeColor(SessionType.REST)).toBe('#334155');
  });
});

describe('getTypeLabel', () => {
  it('retorna label correto para EASY_RUN', () => {
    expect(getTypeLabel(SessionType.EASY_RUN)).toBe('Easy Run');
  });

  it('retorna label correto para STRENGTH_LOWER', () => {
    expect(getTypeLabel(SessionType.STRENGTH_LOWER)).toBe('Força — Inferiores');
  });

  it('retorna label correto para REST', () => {
    expect(getTypeLabel(SessionType.REST)).toBe('Descanso');
  });
});

describe('hasDistance', () => {
  it('retorna true para sessão de corrida', () => {
    expect(hasDistance(SessionType.EASY_RUN)).toBe(true);
  });

  it('retorna false para REST', () => {
    expect(hasDistance(SessionType.REST)).toBe(false);
  });
});

describe('getEnvironmentLabel', () => {
  it('retorna "Esteira" para TREADMILL', () => {
    expect(getEnvironmentLabel(Environment.TREADMILL)).toBe('Esteira');
  });

  it('retorna "Rua" para OUTDOOR', () => {
    expect(getEnvironmentLabel(Environment.OUTDOOR)).toBe('Rua');
  });
});

describe('formatPace', () => {
  it('adiciona /km ao pace no formato MM:SS', () => {
    expect(formatPace('5:30')).toBe('5:30/km');
  });

  it('funciona com pace de dois dígitos nos minutos', () => {
    expect(formatPace('10:05')).toBe('10:05/km');
  });
});

describe('formatDistance', () => {
  it('formata distância com unidade km', () => {
    expect(formatDistance(10)).toBe('10 km');
  });

  it('formata distância decimal', () => {
    expect(formatDistance(21.1)).toBe('21.1 km');
  });
});

describe('parsePaceToSeconds', () => {
  it('converte 5:30 para 330 segundos', () => {
    expect(parsePaceToSeconds('5:30')).toBe(330);
  });

  it('converte 10:05 para 605 segundos', () => {
    expect(parsePaceToSeconds('10:05')).toBe(605);
  });

  it('converte 4:00 para 240 segundos', () => {
    expect(parsePaceToSeconds('4:00')).toBe(240);
  });
});

describe('formatPaceDelta', () => {
  it('retorna delta negativo quando actual é mais rápido que target', () => {
    const result = formatPaceDelta('5:00', '5:30');
    expect(result).toBe('−0:30/km');
  });

  it('retorna delta positivo quando actual é mais lento que target', () => {
    const result = formatPaceDelta('6:00', '5:30');
    expect(result).toBe('+0:30/km');
  });

  it('retorna zero delta quando paces são iguais', () => {
    const result = formatPaceDelta('5:30', '5:30');
    expect(result).toBe('−0:00/km');
  });
});

describe('isPaceFaster', () => {
  it('retorna true quando actual é mais rápido que target', () => {
    expect(isPaceFaster('5:00', '5:30')).toBe(true);
  });

  it('retorna false quando actual é mais lento que target', () => {
    expect(isPaceFaster('6:00', '5:30')).toBe(false);
  });

  it('retorna false quando paces são iguais', () => {
    expect(isPaceFaster('5:30', '5:30')).toBe(false);
  });
});

describe('getCurrentPhase', () => {
  const phases: Phase[] = [
    {
      id: '1',
      macrocycleId: 'mc1',
      name: 'Base',
      objective: 'Construção de base',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      order: 1,
    },
    {
      id: '2',
      macrocycleId: 'mc1',
      name: 'Volume',
      objective: 'Aumento de volume',
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      order: 2,
    },
  ];

  it('retorna a fase atual quando today está dentro de uma fase', () => {
    const phase = getCurrentPhase(phases, '2026-04-15');
    expect(phase?.name).toBe('Base');
  });

  it('retorna a segunda fase quando today está dentro dela', () => {
    const phase = getCurrentPhase(phases, '2026-05-15');
    expect(phase?.name).toBe('Volume');
  });

  it('retorna null quando today não está em nenhuma fase', () => {
    const phase = getCurrentPhase(phases, '2026-06-01');
    expect(phase).toBeNull();
  });
});

describe('getWeekNumberInPhase', () => {
  const phase: Phase = {
    id: '1',
    macrocycleId: 'mc1',
    name: 'Base',
    objective: 'Construção',
    startDate: '2026-04-01',
    endDate: '2026-04-28',
    order: 1,
  };

  it('retorna 1 para o primeiro dia da fase', () => {
    expect(getWeekNumberInPhase(phase, '2026-04-01')).toBe(1);
  });

  it('retorna 2 para o oitavo dia da fase', () => {
    expect(getWeekNumberInPhase(phase, '2026-04-08')).toBe(2);
  });

  it('retorna 4 para a quarta semana', () => {
    expect(getWeekNumberInPhase(phase, '2026-04-22')).toBe(4);
  });
});

describe('getTotalWeeksInPhase', () => {
  it('retorna 4 para fase de 28 dias', () => {
    const phase: Phase = {
      id: '1',
      macrocycleId: 'mc1',
      name: 'Base',
      objective: 'Construção',
      startDate: '2026-04-01',
      endDate: '2026-04-28',
      order: 1,
    };
    expect(getTotalWeeksInPhase(phase)).toBe(4);
  });

  it('retorna 5 para fase de 30 dias (arredonda para cima)', () => {
    const phase: Phase = {
      id: '1',
      macrocycleId: 'mc1',
      name: 'Volume',
      objective: 'Aumento',
      startDate: '2026-05-01',
      endDate: '2026-05-30',
      order: 2,
    };
    expect(getTotalWeeksInPhase(phase)).toBeGreaterThanOrEqual(4);
  });
});

describe('getWeeksToRace', () => {
  it('retorna 0 quando race date já passou', () => {
    expect(getWeeksToRace('2026-01-01', '2026-04-08')).toBe(0);
  });

  it('retorna semanas corretas até a prova', () => {
    expect(getWeeksToRace('2026-04-15', '2026-04-08')).toBe(1);
  });

  it('retorna número positivo quando prova é no futuro', () => {
    const weeks = getWeeksToRace('2026-11-15', '2026-04-08');
    expect(weeks).toBeGreaterThan(0);
  });
});

describe('getPhaseProgressPct', () => {
  const phase: Phase = {
    id: '1',
    macrocycleId: 'mc1',
    name: 'Base',
    objective: 'Construção',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    order: 1,
  };

  it('retorna 0 no primeiro dia da fase', () => {
    expect(getPhaseProgressPct(phase, '2026-04-01')).toBe(0);
  });

  it('retorna 100 após o último dia da fase', () => {
    expect(getPhaseProgressPct(phase, '2026-05-01')).toBe(100);
  });

  it('retorna valor entre 0 e 100 durante a fase', () => {
    const pct = getPhaseProgressPct(phase, '2026-04-15');
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });
});
