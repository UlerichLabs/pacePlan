import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  statusCfg: {
    label: string;
    variant: 'planned' | 'done' | 'skipped';
  };
}

const VARIANT_CLASSES = {
  planned: 'bg-[--surface] text-[--text-muted] border border-[--border]',
  done:    'bg-success/15 text-success-fg border border-success/20',
  skipped: 'bg-destructive/10 text-destructive border border-destructive/15',
} as const;

export function StatusBadge({ statusCfg }: StatusBadgeProps) {
  return (
    <span className={cn(
      'ml-auto text-[10px] font-semibold px-[9px] py-[3px] rounded-[7px] whitespace-nowrap',
      VARIANT_CLASSES[statusCfg.variant]
    )}>
      {statusCfg.label}
    </span>
  );
}
