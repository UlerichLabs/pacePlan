export function WeeklyVolumeChart({ data, target }: { data: { week: string; km: number; isCurrent: boolean }[]; target: number }) {
  const W = 560;
  const H = 90;
  const maxKm = Math.max(...data.map(d => d.km), target, 1);
  const slotW = W / data.length;
  const barW = slotW - 8;
  const targetY = H - (target / maxKm) * H;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="xMidYMid meet">
      {data.map((week, i) => {
        const barH = Math.max((week.km / maxKm) * H, 2);
        const x = i * slotW + 4;
        const y = H - barH;
        return (
          <g key={week.week}>
            <rect x={x} y={y} width={barW} height={barH} rx={4}
              fill={week.isCurrent ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'color-mix(in srgb, var(--success) 12%, transparent)'}
              stroke={week.isCurrent ? 'var(--success)' : 'none'}
              strokeWidth={week.isCurrent ? 1 : 0}
            />
            {week.isCurrent && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={9}
                fill="var(--success-fg)" fontFamily="Inter,sans-serif" fontWeight="700">
                {week.km.toFixed(1)}
              </text>
            )}
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={9}
              fill={week.isCurrent ? 'var(--success-fg)' : 'rgba(255,255,255,0.28)'}
              fontFamily="Inter,sans-serif">
              {week.week}
            </text>
          </g>
        );
      })}
      {target > 0 && (
        <>
          <line x1={0} y1={targetY} x2={W} y2={targetY}
            stroke="color-mix(in srgb, var(--primary) 60%, transparent)" strokeWidth="1.5" strokeDasharray="5,4" />
          <text x={4} y={targetY - 4} fontSize={8} fill="color-mix(in srgb, var(--primary-subtle) 80%, transparent)" fontFamily="Inter,sans-serif">
            {target} km
          </text>
        </>
      )}
    </svg>
  );
}
