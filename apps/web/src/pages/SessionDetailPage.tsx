import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  Pencil,
  RotateCcw,
  SkipForward,
  Trash2,
} from 'lucide-react';
import type { TrainingSession } from '@paceplan/types';
import { Button } from '@/components/ui/button';
import { LogForm } from '../components/SessionLog/LogForm';
import { sessionService } from '@paceplan/api-client';
import { SESSION_ICONS } from '@paceplan/ui-logic';
import {
  formatDate,
  formatDistance,
  formatPace,
  getTypeColor,
  getTypeLabel,
  isRunningSession,
} from '@paceplan/utils';
import { SectionLabel } from '../components/UI/SessionDetail/SectionLabel';
import { MetaRow } from '../components/UI/SessionDetail/MetaRow';
import { EnvironmentBadge } from '../components/UI/SessionDetail/EnvironmentBadge';
import { LogSummary } from '../components/UI/SessionDetail/LogSummary';
import { StatusBadge } from '../components/UI/SessionDetail/StatusBadge';

const PAGE_TITLE = 'Detalhes do treino';
const SECTION_PLANO = 'Plano';
const SECTION_CONCLUIR = 'Concluir treino';
const LABEL_DATA = 'Data';
const LABEL_DISTANCIA_ALVO = 'Distância alvo';
const LABEL_PACE_ALVO = 'Pace alvo';
const LABEL_AMBIENTE = 'Ambiente';
const LABEL_NOTAS = 'Notas';
const BTN_CONCLUIR = 'Concluir treino';
const BTN_PULAR = 'Pular treino';
const BTN_EDITAR = 'Editar';
const BTN_DELETAR = 'Deletar treino';
const BTN_REATIVAR = 'Reativar treino';
const CONFIRM_SKIP = 'Marcar este treino como pulado?';
const CONFIRM_DELETE = 'Deletar este treino? Esta ação não pode ser desfeita.';
const ERR_LOAD = 'Erro ao carregar sessão';
const ERR_DELETE = 'Erro ao deletar sessão';
const ERR_SKIP = 'Erro ao pular sessão';
const ERR_REACTIVATE = 'Erro ao reativar sessão';
const MSG_LOADING = 'Carregando...';
const MSG_NOT_FOUND = 'Sessão não encontrada';

const STATUS_CONFIG = {
  planned: { label: 'Planejado', variant: 'planned' as const },
  done:    { label: 'Concluído', variant: 'done'    as const },
  skipped: { label: 'Pulado',    variant: 'skipped' as const },
};

