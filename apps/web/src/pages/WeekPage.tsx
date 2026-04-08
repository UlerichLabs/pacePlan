import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWeek, useSessions, useActiveContext, SESSION_ICONS } from '@paceplan/ui-logic';
import { formatDate, getTypeColor, getTypeLabel, isToday } from '@paceplan/utils';
import { ContextBanner } from '../components/WeekView/ContextBanner';

const PAGE_TITLE = 'Semana';
const LABEL_ESTA_SEMANA = 'Esta semana';

const STATUS_BADGE: Record<string, string> = {
  done:    'bg-success/14 text-success-fg border border-success/20',
  skipped: 'bg-destructive/12 text-destructive border border-destructive/15',
  planned: 'bg-surface text-[--text-muted] border border-[--border]',
};

const STATUS_LABEL: Record<string, string> = {
  done:    'Concluído',
  skipped: 'Pulado',
  planned: 'Planejado',
};

export function WeekPage() {
  const navigate = useNavigate();
  const { weekStart, weekEnd, days, isCurrentWeek, goToPrevWeek, goToNextWeek } = useWeek();
  const { sessions, loading } = useSessions(weekStart, weekEnd);
  const { context, responseCode, loading: contextLoading, notFound } = useActiveContext();

  useEffect(() => {
    if (notFound) {
      navigate('/macrocycle', { replace: true });
    }
  }, [notFound, navigate]);

  return (
    <div className="flex flex-col h-full">
      <header className="page-header gap-3 justify-between">
        <h1 className="text-[17px] font-semibold text-foreground">
          {PAGE_TITLE}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="flex p-1.5 text-[--text-muted] hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className={cn(
            'text-xs font-medium',
            isCurrentWeek ? 'text-primary' : 'text-[--text-secondary]'
          )}>
            {isCurrentWeek ? LABEL_ESTA_SEMANA : weekStart}
          </span>
          <button
            onClick={goToNextWeek}
            className="flex p-1.5 text-[--text-muted] hover:text-foreground transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={() => navigate('/new')}
          className="flex items-center justify-center w-8 h-8 rounded-[9px] bg-accent border border-primary/30 text-primary-subtle hover:bg-accent/80 transition-colors"
        >
          <Plus size={16} />
        </button>
      </header>

      <ContextBanner context={context} responseCode={responseCode} loading={contextLoading} />

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-[--text-muted] text-sm text-center pt-10">
            Carregando...
          </div>
        ) : (
          days.map(day => {
            const daySessions = sessions.filter(s => s.date === day);
            const today = isToday(day);
            return (
              <div
                key={day}
                className={cn(
                  'rounded-card mb-2 overflow-hidden glass',
                  today && 'border-primary/35 shadow-[0_0_0_1px_rgba(99,102,241,.2)]'
                )}
              >
                <div className={cn(
                  'flex items-center justify-between px-3.5 py-2.5',
                  daySessions.length > 0 && 'border-b border-[--border-subtle]'
                )}>
                  <span className={cn(
                    'text-[13px] font-semibold',
                    today ? 'text-primary' : 'text-[--text-secondary]'
                  )}>
                    {formatDate(day)}
                  </span>
                  <button
                    onClick={() => navigate(`/new?date=${day}`)}
                    className="w-7 h-7 rounded-lg bg-surface border border-[--border] text-[--text-muted] flex items-center justify-center hover:bg-surface-hover transition-colors"
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
                      style={{ '--session-color': color } as React.CSSProperties}
                      className={cn(
                        'w-full text-left px-3.5 py-3 flex items-center gap-3',
                        'border-b border-[--border-subtle] cursor-pointer',
                        'hover:bg-surface/50 transition-colors relative overflow-hidden',
                        isLongRun && 'bg-violet/5 border-l-[3px] border-l-violet',
                        session.status === 'skipped' && 'opacity-45'
                      )}
                    >
                      {!isLongRun && (
                        <div className="session-accent-bar bg-[--session-color]" />
                      )}
                      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 bg-[--session-color]/10">
                        <Icon size={16} color={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground mb-0.5">
                          {getTypeLabel(session.type)}
                          {isLongRun && (
                            <span className="ml-2 text-[9px] font-bold text-violet bg-violet/15 px-1.5 py-0.5 rounded align-middle">
                              principal
                            </span>
                          )}
                        </div>
                        {session.targetDistance != null && (
                          <div className="text-[11px] text-[--text-muted]">
                            {session.targetDistance} km
                            {session.targetPace != null && ` · ${session.targetPace}/km`}
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        'text-[10px] font-semibold px-[9px] py-[3px] rounded-[7px] whitespace-nowrap',
                        STATUS_BADGE[session.status]
                      )}>
                        {STATUS_LABEL[session.status]}
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
