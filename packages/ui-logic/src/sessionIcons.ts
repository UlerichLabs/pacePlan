import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Dumbbell,
  Gauge,
  Moon,
  PersonStanding,
  Timer,
  Trophy,
  TrendingUp,
  Wind,
} from 'lucide-react';
import { SessionType } from '@paceplan/types';

export const SESSION_ICONS: Record<SessionType, LucideIcon> = {
  [SessionType.EASY_RUN]:       Activity,
  [SessionType.QUALITY_RUN]:    Timer,
  [SessionType.LONG_RUN]:       TrendingUp,
  [SessionType.PACE_RUN]:       Gauge,
  [SessionType.RECOVERY_RUN]:   Wind,
  [SessionType.RACE]:           Trophy,
  [SessionType.STRENGTH_LOWER]: Dumbbell,
  [SessionType.STRENGTH_UPPER]: Dumbbell,
  [SessionType.MOBILITY]:       PersonStanding,
  [SessionType.REST]:           Moon,
};
