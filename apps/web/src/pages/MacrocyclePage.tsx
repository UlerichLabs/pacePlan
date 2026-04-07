import { type CSSProperties, useState } from 'react';
import { ChevronLeft, Plus, Target, Archive, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMacrocycle } from '../hooks/useMacrocycle';
import { macrocycleService } from '../services/macrocycleService';
import { PhaseFormModal } from '../components/PhaseFormModal';

const PAGE_TITLE = 'Macrociclo';
const LABEL_FASES = 'FASES';
const LABEL_ADD_FASE = 'Adicionar fase';
const LABEL_CARREGANDO = 'Carregando...';
const LABEL_SEMANAS = 'semanas';
const LABEL_LONGAO_META = 'longão meta';
const LABEL_VOLUME_META = 'volume meta/sem';
const LABEL_ARQUIVAR = 'Arquivar plano';
const LABEL_ARQUIVANDO = 'Arquivando...';
const LABEL_EMPTY_TITLE = 'Nenhum projeto de treino ativo';
const LABEL_EMPTY_DESC = 'Crie um projeto para organizar suas semanas de treino até a sua próxima prova.';
const LABEL_EMPTY_CTA = 'Criar projeto de treino';
const CONFIRM_ARCHIVE = 'Tem certeza que deseja arquivar este projeto? Você poderá criar um novo em seguida.';

const sectionLabel: CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
  textTransform: 'uppercase', color: 'var(--text-hint)',
  marginBottom: 8, marginTop: 20, display: 'block',
};

function countWeeks(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(days / 7);
}

export function MacrocyclePage() {
  const navigate = useNavigate();
  const { macrocycle, phases, loading, error, refetch } = useMacrocycle();
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [archiving, setArchiving] = useState(false);

  async function handleArchive() {
    if (!window.confirm(CONFIRM_ARCHIVE)) return;
    setArchiving(true);
    try {
      await macrocycleService.archiveActive();
      await refetch();
    } catch {
      // noop
    } finally {
      setArchiving(false);
    }
  }

  function handlePhaseSuccess() {
    setShowPhaseModal(false);
    void refetch();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-muted)', display: 'flex', padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={22} />
        </button>
        <Target size={17} color="#a5b4fc" />
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
          {PAGE_TITLE}
        </h1>
        {macrocycle != null && (
          <button
            onClick={handleArchive}
            disabled={archiving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600,
              color: archiving ? 'var(--text-hint)' : 'var(--text-muted)',
              background: 'none', border: 'none', cursor: archiving ? 'not-allowed' : 'pointer',
              padding: '6px 4px',
            }}
          >
            <Archive size={15} />
            {archiving ? LABEL_ARQUIVANDO : LABEL_ARQUIVAR}
          </button>
        )}
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-muted)', fontSize: 14 }}>
            {LABEL_CARREGANDO}
          </div>
        ) : error != null ? (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.20)',
            color: '#f87171', fontSize: 13,
          }}>
            {error}
          </div>
        ) : macrocycle === null ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center',
            padding: '60px 24px', gap: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'rgba(99,102,241,.12)',
              border: '1px solid rgba(99,102,241,.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FolderOpen size={28} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {LABEL_EMPTY_TITLE}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 260 }}>
                {LABEL_EMPTY_DESC}
              </div>
            </div>
            <button
              onClick={() => navigate('/macrocycle/new')}
              style={{
                marginTop: 8, padding: '13px 28px', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,.35)',
              }}
            >
              {LABEL_EMPTY_CTA}
            </button>
          </div>
        ) : (
          <>
            <div style={{
              borderRadius: 14, padding: '16px 18px', marginBottom: 20,
              background: 'rgba(255,255,255,0.065)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#818cf8', marginBottom: 6 }}>
                MACROCICLO ATIVO
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {macrocycle.name}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{macrocycle.goalDistance} km</span>
                <span>Prova: {macrocycle.raceDate}</span>
                <span>{countWeeks(macrocycle.startDate, macrocycle.raceDate)} {LABEL_SEMANAS}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ ...sectionLabel, marginTop: 0 }}>
                {LABEL_FASES}
              </span>
              {phases.length < 6 && (
                <button
                  onClick={() => setShowPhaseModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, color: '#a5b4fc',
                    background: 'rgba(99,102,241,.12)',
                    border: '1px solid rgba(99,102,241,.25)',
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                  {LABEL_ADD_FASE}
                </button>
              )}
            </div>

            {phases.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '32px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,.03)',
                border: '1px dashed rgba(255,255,255,.10)',
                color: 'var(--text-muted)', fontSize: 13, marginBottom: 16,
              }}>
                Nenhuma fase criada ainda. Adicione a primeira fase do seu plano.
              </div>
            )}

            {phases
              .slice()
              .sort((a, b) => a.order - b.order)
              .map(phase => (
                <div key={phase.id} style={{
                  borderRadius: 12, marginBottom: 8, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.065)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#818cf8', marginBottom: 3 }}>
                        FASE {phase.order}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {phase.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                      <div>{phase.startDate}</div>
                      <div>{phase.endDate}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {phase.objective}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {phase.longRunTarget != null && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 6, padding: '3px 8px' }}>
                        {LABEL_LONGAO_META}: {phase.longRunTarget} km
                      </span>
                    )}
                    {phase.weeklyVolumeTarget != null && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(34,197,94,.10)', border: '1px solid rgba(34,197,94,.18)', borderRadius: 6, padding: '3px 8px' }}>
                        {LABEL_VOLUME_META}: {phase.weeklyVolumeTarget} km/sem
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>

      {showPhaseModal && macrocycle != null && (
        <PhaseFormModal
          macrocycleId={macrocycle.id}
          onSuccess={handlePhaseSuccess}
          onClose={() => setShowPhaseModal(false)}
        />
      )}
    </div>
  );
}
