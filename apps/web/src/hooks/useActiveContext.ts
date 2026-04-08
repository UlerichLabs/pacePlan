import { useCallback, useEffect, useState } from 'react';
import { MacrocycleApiError, macrocycleService, type ActiveContext } from '../services/macrocycleService';

const CODE_NOT_FOUND = '404.010';

export interface ActiveContextState {
  context: ActiveContext | null;
  responseCode: string | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useActiveContext(): ActiveContextState {
  const [context, setContext] = useState<ActiveContext | null>(null);
  const [responseCode, setResponseCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await macrocycleService.getActiveContext();
      setContext(data.context);
      setResponseCode(data.code);
    } catch (e) {
      if (e instanceof MacrocycleApiError && e.code === CODE_NOT_FOUND) {
        setNotFound(true);
      } else {
        setError(e instanceof Error ? e.message : 'Erro ao carregar contexto');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContext();
  }, [fetchContext]);

  return { context, responseCode, loading, notFound, error, refetch: fetchContext };
}
