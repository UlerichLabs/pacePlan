import { type FormEvent, useState } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { phaseService, PhaseApiError } from '@paceplan/api-client';

const TITLE = 'Nova Fase';
const LABEL_NOME = 'Nome da fase';
const LABEL_OBJETIVO = 'Objetivo';
const LABEL_DATA_INI = 'Data de início';
const LABEL_DATA_FIM = 'Data de término';
const LABEL_LONGAO = 'Meta de longão (km, opcional)';
const LABEL_VOLUME = 'Volume semanal alvo (km, opcional)';
const LABEL_SALVAR = 'Adicionar fase';
const LABEL_SALVANDO = 'Adicionando...';
const PLACEHOLDER_NOME = 'Fase 1 — Construção de Base';
const PLACEHOLDER_OBJETIVO = 'Consolidar corridas de até 8 km com conforto...';
const CODE_OUT_OF_BOUNDS = '400.021';
const CODE_OVERLAP = '409.020';

interface PhaseFormModalProps {
  macrocycleId: string;
  onSuccess: () => void;
  onClose: () => void;
}

function countWeeks(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(days / 7);
}

export function PhaseFormModal({ macrocycleId, onSuccess, onClose }: PhaseFormModalProps) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [longRunTarget, setLongRunTarget] = useState('');
  const [weeklyVolumeTarget, setWeeklyVolumeTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const weeksCount = startDate && endDate && startDate < endDate
    ? countWeeks(startDate, endDate)
    : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setSubmitting(true);

    try {
      await phaseService.create(macrocycleId, {
        name: name.trim(),
        objective: objective.trim(),
        startDate,
        endDate,
        ...(longRunTarget !== '' ? { longRunTarget: Number(longRunTarget) } : {}),
        ...(weeklyVolumeTarget !== '' ? { weeklyVolumeTarget: Number(weeklyVolumeTarget) } : {}),
      });
      onSuccess();
    } catch (err) {
      if (err instanceof PhaseApiError) {
        setError(err.message);
        setErrorCode(err.code);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isOutOfBounds = errorCode === CODE_OUT_OF_BOUNDS;
  const isOverlap = errorCode === CODE_OVERLAP;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[560px] mx-auto glass-strong rounded-t-modal max-h-[92dvh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 pt-[18px] pb-3.5 border-b border-[--border-subtle] shrink-0">
          <span className="text-[15px] font-bold text-foreground">
            {TITLE}
          </span>
          <button
            onClick={onClose}
            className="flex p-1.5 bg-surface border border-[--border] rounded-md text-[--text-muted] hover:bg-surface-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-1">
          {error != null && (
            <div className={cn(
              'warning-box mt-4',
              isOverlap
                ? 'bg-warning-fg/8 border border-warning-fg/25'
                : 'bg-destructive/10 border border-destructive/25'
            )}>
              <AlertCircle
                size={15}
                className={cn('shrink-0 mt-px', isOverlap ? 'text-warning-fg' : 'text-destructive')}
              />
              <span className={cn('text-[13px] leading-relaxed', isOverlap ? 'text-warning-fg' : 'text-destructive')}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <span className="section-label">{LABEL_NOME}</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={PLACEHOLDER_NOME}
              required
              className="input-glass"
            />

            <span className="section-label">{LABEL_OBJETIVO}</span>
            <textarea
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder={PLACEHOLDER_OBJETIVO}
              rows={2}
              required
              className="input-glass resize-y leading-relaxed"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="section-label">{LABEL_DATA_INI}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  className={cn('input-glass', isOutOfBounds && 'border-destructive/40')}
                />
              </div>
              <div>
                <span className="section-label">{LABEL_DATA_FIM}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                  className={cn('input-glass', isOutOfBounds && 'border-destructive/40')}
                />
              </div>
            </div>

            {weeksCount != null && (
              <div className="mt-2.5 flex items-center gap-1.5 px-3 py-2 rounded-md bg-accent border border-primary/18">
                <Calendar size={12} className="text-primary-subtle" />
                <span className="text-[11px] text-primary-subtle font-medium">
                  {weeksCount} semana{weeksCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="section-label">{LABEL_LONGAO}</span>
                <input
                  type="number"
                  value={longRunTarget}
                  onChange={e => setLongRunTarget(e.target.value)}
                  min="1" step="0.5" placeholder="10"
                  className="input-glass"
                />
              </div>
              <div>
                <span className="section-label">{LABEL_VOLUME}</span>
                <input
                  type="number"
                  value={weeklyVolumeTarget}
                  onChange={e => setWeeklyVolumeTarget(e.target.value)}
                  min="1" step="1" placeholder="20"
                  className="input-glass"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-7 w-full h-auto py-3.5 text-base rounded-xl bg-gradient-to-br from-primary to-violet shadow-primary-glow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? LABEL_SALVANDO : LABEL_SALVAR}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
