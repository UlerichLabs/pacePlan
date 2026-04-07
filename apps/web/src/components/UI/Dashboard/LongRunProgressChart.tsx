const LABEL_SEM_DADOS = 'Sem dados de longão ainda';

export function LongRunProgressChart({ data, phaseTarget }: { data: { week: string; km: number }[]; phaseTarget: number }) {
  if (data.length === 0) {
    return (
      <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{LABEL_SEM_DADOS}</span>
      </div>
    );
  }

  const W = 240;
  const H = 90;
  const maxKm = Math.max(...data.map(d => d.km), phaseTarget, 1);
  const xStep = data.length > 1 ? W / (data.length - 1) : W;

  const toX = (i: number) => i * xStep;
  const toY  = (km: number) => H - (km / maxKm) * H;

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)},${toY(d.km).toFixed(1)}`)
    .join(' ');

  const areaPath =
    `M ${toX(0).toFixed(1)},${H} ` +
    data.map((d, i) => `L ${toX(i).toFixed(1)},${toY(d.km).toFixed(1)}`).join(' ') +
    ` L ${toX(data.length - 1).toFixed(1)},${H} Z`;

  const targetY = toY(phaseTarget);
  const lastX = toX(data.length - 1);
  const lastY = toY(data[data.length - 1]?.km ?? 0);
  const lastKm = data[data.length - 1]?.km ?? 0;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="longRunArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#longRunArea)" />
      <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {phaseTarget > 0 && (
        <line x1={0} y1={targetY} x2={W} y2={targetY}
          stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />
      )}
      <circle cx={lastX} cy={lastY} r={4} fill="#8b5cf6" />
      <circle cx={lastX} cy={lastY} r={7} fill="#8b5cf6" fillOpacity="0.2" />
      <text x={lastX} y={lastY - 10} textAnchor="middle" fontSize={9} fill="#c4b5fd" fontFamily="Inter,sans-serif" fontWeight="600">
        {lastKm.toFixed(1)} km
      </text>
      {data.map((d, i) => (
        <text key={d.week} x={toX(i)} y={H + 14} textAnchor="middle" fontSize={9}
          fill={i === data.length - 1 ? '#c4b5fd' : 'rgba(255,255,255,0.3)'}
          fontFamily="Inter,sans-serif">
          {d.week}
        </text>
      ))}
    </svg>
  );
}
