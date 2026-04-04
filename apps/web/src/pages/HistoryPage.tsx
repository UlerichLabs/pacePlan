import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ScrollText } from 'lucide-react';
import type { TrainingSession } from '@paceplan/types';
import { FEELING_LABELS } from '@paceplan/types';
import { CURRENT_WEEK_SESSIONS } from '../mocks/sessionsMock';
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

type FilterKey = 'all' | 'run' | 'strength';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: FILTER_ALL      },
  { key: 'run',      label: FILTER_RUN      },
  { key: 'strength', label: FILTER_STRENGTH },
];

const doneSessions: TrainingSession[] = [...CURRENT_WEEK_SESSIONS]
  .filter((s) => s.status === 'done')
  .sort((a, b) => (a.date < b.date ? 1 : -1));

function applyFilter(sessions: TrainingSession[], filter: FilterKey): TrainingSession[] {
  if (filter === 'run') return sessions.filter((s) => isRunningSession(s.type));
  if (filter === 'strength') return sessions.filter((s) => isStrengthSession(s.type) || (!isRunningSession(s.type) && !isStrengthSession(s.type)));
  return sessions;
}

function FeelingDots({ feeling }: { feeling: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {([1, 2, 3, 4, 5] as const).map((f) => (
        <div
          key={f}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: f <= feeling ? 'var(--color-primary)' : 'rgba(255,255,255,.10)',
            border: f <= feeling ? 'none' : '1px solid rgba(255,255,255,.14)',
          }}
        />
      ))}
      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
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
      style={{
        width: '100%', textAlign: 'left',
        borderRadius: 14, marginBottom: 8,
        background: 'rgba(255,255,255,0.065)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        overflow: 'hidden', cursor: 'pointer',
        display: 'flex', position: 'relative',
      }}
    >
      <div style={{ width: 3, background: color, flexShrink: 0, alignSelf: 'stretch', borderRadius: '3px 0 0 3px' }} />

      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${color}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {getTypeLabel(session.type)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
            {formatDate(session.date)}
          </div>
          {log != null && <FeelingDots feeling={log.feeling} />}
        </div>

        {isRun && log != null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {log.actualDistance != null && (
              <div style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: '-.01em', marginBottom: 2 }}>
                {formatDistance(log.actualDistance)}
              </div>
            )}
            {log.actualPace != null && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                {formatPace(log.actualPace)}
              </div>
            )}
            {log.heartRateAvg != null && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                <Heart size={10} color="var(--text-muted)" />
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

  const visible = applyFilter(doneSessions, filter);

  function pillStyle(active: boolean): React.CSSProperties {
    return {
      padding: '7px 16px', borderRadius: 20,
      background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
      border: `1px solid ${active ? 'rgba(99,102,241,.50)' : 'rgba(255,255,255,.08)'}`,
      color: active ? '#a5b4fc' : 'var(--text-muted)',
      fontSize: 12, fontWeight: active ? 600 : 500,
      cursor: 'pointer', transition: 'all .15s',
      backdropFilter: active ? 'blur(40px)' : 'none',
      WebkitBackdropFilter: active ? 'blur(40px)' : 'none',
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
          {PAGE_TITLE}
        </h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={pillStyle(filter === key)}
            >
              {label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: 80, gap: 12,
          }}>
            <ScrollText size={32} color="var(--text-muted)" />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
              {EMPTY_TITLE}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
              {EMPTY_SUBTITLE}
            </div>
          </div>
        ) : (
          visible.map((session) => (
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
