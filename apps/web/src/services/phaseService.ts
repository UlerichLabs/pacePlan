import type { Phase } from '@paceplan/types';

const BASE = '/api/macrocycles';

export class PhaseApiError extends Error {
  statusCode: number;
  code: string;
  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'PhaseApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface CreatePhasePayload {
  name: string;
  objective: string;
  startDate: string;
  endDate: string;
  longRunTarget?: number | undefined;
  weeklyVolumeTarget?: number | undefined;
}

interface CreatePhaseResponse {
  status: string;
  code: string;
  message: string;
  phase: Phase;
}

export const phaseService = {
  async create(macrocycleId: string, payload: CreatePhasePayload): Promise<Phase> {
    const res = await fetch(`${BASE}/${macrocycleId}/phases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({})) as Partial<CreatePhaseResponse> & {
      error?: string;
      message?: string;
      code?: string;
      statusCode?: number;
    };

    if (!res.ok) {
      throw new PhaseApiError(
        body.message ?? body.error ?? `HTTP ${res.status}`,
        body.statusCode ?? res.status,
        body.code ?? '',
      );
    }

    return body.phase as Phase;
  },
};
