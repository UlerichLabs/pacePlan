import type { Macrocycle, Phase } from '@paceplan/types';

const BASE = '/api/macrocycles';

export interface ActiveContextProgress {
  currentWeekNumber: number;
  totalWeeksInPhase: number;
}

export interface ActiveContext {
  macrocycle: Macrocycle;
  currentPhase: Phase | null;
  progress: ActiveContextProgress | null;
}

export class MacrocycleApiError extends Error {
  statusCode: number;
  code: string;
  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'MacrocycleApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface CreateMacrocyclePayload {
  name: string;
  goalDistance: number;
  raceDate: string;
  startDate: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; code?: string; statusCode?: number };
    throw new MacrocycleApiError(
      body.error ?? `HTTP ${res.status}`,
      body.statusCode ?? res.status,
      body.code ?? '',
    );
  }
  const body = await res.json() as { data: T };
  return body.data;
}

interface CreateMacrocycleResponse {
  status: string;
  code: string;
  message: string;
  macrocycle: Macrocycle;
}

export const macrocycleService = {
  getActive: () =>
    request<{ macrocycle: Macrocycle; phases: Phase[] } | null>(`${BASE}/active`),

  async create(payload: CreateMacrocyclePayload): Promise<Macrocycle> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({})) as Partial<CreateMacrocycleResponse> & { error?: string; code?: string; statusCode?: number };

    if (!res.ok) {
      throw new MacrocycleApiError(
        body.error ?? `HTTP ${res.status}`,
        body.statusCode ?? res.status,
        body.code ?? '',
      );
    }

    return body.macrocycle as Macrocycle;
  },

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

  async getActiveContext(): Promise<{ status: string; code: string; context: ActiveContext }> {
    const res = await fetch(`${BASE}/active/context`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string; code?: string; statusCode?: number };
      throw new MacrocycleApiError(
        body.error ?? `HTTP ${res.status}`,
        body.statusCode ?? res.status,
        body.code ?? '',
      );
    }
    return res.json() as Promise<{ status: string; code: string; context: ActiveContext }>;
  },
};
