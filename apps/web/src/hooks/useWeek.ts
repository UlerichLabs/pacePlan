import { useState } from 'react';

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function useWeek(initialDate?: string) {
  const [weekStart, setWeekStart] = useState<string>(() => {
    const base = initialDate != null
      ? new Date(`${initialDate}T00:00:00`)
      : new Date();
    return toIso(getMonday(base));
  });

  const weekStartDate = new Date(`${weekStart}T00:00:00`);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  const weekEnd = toIso(weekEndDate);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + i);
    return toIso(d);
  });

  const todayMonday = toIso(getMonday(new Date()));
  const isCurrentWeek = weekStart === todayMonday;

  function goToPrevWeek() {
    const d = new Date(`${weekStart}T00:00:00`);
    d.setDate(d.getDate() - 7);
    setWeekStart(toIso(d));
  }

  function goToNextWeek() {
    const d = new Date(`${weekStart}T00:00:00`);
    d.setDate(d.getDate() + 7);
    setWeekStart(toIso(d));
  }

  function goToCurrentWeek() {
    setWeekStart(todayMonday);
  }

  return {
    weekStart,
    weekEnd,
    days,
    isCurrentWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
