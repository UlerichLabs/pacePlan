import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSessions } from './useSessions';
import { QueryClientWrapper } from './test-utils';
import { mockLongRun, mockEasyRun } from './test-fixtures';

vi.mock('@paceplan/api-client', () => ({
  sessionKeys: {
    week: (s: string, e: string) => ['sessions', 'week', s, e],
    all: ['sessions'],
  },
  sessionService: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    log: vi.fn(),
    skip: vi.fn(),
    reactivate: vi.fn(),
    remove: vi.fn(),
  },
}));

import { sessionService } from '@paceplan/api-client';

const mockList = vi.mocked(sessionService.list);

describe('useSessions', () => {
  beforeEach(() => {
    mockList.mockResolvedValue([]);
  });

  it('retorna lista vazia enquanto não há dados', async () => {
    const { result } = renderHook(
      () => useSessions('2026-04-06', '2026-04-12'),
      { wrapper: QueryClientWrapper }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toEqual([]);
  });

  it('retorna sessões quando a query resolve com dados', async () => {
    mockList.mockResolvedValue([mockLongRun, mockEasyRun]);

    const { result } = renderHook(
      () => useSessions('2026-04-06', '2026-04-12'),
      { wrapper: QueryClientWrapper }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toHaveLength(2);
  });

  it('error é null quando a query resolve com sucesso', async () => {
    const { result } = renderHook(
      () => useSessions('2026-04-06', '2026-04-12'),
      { wrapper: QueryClientWrapper }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
  });

  it('error contém mensagem quando a query falha', async () => {
    mockList.mockRejectedValue(new Error('Falha de rede'));

    const { result } = renderHook(
      () => useSessions('2026-04-06', '2026-04-12'),
      { wrapper: QueryClientWrapper }
    );
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toBe('Falha de rede');
  });

  it('expõe createSession como função', async () => {
    const { result } = renderHook(
      () => useSessions('2026-04-06', '2026-04-12'),
      { wrapper: QueryClientWrapper }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.createSession).toBe('function');
  });

  it('expõe deleteSession como função', async () => {
    const { result } = renderHook(
      () => useSessions('2026-04-06', '2026-04-12'),
      { wrapper: QueryClientWrapper }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.deleteSession).toBe('function');
  });
});
