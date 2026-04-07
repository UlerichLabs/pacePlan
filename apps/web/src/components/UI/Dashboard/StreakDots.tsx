export type StreakDayType = 'run' | 'strength' | 'rest' | 'empty';

export function StreakDots({ days }: { days: { date: string; type: StreakDayType }[] }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {days.map((day, i) => {
        const isLast = i === days.length - 1;
        let bg = 'rgba(255,255,255,0.06)';
        if (day.type === 'run') bg = 'rgba(34,197,94,0.5)';
        else if (day.type === 'strength') bg = 'rgba(99,102,241,0.5)';
        return (
          <div key={day.date} style={{
            width: 14, height: 14, borderRadius: 3, background: bg,
            outline: isLast ? '2px solid #6366f1' : 'none', outlineOffset: 1,
          }} />
        );
      })}
    </div>
  );
}
