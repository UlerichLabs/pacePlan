import type { FeelingScale } from '@paceplan/types';
import { FEELING_LABELS } from '@paceplan/types';

const FEELINGS = [1, 2, 3, 4, 5] as const;

interface FeelingScalePickerProps {
  value: FeelingScale | null;
  onChange: (f: FeelingScale) => void;
}

export function FeelingScalePicker({ value, onChange }: FeelingScalePickerProps) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {FEELINGS.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            background: value === f ? 'rgba(99,102,241,.25)' : 'rgba(255,255,255,.06)',
            border: `1px solid ${value === f ? 'rgba(99,102,241,.5)' : 'rgba(255,255,255,.08)'}`,
            color: value === f ? 'var(--color-primary-s)' : 'var(--text-muted)',
            fontSize: 11, fontWeight: value === f ? 700 : 500,
            cursor: 'pointer', transition: 'all .15s',
          }}
        >
          {FEELING_LABELS[f]}
        </button>
      ))}
    </div>
  );
}
