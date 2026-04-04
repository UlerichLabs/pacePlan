import type {
  CreateSessionPayload,
  LogSessionPayload,
  TrainingSession,
  UpdateSessionPayload,
} from '@paceplan/types';

const BASE = '/api/sessions';

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

export const sessionService = {
  list: (startDate: string, endDate: string) =>
    request<TrainingSession[]>(`${BASE}?startDate=${startDate}&endDate=${endDate}`),

  get: (id: string) =>
    request<TrainingSession>(`${BASE}/${id}`),

  create: (payload: CreateSessionPayload) =>
    request<TrainingSession>(BASE, { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateSessionPayload) =>
    request<TrainingSession>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  log: (id: string, payload: LogSessionPayload) =>
    request<TrainingSession>(`${BASE}/${id}/log`, { method: 'POST', body: JSON.stringify(payload) }),

  skip: (id: string) =>
    request<TrainingSession>(`${BASE}/${id}/skip`, { method: 'POST' }),

  reactivate: (id: string) =>
    request<TrainingSession>(`${BASE}/${id}/reactivate`, { method: 'POST' }),

  remove: (id: string) =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
