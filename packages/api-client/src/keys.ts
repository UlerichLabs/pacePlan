export const sessionKeys = {
  all: ['sessions'] as const,
  week: (startDate: string, endDate: string) =>
    ['sessions', 'week', startDate, endDate] as const,
  detail: (id: string) => ['sessions', id] as const,
};

export const macrocycleKeys = {
  all: ['macrocycles'] as const,
  active: () => ['macrocycles', 'active'] as const,
  activeContext: () => ['macrocycles', 'active', 'context'] as const,
  detail: (id: string) => ['macrocycles', id] as const,
  phases: (id: string) => ['macrocycles', id, 'phases'] as const,
  paceProfile: (id: string) => ['macrocycles', id, 'pace-profile'] as const,
  weekTemplate: (id: string) => ['macrocycles', id, 'week-template'] as const,
};
