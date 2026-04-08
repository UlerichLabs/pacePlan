import { useState } from 'react';
import { ChevronLeft, Plus, Target, Archive, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMacrocycle } from '@paceplan/ui-logic';
import { macrocycleService } from '@paceplan/api-client';
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
    } finally {
      setArchiving(false);
    }
  }

  function handlePhaseSuccess() {
    setShowPhaseModal(false);
    void refetch();
  }

  return (
    <div className="flex flex-col h-full">
      <header className="page-header gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex p-1 text-[--text-muted] hover:text-foreground transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <Target size={17} className="text-primary-subtle" />
        <h1 className="text-[17px] font-semibold text-foreground flex-1">
          {PAGE_TITLE}
        </h1>
        {macrocycle != null && (
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="flex items-center gap-1.5 text-xs font-semibold text-[--text-muted] hover:text-foreground transition-colors px-1 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Archive size={15} />
            {archiving ? LABEL_ARQUIVANDO : LABEL_ARQUIVAR}
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        {loading ? (
          <div className="text-center pt-[60px] text-[--text-muted] text-sm">
            {LABEL_CARREGANDO}
          </div>
        ) : error != null ? (
          <div className="error-box">
            {error}
          </div>
        ) : macrocycle === null ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-[60px] gap-4">
            <div className="w-16 h-16 rounded-[20px] bg-accent border border-primary/20 flex items-center justify-center">
              <FolderOpen size={28} className="text-primary-subtle" />
            </div>
            <div>
              <div className="text-base font-bold text-foreground mb-2">
                {LABEL_EMPTY_TITLE}
              </div>
              <div className="text-[13px] text-[--text-muted] leading-relaxed max-w-[260px]">
                {LABEL_EMPTY_DESC}
              </div>
            </div>
            <Button
              onClick={() => navigate('/macrocycle/new')}
              className="mt-2 h-auto px-7 py-3.5 text-base rounded-xl bg-gradient-to-br from-primary to-violet shadow-primary-glow"
            >
              {LABEL_EMPTY_CTA}
            </Button>
          </div>
        ) : (
          <>
            <div className="glass rounded-card px-[18px] py-4 mb-5">
              <div className="text-[10px] font-bold tracking-[.08em] uppercase text-primary-subtle mb-1.5">
                MACROCICLO ATIVO
              </div>
              <div className="text-[18px] font-bold text-foreground mb-1">
                {macrocycle.name}
              </div>
              <div className="flex gap-4 text-xs text-[--text-muted]">
                <span>{macrocycle.goalDistance} km</span>
                <span>Prova: {macrocycle.raceDate}</span>
                <span>{countWeeks(macrocycle.startDate, macrocycle.raceDate)} {LABEL_SEMANAS}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="section-label mt-0 mb-0">
                {LABEL_FASES}
              </span>
              {phases.length < 6 && (
                <button
                  onClick={() => setShowPhaseModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-subtle bg-accent border border-primary/25 rounded-lg px-3 py-1.5 hover:bg-accent/80 transition-colors"
                >
                  <Plus size={13} />
                  {LABEL_ADD_FASE}
                </button>
              )}
            </div>

            {phases.length === 0 && (
              <div className="text-center px-4 py-8 rounded-card bg-surface border border-dashed border-[--border] text-[--text-muted] text-[13px] mb-4">
                Nenhuma fase criada ainda. Adicione a primeira fase do seu plano.
              </div>
            )}

            {phases
              .slice()
              .sort((a, b) => a.order - b.order)
              .map(phase => (
                <div key={phase.id} className="glass rounded-lg mb-2 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <div className="text-[10px] font-semibold text-primary-subtle mb-[3px]">
                        FASE {phase.order}
                      </div>
                      <div className="text-sm font-bold text-foreground">
                        {phase.name}
                      </div>
                    </div>
                    <div className="text-right shrink-0 text-[11px] text-[--text-muted]">
                      <div>{phase.startDate}</div>
                      <div>{phase.endDate}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-[--text-secondary] mb-2">
                    {phase.objective}
                  </div>
                  <div className="flex gap-3">
                    {phase.longRunTarget != null && (
                      <span className="text-[10px] text-[--text-muted] bg-violet/12 border border-violet/20 rounded-md px-2 py-[3px]">
                        {LABEL_LONGAO_META}: {phase.longRunTarget} km
                      </span>
                    )}
                    {phase.weeklyVolumeTarget != null && (
                      <span className="text-[10px] text-[--text-muted] bg-success/10 border border-success/18 rounded-md px-2 py-[3px]">
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
