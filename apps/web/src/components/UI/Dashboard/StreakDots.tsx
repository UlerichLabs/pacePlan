import { cn } from '@/lib/utils';

export type StreakDayType = 'run' | 'strength' | 'rest' | 'empty';

const DOT_BG: Record<StreakDayType, string> = {
  run:      'bg-success/50',
  strength: 'bg-accent',
  rest:     'bg-surface',
  empty:    'bg-surface',
};

export function StreakDots({ days }: { days: { date: string; type: StreakDayType }[] }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {days.map((day, i) => {
        const isLast = i === days.length - 1;
        return (
          <div
            key={day.date}
            className={cn(
              'w-3.5 h-3.5 rounded-sm',
              DOT_BG[day.type],
              isLast && 'outline outline-2 outline-primary outline-offset-1'
            )}
          />
        );
      })}
    </div>
  );
}
