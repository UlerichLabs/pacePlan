import type { FeelingScale } from '@paceplan/types';
import { FEELING_LABELS } from '@paceplan/types';
import { cn } from '@/lib/utils';

const FEELINGS = [1, 2, 3, 4, 5] as const;

interface FeelingScalePickerProps {
  value: FeelingScale | null;
  onChange: (f: FeelingScale) => void;
}

export function FeelingScalePicker({ value, onChange }: FeelingScalePickerProps) {
  return (
    <div className="flex gap-1.5">
      {FEELINGS.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={cn(
            'flex-1 h-11 rounded-md text-[11px] transition-all duration-150',
            value === f
              ? 'bg-accent border border-primary/50 text-primary font-bold'
              : 'bg-surface border border-[--border-subtle] text-[--text-muted] font-medium'
          )}
        >
          {FEELING_LABELS[f]}
        </button>
      ))}
    </div>
  );
}
