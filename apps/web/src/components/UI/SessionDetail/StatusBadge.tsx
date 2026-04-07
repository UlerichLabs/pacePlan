export interface StatusBadgeProps {
  statusCfg: {
    label: string;
    bg: string;
    color: string;
    border: string;
  };
}

export function StatusBadge({ statusCfg }: StatusBadgeProps) {
  return (
    <span style={{
      marginLeft: 'auto',
      fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
      background: statusCfg.bg, color: statusCfg.color,
      border: `1px solid ${statusCfg.border}`, whiteSpace: 'nowrap',
    }}>
      {statusCfg.label}
    </span>
  );
}
