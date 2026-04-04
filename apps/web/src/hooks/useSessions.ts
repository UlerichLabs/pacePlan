import { useCallback, useEffect, useState } from 'react';
import type {
  CreateSessionPayload,
  LogSessionPayload,
  TrainingSession,
  UpdateSessionPayload,
} from '@paceplan/types';
import { sessionService } from '../services/sessionService';

export function useSessions(startDate: string, endDate: string) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.list(startDate, endDate);
      setSessions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  async function createSession(payload: CreateSessionPayload): Promise<TrainingSession> {
    const created = await sessionService.create(payload);
    await fetchSessions();
    return created;
  }

  async function updateSession(id: string, payload: UpdateSessionPayload): Promise<TrainingSession> {
    const updated = await sessionService.update(id, payload);
    setSessions(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  }

  async function logSession(id: string, payload: LogSessionPayload): Promise<TrainingSession> {
    const updated = await sessionService.log(id, payload);
    setSessions(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  }

  async function skipSession(id: string): Promise<void> {
    const updated = await sessionService.skip(id);
    setSessions(prev => prev.map(s => s.id === id ? updated : s));
  }

  async function reactivateSession(id: string): Promise<void> {
    const updated = await sessionService.reactivate(id);
    setSessions(prev => prev.map(s => s.id === id ? updated : s));
  }

  async function deleteSession(id: string): Promise<void> {
    await sessionService.remove(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  return {
    sessions,
    loading,
    error,
    createSession,
    updateSession,
    logSession,
    skipSession,
    reactivateSession,
    deleteSession,
    refetch: fetchSessions,
  };
}
