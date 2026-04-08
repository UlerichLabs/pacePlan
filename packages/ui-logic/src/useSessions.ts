import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateSessionPayload,
  LogSessionPayload,
  UpdateSessionPayload,
} from '@paceplan/types';
import { sessionKeys } from '@paceplan/api-client';
import { sessionService } from '@paceplan/api-client';

export function useSessions(startDate: string, endDate: string) {
  const queryClient = useQueryClient();

  const { data: sessions = [], isPending: loading, error } = useQuery({
    queryKey: sessionKeys.week(startDate, endDate),
    queryFn: () => sessionService.list(startDate, endDate),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: sessionKeys.all });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSessionPayload) => sessionService.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionPayload }) =>
      sessionService.update(id, payload),
    onSuccess: invalidate,
  });

  const logMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LogSessionPayload }) =>
      sessionService.log(id, payload),
    onSuccess: invalidate,
  });

  const skipMutation = useMutation({
    mutationFn: (id: string) => sessionService.skip(id),
    onSuccess: invalidate,
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => sessionService.reactivate(id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionService.remove(id),
    onSuccess: invalidate,
  });

  return {
    sessions,
    loading,
    error: error?.message ?? null,
    createSession: (payload: CreateSessionPayload) =>
      createMutation.mutateAsync(payload),
    updateSession: (id: string, payload: UpdateSessionPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    logSession: (id: string, payload: LogSessionPayload) =>
      logMutation.mutateAsync({ id, payload }),
    skipSession: (id: string) => skipMutation.mutateAsync(id),
    reactivateSession: (id: string) => reactivateMutation.mutateAsync(id),
    deleteSession: (id: string) => deleteMutation.mutateAsync(id),
  };
}
