import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useWeek } from '../hooks/useWeek';
import { useSessions } from '../hooks/useSessions';
import { formatDate, isToday } from '../services/sessionUtils';

const PAGE_TITLE = 'Semana';

export function WeekPage() {
  const navigate = useNavigate();
  const { weekStart, weekEnd, days, isCurrentWeek, goToPrevWeek, goToNextWeek } = useWeek();
  const { sessions, loading } = useSessions(weekStart, weekEnd);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={goToPrevWeek}
            style={{ color: 'var(--text-muted)', display: 'flex', padding: 6 }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 12, color: isCurrentWeek ? 'var(--color-primary-s)' : 'var(--text-secondary)', fontWeight: 500 }}>
            {isCurrentWeek ? 'Esta semana' : weekStart}
          </span>
          <button
            onClick={goToNextWeek}
            style={{ color: 'var(--text-muted)', display: 'flex', padding: 6 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={() => navigate('/new')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(99,102,241,.18)',
            border: '1px solid rgba(99,102,241,.3)',
            color: '#a5b4fc',
          }}
        >
          <Plus size={16} />
        </button>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>
            Carregando...
          </div>
        ) : (
          days.map(day => {
            const daySessions = sessions.filter(s => s.date === day);
            const today = isToday(day);
            return (
              <div key={day} style={{
                borderRadius: 14, marginBottom: 8, overflow: 'hidden',
                background: 'var(--glass-bg)',
                border: today ? '1px solid rgba(99,102,241,.35)' : '1px solid var(--glass-border)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: today ? '0 0 0 1px rgba(99,102,241,.2)' : 'none',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: daySessions.length > 0 ? '1px solid rgba(255,255,255,.06)' : 'none',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: today ? 'var(--color-primary-s)' : 'var(--text-secondary)' }}>
                    {formatDate(day)}
                  </span>
                  <button
                    onClick={() => navigate(`/new?date=${day}`)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(255,255,255,.07)',
                      border: '1px solid rgba(255,255,255,.10)',
                      color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {daySessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 14px',
                      display: 'flex', alignItems: 'center',
                      background: 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,.05)',
                      opacity: session.status === 'skipped' ? .45 : 1,
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {session.type}
                    </span>
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
