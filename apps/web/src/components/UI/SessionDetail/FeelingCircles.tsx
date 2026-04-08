import type { FeelingScale } from '@paceplan/types';
import { FEELING_LABELS } from '@paceplan/types';
import { cn } from '@/lib/utils';

export function FeelingCircles({ feeling }: { feeling: FeelingScale }) {
  return (
    <div className="flex gap-1.5 items-center">
      {([1, 2, 3, 4, 5] as const).map((f) => (
        <div
          key={f}
          className={cn(
            'w-2.5 h-2.5 rounded-full',
            f <= feeling
              ? 'bg-primary'
              : 'bg-[--border] border border-[--border-subtle]'
          )}
        />
      ))}
      <span className="text-xs text-[--text-secondary] ml-1">
        {FEELING_LABELS[feeling]}
      </span>
    </div>
  );
}
