import type { Macrocycle, Phase } from '@paceplan/types';

const BASE = '/api/macrocycles';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const body = await res.json() as { data: T };
  return body.data;
}

export interface CreateMacrocyclePayload {
  name: string;
  goalDistance: number;
  raceDate: string;
  startDate: string;
}

export interface CreatePhasePayload {
  name: string;
  objective: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
  longRunTarget?: number | undefined;
  weeklyVolumeTarget?: number | undefined;
}

export const macrocycleService = {
  getActive: () =>
    request<{ macrocycle: Macrocycle; phases: Phase[] } | null>(`${BASE}/active`),

  create: (payload: CreateMacrocyclePayload) =>
    request<Macrocycle>(BASE, { method: 'POST', body: JSON.stringify(payload) }),

  async archiveActive(): Promise<Macrocycle> {
    const res = await fetch(`${BASE}/active/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.json().catch(() => ({})) as { error?: string; macrocycle?: Macrocycle };
    if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
    return body.macrocycle as Macrocycle;
  },

  getPhases: (id: string) =>
    request<Phase[]>(`${BASE}/${id}/phases`),

  createPhase: (id: string, payload: CreatePhasePayload) =>
    request<Phase>(`${BASE}/${id}/phases`, { method: 'POST', body: JSON.stringify(payload) }),
};
