import { Environment } from '@paceplan/types';
import { cn } from '@/lib/utils';
import { getEnvironmentLabel } from '../../../services/sessionUtils';

export function EnvironmentBadge({ env }: { env: Environment }) {
  const isOutdoor = env === Environment.OUTDOOR;
  return (
    <span className={cn(
      'text-[10px] font-semibold px-[9px] py-[3px] rounded-[7px]',
      isOutdoor
        ? 'bg-success/12 text-success-fg border border-success/20'
        : 'bg-accent text-primary-subtle border border-primary/20'
    )}>
      {getEnvironmentLabel(env)}
    </span>
  );
}
