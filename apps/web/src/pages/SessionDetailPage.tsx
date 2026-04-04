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
import { FEELING_LABELS } from '@paceplan/types';
import { LogForm } from '../components/SessionLog/LogForm';
import { sessionService } from '../services/sessionService';
import {
  SESSION_ICONS,
  formatDate,
  formatDistance,
  formatPace,
  formatPaceDelta,
  getTypeColor,
  getTypeLabel,
  hasDistance,
  isPaceFaster,
} from '../services/sessionUtils';

const PAGE_TITLE = 'Detalhes do treino';
const SECTION_PLANO = 'Plano';
const SECTION_RESULTADO = 'Resultado';
const SECTION_CONCLUIR = 'Concluir treino';
const LABEL_DATA = 'Data';
const LABEL_DISTANCIA_ALVO = 'Distância alvo';
const LABEL_PACE_ALVO = 'Pace alvo';
const LABEL_NOTAS = 'Notas';
const LABEL_DISTANCIA_REAL = 'Distância real';
const LABEL_PACE_REAL = 'Pace real';
const LABEL_SENSACAO = 'Sensação';
const BTN_CONCLUIR = 'Concluir treino';
const BTN_PULAR = 'Pular treino';
const BTN_EDITAR = 'Editar';
const BTN_DELETAR = 'Deletar treino';
const BTN_REATIVAR = 'Reativar treino';
const CONFIRM_DELETE = 'Tem certeza que deseja deletar este treino?';
const ERR_LOAD = 'Erro ao carregar sessão';
const ERR_DELETE = 'Erro ao deletar sessão';
const ERR_SKIP = 'Erro ao pular sessão';
const ERR_REACTIVATE = 'Erro ao reativar sessão';
const MSG_LOADING = 'Carregando...';
const MSG_NOT_FOUND = 'Sessão não encontrada';

const STATUS_CONFIG = {
  planned: { label: 'Planejado', bg: 'rgba(255,255,255,.07)',    color: 'var(--text-muted)',  border: 'rgba(255,255,255,.1)'  },
  done:    { label: 'Concluído', bg: 'rgba(34,197,94,.14)',      color: '#4ade80',             border: 'rgba(34,197,94,.2)'   },
  skipped: { label: 'Pulado',    bg: 'rgba(239,68,68,.12)',      color: '#f87171',             border: 'rgba(239,68,68,.15)'  },
};

function sectionLabel(text: string) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
      textTransform: 'uppercase', color: 'var(--text-hint)',
      marginBottom: 10, marginTop: 24,
    }}>
      {text}
    </p>
  );
}

function DeltaBadge({ text, positive }: { text: string; positive: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
      background: positive ? 'rgba(34,197,94,.14)' : 'rgba(239,68,68,.12)',
      color: positive ? '#4ade80' : '#f87171',
      border: `1px solid ${positive ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.15)'}`,
      marginLeft: 8, whiteSpace: 'nowrap' as const,
    }}>
      {text}
    </span>
  );
}

function MetaRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
        {children}
      </div>
    </div>
  );
}

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
    void sessionService.get(id ?? '').then(data => {
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

  const headerStyle = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(255,255,255,.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    flexShrink: 0,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <header style={headerStyle}>
          <button onClick={() => navigate(-1)} style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
            <ChevronLeft size={22} />
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{PAGE_TITLE}</h1>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{MSG_LOADING}</span>
        </div>
      </div>
    );
  }

  if (fetchError != null || session == null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <header style={headerStyle}>
          <button onClick={() => navigate(-1)} style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
            <ChevronLeft size={22} />
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{PAGE_TITLE}</h1>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <p style={{ color: '#f87171', fontSize: 14 }}>{fetchError ?? MSG_NOT_FOUND}</p>
        </div>
      </div>
    );
  }

  const color = getTypeColor(session.type);
  const Icon = SESSION_ICONS[session.type];
  const statusCfg = STATUS_CONFIG[session.status];
  const withDist = hasDistance(session.type);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={headerStyle}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
          {getTypeLabel(session.type)}
        </h1>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
          background: statusCfg.bg, color: statusCfg.color,
          border: `1px solid ${statusCfg.border}`, whiteSpace: 'nowrap' as const,
        }}>
          {statusCfg.label}
        </span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 32 }}>

        {sectionLabel(SECTION_PLANO)}

        <div style={{
          borderRadius: 14, overflow: 'hidden',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 14px 14px 18px',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '3px 0 0 3px' }} />
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: `${color}1a`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {getTypeLabel(session.type)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {formatDate(session.date)}
              </div>
            </div>
          </div>

          <div style={{ padding: '0 14px 4px' }}>
            <MetaRow label={LABEL_DATA} value={formatDate(session.date)} />
            {withDist && session.targetDistance != null && (
              <MetaRow label={LABEL_DISTANCIA_ALVO} value={formatDistance(session.targetDistance)} />
            )}
            {withDist && session.targetPace != null && (
              <MetaRow label={LABEL_PACE_ALVO} value={formatPace(session.targetPace)} />
            )}
            {session.notes != null && session.notes !== '' && (
              <div style={{ padding: '10px 0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                  {LABEL_NOTAS}
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                  {session.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {session.status === 'done' && session.log != null && (() => {
          const log = session.log;
          return (
            <>
              {sectionLabel(SECTION_RESULTADO)}
              <div style={{
                borderRadius: 14, overflow: 'hidden',
                background: 'var(--glass-bg)',
                border: '1px solid rgba(34,197,94,.18)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}>
                <div style={{ padding: '4px 14px 4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{LABEL_DISTANCIA_REAL}</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.actualDistance != null ? formatDistance(log.actualDistance) : '—'}
                      </span>
                      {withDist && session.targetDistance != null && log.actualDistance != null && (() => {
                        const diff = log.actualDistance - session.targetDistance;
                        const pos = diff >= 0;
                        const text = `${pos ? '+' : '−'}${Math.abs(diff).toFixed(1)} km`;
                        return <DeltaBadge text={text} positive={pos} />;
                      })()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{LABEL_PACE_REAL}</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.actualPace != null ? formatPace(log.actualPace) : '—'}
                      </span>
                      {withDist && session.targetPace != null && log.actualPace != null && (
                        <DeltaBadge
                          text={formatPaceDelta(log.actualPace, session.targetPace)}
                          positive={isPaceFaster(log.actualPace, session.targetPace)}
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{LABEL_SENSACAO}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {FEELING_LABELS[log.feeling]}
                    </span>
                  </div>

                  {log.notes != null && log.notes !== '' && (
                    <div style={{ padding: '10px 0' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                        {LABEL_NOTAS}
                      </span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                        {log.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        })()}

        {session.status === 'planned' && showLogForm && (
          <>
            {sectionLabel(SECTION_CONCLUIR)}
            <LogForm
              sessionId={session.id}
              targetDistance={session.targetDistance}
              targetPace={session.targetPace}
              onSuccess={handleLogSuccess}
              onCancel={() => setShowLogForm(false)}
            />
          </>
        )}

        {!showLogForm && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actionError != null && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.20)',
                color: '#f87171', fontSize: 13,
              }}>
                {actionError}
              </div>
            )}

            {session.status === 'planned' && (
              <>
                <button
                  onClick={() => setShowLogForm(true)}
                  disabled={actionLoading}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff', fontSize: 15, fontWeight: 600,
                    border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(34,197,94,.25)',
                    opacity: actionLoading ? .6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <CheckCircle2 size={17} />
                  {BTN_CONCLUIR}
                </button>
                <button
                  onClick={() => { void handleSkip(); }}
                  disabled={actionLoading}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: 'rgba(234,179,8,.08)',
                    color: '#fbbf24', fontSize: 14, fontWeight: 500,
                    border: '1px solid rgba(234,179,8,.18)',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? .6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <SkipForward size={15} />
                  {BTN_PULAR}
                </button>
                <button
                  onClick={() => navigate(`/sessions/${session.id}/edit`)}
                  disabled={actionLoading}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: 'transparent',
                    color: 'var(--text-secondary)', fontSize: 14,
                    border: '1px solid rgba(255,255,255,.10)',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Pencil size={15} />
                  {BTN_EDITAR}
                </button>
              </>
            )}

            {session.status === 'skipped' && (
              <button
                onClick={() => { void handleReactivate(); }}
                disabled={actionLoading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,.3)',
                  opacity: actionLoading ? .6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <RotateCcw size={17} />
                {BTN_REATIVAR}
              </button>
            )}

            <button
              onClick={() => { void handleDelete(); }}
              disabled={actionLoading}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: 'rgba(239,68,68,.08)',
                color: '#f87171', fontSize: 14,
                border: '1px solid rgba(239,68,68,.18)',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? .6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Trash2 size={15} />
              {BTN_DELETAR}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
