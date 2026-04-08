import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeek } from './useWeek';

describe('useWeek', () => {
  it('calcula a segunda-feira correta para uma quarta-feira', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    expect(result.current.weekStart).toBe('2026-04-06');
  });

  it('calcula weekEnd como domingo da mesma semana', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    expect(result.current.weekEnd).toBe('2026-04-12');
  });

  it('retorna exatamente 7 dias', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    expect(result.current.days).toHaveLength(7);
  });

  it('primeiro dia é a segunda-feira', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    expect(result.current.days[0]).toBe('2026-04-06');
  });

  it('último dia é o domingo', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    expect(result.current.days[6]).toBe('2026-04-12');
  });

  it('goToPrevWeek recua 7 dias', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    act(() => result.current.goToPrevWeek());
    expect(result.current.weekStart).toBe('2026-03-30');
  });

  it('goToNextWeek avança 7 dias', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    act(() => result.current.goToNextWeek());
    expect(result.current.weekStart).toBe('2026-04-13');
  });

  it('goToCurrentWeek restaura para a semana atual', () => {
    const { result } = renderHook(() => useWeek('2026-01-01'));
    act(() => result.current.goToPrevWeek());
    act(() => result.current.goToCurrentWeek());
    expect(result.current.isCurrentWeek).toBe(true);
  });

  it('isCurrentWeek é true quando inicializado sem data', () => {
    const { result } = renderHook(() => useWeek());
    expect(result.current.isCurrentWeek).toBe(true);
  });

  it('isCurrentWeek é false para semana do passado', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    act(() => result.current.goToPrevWeek());
    expect(result.current.isCurrentWeek).toBe(false);
  });

  it('dias estão em sequência crescente', () => {
    const { result } = renderHook(() => useWeek('2026-04-08'));
    const { days } = result.current;
    for (let i = 1; i < days.length; i++) {
      expect(days[i]! > days[i - 1]!).toBe(true);
    }
  });
});
