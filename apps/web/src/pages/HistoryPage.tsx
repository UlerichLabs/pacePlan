import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ScrollText } from 'lucide-react';
import type { TrainingSession } from '@paceplan/types';
import { FEELING_LABELS } from '@paceplan/types';
import { cn } from '@/lib/utils';
import { useSessions } from '../hooks/useSessions';
import {
  SESSION_ICONS,
  formatDate,
  formatDistance,
  formatPace,
  getTypeColor,
  getTypeLabel,
  isRunningSession,
  isStrengthSession,
} from '../services/sessionUtils';

const PAGE_TITLE = 'Histórico';
const FILTER_ALL = 'Tudo';
const FILTER_RUN = 'Corrida';
const FILTER_STRENGTH = 'Força & Mob';
const EMPTY_TITLE = 'Nenhum treino registrado ainda';
const EMPTY_SUBTITLE = 'Conclua seus primeiros treinos para ver o histórico aqui';
const LABEL_CARREGANDO = 'Carregando...';

type FilterKey = 'all' | 'run' | 'strength';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: FILTER_ALL      },
  { key: 'run',      label: FILTER_RUN      },
  { key: 'strength', label: FILTER_STRENGTH },
];

function applyFilter(sessions: TrainingSession[], filter: FilterKey): TrainingSession[] {
  if (filter === 'run') return sessions.filter(s => isRunningSession(s.type));
  if (filter === 'strength') return sessions.filter(s => isStrengthSession(s.type) || (!isRunningSession(s.type) && !isStrengthSession(s.type)));
  return sessions;
}

function FeelingDots({ feeling }: { feeling: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-[3px] items-center">
      {([1, 2, 3, 4, 5] as const).map(f => (
        <div
          key={f}
          className={cn(
            'w-2 h-2 rounded-full',
            f <= feeling
              ? 'bg-primary'
              : 'bg-[--border] border border-[--border-subtle]'
          )}
        />
      ))}
      <span className="text-[10px] text-[--text-muted] ml-1">
        {FEELING_LABELS[feeling]}
      </span>
    </div>
  );
}

function SessionHistoryCard({ session, onClick }: { session: TrainingSession; onClick: () => void }) {
  const color = getTypeColor(session.type);
  const Icon = SESSION_ICONS[session.type];
  const isRun = isRunningSession(session.type);
  const log = session.log;

  return (
    <button
      onClick={onClick}
      style={{ '--session-color': color } as React.CSSProperties}
      className="w-full text-left rounded-card mb-2 glass overflow-hidden cursor-pointer flex relative hover:bg-surface/50 transition-colors"
    >
      <div className="session-accent-bar bg-[--session-color]" />

      <div className="flex-1 px-3.5 py-3 flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center bg-[--session-color]/10">
          <Icon size={17} color={color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-foreground mb-0.5">
            {getTypeLabel(session.type)}
          </div>
          <div className="text-[11px] text-[--text-muted] mb-1.5">
            {formatDate(session.date)}
          </div>
          {log != null && <FeelingDots feeling={log.feeling} />}
        </div>

        {isRun && log != null && (
          <div className="text-right shrink-0">
            {log.actualDistance != null && (
              <div className="text-[15px] font-bold tracking-tight mb-0.5 text-[--session-color]">
                {formatDistance(log.actualDistance)}
              </div>
            )}
            {log.actualPace != null && (
              <div className="text-[11px] text-[--text-muted] mb-0.5">
                {formatPace(log.actualPace)}
              </div>
            )}
            {log.heartRateAvg != null && (
              <div className="text-[11px] text-[--text-muted] flex items-center gap-[3px] justify-end">
                <Heart size={10} className="text-[--text-muted]" />
                {log.heartRateAvg} bpm
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('all');

  const [rangeStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 180);
    return d.toISOString().slice(0, 10);
  });
  const today = new Date().toISOString().slice(0, 10);

  const { sessions, loading, error } = useSessions(rangeStart, today);

  const doneSessions = sessions
    .filter(s => s.status === 'done')
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const visible = applyFilter(doneSessions, filter);

  return (
    <div className="flex flex-col h-full">
      <header className="page-header">
        <h1 className="text-[17px] font-semibold text-foreground">
          {PAGE_TITLE}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        <div className="flex gap-2 mb-5">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-4 py-[7px] rounded-full text-xs transition-all duration-150',
                filter === key
                  ? 'bg-surface border border-primary/50 text-primary-subtle font-semibold backdrop-blur-[40px]'
                  : 'border border-[--border-subtle] text-[--text-muted] font-medium hover:bg-surface'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center pt-[60px] text-[--text-muted] text-sm">
            {LABEL_CARREGANDO}
          </div>
        ) : error != null ? (
          <div className="error-box">
            {error}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <ScrollText size={32} className="text-[--text-muted]" />
            <div className="text-sm font-semibold text-[--text-secondary] text-center">
              {EMPTY_TITLE}
            </div>
            <div className="text-xs text-[--text-muted] text-center max-w-[240px] leading-relaxed">
              {EMPTY_SUBTITLE}
            </div>
          </div>
        ) : (
          visible.map(session => (
            <SessionHistoryCard
              key={session.id}
              session={session}
              onClick={() => navigate(`/sessions/${session.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
