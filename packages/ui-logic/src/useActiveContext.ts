import { useQuery } from '@tanstack/react-query';
import { macrocycleKeys } from '@paceplan/api-client';
import { MacrocycleApiError, macrocycleService } from '@paceplan/api-client';
import type { ActiveContext } from '@paceplan/api-client';

const CODE_NOT_FOUND = '404.010';

export interface ActiveContextState {
  context: ActiveContext | null;
  responseCode: string | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActiveContext(): ActiveContextState {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: macrocycleKeys.activeContext(),
    queryFn: () => macrocycleService.getActiveContext(),
    retry: (failureCount, err) => {
      if (err instanceof MacrocycleApiError && err.code === CODE_NOT_FOUND) return false;
      return failureCount < 3;
    },
  });

  const notFound = error instanceof MacrocycleApiError && error.code === CODE_NOT_FOUND;

  return {
    context: data?.context ?? null,
    responseCode: data?.code ?? null,
    loading: isPending,
    notFound,
    error: notFound ? null : (error?.message ?? null),
    refetch,
  };
}
