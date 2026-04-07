import { Environment } from '@paceplan/types';
import { getEnvironmentLabel } from '../../../services/sessionUtils';

export function EnvironmentBadge({ env }: { env: Environment }) {
  const isOutdoor = env === Environment.OUTDOOR;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
      background: isOutdoor ? 'rgba(34,197,94,.12)' : 'rgba(99,102,241,.12)',
      color: isOutdoor ? '#4ade80' : '#a5b4fc',
      border: `1px solid ${isOutdoor ? 'rgba(34,197,94,.2)' : 'rgba(99,102,241,.2)'}`,
    }}>
      {getEnvironmentLabel(env)}
    </span>
  );
}
