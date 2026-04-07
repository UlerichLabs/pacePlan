export function DeltaBadge({ text, positive }: { text: string; positive: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
      background: positive ? 'rgba(34,197,94,.14)' : 'rgba(239,68,68,.12)',
      color: positive ? '#4ade80' : '#f87171',
      border: `1px solid ${positive ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.15)'}`,
      marginLeft: 8, whiteSpace: 'nowrap' as const,
    }}>
      {text}
    </span>
  );
}
