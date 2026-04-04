import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useWeek } from '../hooks/useWeek';
import { useSessions } from '../hooks/useSessions';
import { useMacrocycle } from '../hooks/useMacrocycle';
import { formatDate, getTypeColor, getTypeLabel, isToday, SESSION_ICONS } from '../services/sessionUtils';

const PAGE_TITLE = 'Semana';
const LABEL_ESTA_SEMANA = 'Esta semana';
const LABEL_FASE = 'FASE';
const LABEL_SEMANA = 'SEMANA';
const LABEL_DE = 'DE';
const LABEL_SETUP_MACRO = 'Configure seu macrociclo';
const LABEL_CONFIGURAR = 'Configurar';

export function WeekPage() {
  const navigate = useNavigate();
  const { weekStart, weekEnd, days, isCurrentWeek, goToPrevWeek, goToNextWeek } = useWeek();
  const { sessions, loading } = useSessions(weekStart, weekEnd);
  const { macrocycle, currentPhase, weekInPhase, totalWeeksInPhase, phaseProgressPct, loading: macroLoading } = useMacrocycle();

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
            {isCurrentWeek ? LABEL_ESTA_SEMANA : weekStart}
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

      {!macroLoading && (
        currentPhase ? (
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
            background: 'rgba(255,255,255,.03)',
            flexShrink: 0,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: '#818cf8', marginBottom: 5,
            }}>
              {LABEL_FASE} {currentPhase.order} · {LABEL_SEMANA} {weekInPhase} {LABEL_DE} {totalWeeksInPhase}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {currentPhase.name}
            </div>
            <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
              <div style={{
                width: `${phaseProgressPct}%`, height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, #6366f1, #818cf8)',
              }} />
            </div>
          </div>
        ) : macrocycle === null ? (
          <div style={{
            padding: '11px 16px', flexShrink: 0,
            background: 'rgba(99,102,241,.07)',
            borderBottom: '1px solid rgba(99,102,241,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: '#a5b4fc' }}>{LABEL_SETUP_MACRO}</span>
            <button
              onClick={() => navigate('/macrocycle')}
              style={{
                fontSize: 11, fontWeight: 600, color: '#a5b4fc',
                background: 'rgba(99,102,241,.18)',
                border: '1px solid rgba(99,102,241,.35)',
                borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
              }}
            >
              {LABEL_CONFIGURAR}
            </button>
          </div>
        ) : null
      )}

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

                {daySessions.map(session => {
                  const Icon = SESSION_ICONS[session.type];
                  const color = getTypeColor(session.type);
                  const isLongRun = session.type === 'LONG_RUN';
                  return (
                    <button
                      key={session.id}
                      onClick={() => navigate(`/sessions/${session.id}`)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '12px 14px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: isLongRun ? 'rgba(139,92,246,.05)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,.05)',
                        borderLeft: isLongRun ? '3px solid #8b5cf6' : 'none',
                        opacity: session.status === 'skipped' ? .45 : 1,
                        position: 'relative', overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      {!isLongRun && (
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '3px 0 0 3px' }} />
                      )}
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: `${color}1a`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {getTypeLabel(session.type)}
                          {isLongRun && (
                            <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,.15)', padding: '2px 6px', borderRadius: 4, verticalAlign: 'middle' }}>
                              principal
                            </span>
                          )}
                        </div>
                        {session.targetDistance != null && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {session.targetDistance} km
                            {session.targetPace != null && ` · ${session.targetPace}/km`}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 7, whiteSpace: 'nowrap',
                        background: session.status === 'done' ? 'rgba(34,197,94,.14)' : session.status === 'skipped' ? 'rgba(239,68,68,.12)' : 'rgba(255,255,255,.07)',
                        color: session.status === 'done' ? '#4ade80' : session.status === 'skipped' ? '#f87171' : 'var(--text-muted)',
                        border: `1px solid ${session.status === 'done' ? 'rgba(34,197,94,.2)' : session.status === 'skipped' ? 'rgba(239,68,68,.15)' : 'rgba(255,255,255,.1)'}`,
                      }}>
                        {session.status === 'done' ? 'Concluído' : session.status === 'skipped' ? 'Pulado' : 'Planejado'}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
