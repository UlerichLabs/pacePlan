import type { FeelingScale } from '@paceplan/types';
import { FEELING_LABELS } from '@paceplan/types';

export function FeelingCircles({ feeling }: { feeling: FeelingScale }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {([1, 2, 3, 4, 5] as const).map((f) => (
        <div
          key={f}
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: f <= feeling ? 'var(--color-primary)' : 'rgba(255,255,255,.12)',
            border: f <= feeling ? 'none' : '1px solid rgba(255,255,255,.15)',
          }}
        />
      ))}
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>
        {FEELING_LABELS[feeling]}
      </span>
    </div>
  );
}
