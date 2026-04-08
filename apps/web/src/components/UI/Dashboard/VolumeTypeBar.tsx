export function VolumeTypeBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div
        className="w-[7px] h-[7px] rounded-full shrink-0"
        style={{ '--bar-color': color } as React.CSSProperties}
      >
        <div className="w-full h-full rounded-full bg-[--bar-color]" />
      </div>
      <span className="text-[11px] text-[--text-muted] w-[70px] shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-[--bar-color] w-[--pct]"
          style={{ '--pct': `${pct}%`, '--bar-color': color } as React.CSSProperties}
        />
      </div>
      <span className="text-[11px] text-[--text-secondary] w-4 text-right shrink-0">
        {count}
      </span>
    </div>
  );
}