export function SessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    void sessionService.get(id ?? '').then((data) => {
      if (!cancelled) { setSession(data); setLoading(false); }
    }).catch((err: unknown) => {
      if (!cancelled) {
        setFetchError(err instanceof Error ? err.message : ERR_LOAD);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [id]);

  async function handleDelete() {
    if (session == null) return;
    if (!window.confirm(CONFIRM_DELETE)) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await sessionService.remove(session.id);
      navigate('/week');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : ERR_DELETE);
      setActionLoading(false);
    }
  }

  async function handleSkip() {
    if (session == null) return;
    if (!window.confirm(CONFIRM_SKIP)) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await sessionService.skip(session.id);
      setSession(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : ERR_SKIP);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate() {
    if (session == null) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await sessionService.reactivate(session.id);
      setSession(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : ERR_REACTIVATE);
    } finally {
      setActionLoading(false);
    }
  }

  function handleLogSuccess(updated: TrainingSession) {
    setSession(updated);
    setShowLogForm(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="page-header gap-3">
          <button onClick={() => navigate(-1)} className="flex p-1 text-[--text-muted]">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[17px] font-semibold text-foreground">{PAGE_TITLE}</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[--text-muted] text-sm">{MSG_LOADING}</span>
        </div>
      </div>
    );
  }

  if (fetchError != null || session == null) {
    return (
      <div className="flex flex-col h-full">
        <header className="page-header gap-3">
          <button onClick={() => navigate(-1)} className="flex p-1 text-[--text-muted]">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[17px] font-semibold text-foreground">{PAGE_TITLE}</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-destructive text-sm">{fetchError ?? MSG_NOT_FOUND}</p>
        </div>
      </div>
    );
  }

  const color = getTypeColor(session.type);
  const Icon = SESSION_ICONS[session.type];
  const statusCfg = STATUS_CONFIG[session.status];
  const withDist = isRunningSession(session.type);

  return (
    <div className="flex flex-col h-full">
      <header className="page-header gap-3">
        <button onClick={() => navigate(-1)} className="flex p-1 text-[--text-muted]">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[17px] font-semibold text-foreground flex-1">
          {getTypeLabel(session.type)}
        </h1>
        <StatusBadge statusCfg={statusCfg} />
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-8">

        <SectionLabel text={SECTION_PLANO} />

        <div className="glass rounded-card overflow-hidden">
          <div
            className="flex items-center gap-3 px-[14px] py-[14px] pl-[18px] relative border-b border-[--border-subtle]"
            style={{ '--session-color': color } as React.CSSProperties}
          >
            <div className="session-accent-bar bg-[--session-color]" />
            <div className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0 bg-[--session-color]/10">
              <Icon size={20} color={color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-foreground mb-0.5">
                {getTypeLabel(session.type)}
              </div>
              <div className="text-xs text-[--text-muted]">
                {formatDate(session.date)}
              </div>
            </div>
            {session.environment != null && (
              <EnvironmentBadge env={session.environment} />
            )}
          </div>

          <div className="px-3.5 pb-1">
            <MetaRow label={LABEL_DATA} value={formatDate(session.date)} />
            {withDist && session.targetDistance != null && (
              <MetaRow label={LABEL_DISTANCIA_ALVO} value={formatDistance(session.targetDistance)} />
            )}
            {withDist && session.targetPace != null && (
              <MetaRow label={LABEL_PACE_ALVO} value={formatPace(session.targetPace)} />
            )}
            {session.environment != null && (
              <div className="flex justify-between items-center py-2.5 border-b border-[--border-subtle]">
                <span className="text-sm text-[--text-muted]">{LABEL_AMBIENTE}</span>
                <EnvironmentBadge env={session.environment} />
              </div>
            )}
            {session.notes != null && session.notes !== '' && (
              <div className="py-2.5">
                <span className="text-[11px] text-[--text-hint] uppercase tracking-[.06em] font-semibold">
                  {LABEL_NOTAS}
                </span>
                <p className="text-sm text-[--text-secondary] mt-1 leading-relaxed">
                  {session.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {session.status === 'done' && session.log != null && (
          <LogSummary session={session} log={session.log} withDist={withDist} />
        )}

        {session.status === 'planned' && showLogForm && (
          <>
            <SectionLabel text={SECTION_CONCLUIR} />
            <LogForm
              sessionId={session.id}
              sessionType={session.type}
              targetDistance={session.targetDistance}
              targetPace={session.targetPace}
              onSuccess={handleLogSuccess}
              onCancel={() => setShowLogForm(false)}
            />
          </>
        )}

        {!showLogForm && (
          <div className="mt-7 flex flex-col gap-2.5">
            {actionError != null && (
              <div className="error-box">
                {actionError}
              </div>
            )}

            {session.status === 'planned' && (
              <>
                <Button
                  onClick={() => setShowLogForm(true)}
                  disabled={actionLoading}
                  className="w-full h-auto py-3.5 text-base rounded-xl bg-gradient-to-br from-success to-success-fg text-white shadow-success-glow disabled:opacity-60 gap-2"
                >
                  <CheckCircle2 size={17} />
                  {BTN_CONCLUIR}
                </Button>
                <Button
                  onClick={() => { void handleSkip(); }}
                  disabled={actionLoading}
                  className="w-full h-auto py-3 text-sm rounded-xl bg-warning-fg/8 text-warning-fg border border-warning-fg/18 disabled:opacity-60 gap-2"
                >
                  <SkipForward size={15} />
                  {BTN_PULAR}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/sessions/${session.id}/edit`)}
                  disabled={actionLoading}
                  className="w-full h-auto py-3 text-sm rounded-xl disabled:opacity-60 gap-2"
                >
                  <Pencil size={15} />
                  {BTN_EDITAR}
                </Button>
              </>
            )}

            {session.status === 'skipped' && (
              <Button
                onClick={() => { void handleReactivate(); }}
                disabled={actionLoading}
                className="w-full h-auto py-3.5 text-base rounded-xl bg-gradient-to-br from-primary to-violet shadow-primary-glow disabled:opacity-60 gap-2"
              >
                <RotateCcw size={17} />
                {BTN_REATIVAR}
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => { void handleDelete(); }}
              disabled={actionLoading}
              className="w-full h-auto py-3 text-sm rounded-xl disabled:opacity-60 gap-2"
            >
              <Trash2 size={15} />
              {BTN_DELETAR}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
