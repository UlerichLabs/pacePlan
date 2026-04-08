import { cn } from '@/lib/utils';

export function DeltaBadge({ text, positive }: { text: string; positive: boolean }) {
  return (
    <span className={cn(
      'text-[10px] font-semibold px-2 py-[2px] rounded-md ml-2 whitespace-nowrap',
      positive
        ? 'bg-success/14 text-success-fg border border-success/20'
        : 'bg-destructive/12 text-destructive border border-destructive/15'
    )}>
      {text}
    </span>
  );
}
