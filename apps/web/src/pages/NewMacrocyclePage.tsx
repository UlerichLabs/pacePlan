import { type FormEvent, useState } from 'react';
import { ChevronLeft, Target, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { macrocycleService } from '@paceplan/api-client';

const TITLE = 'Novo Projeto de Treino';
const LABEL_NOME = 'Nome do projeto';
const LABEL_DISTANCIA = 'Distância alvo (km)';
const LABEL_DATA_INICIO = 'Data de início';
const LABEL_DATA_PROVA = 'Data da prova';
const LABEL_CRIAR = 'Criar projeto';
const LABEL_CRIANDO = 'Criando...';
const PLACEHOLDER_NOME = 'Meia Maratona — Novembro 2026';
const MSG_SEMANAS = (n: number) => `Duração estimada: ${n} semana${n !== 1 ? 's' : ''}`;

function countWeeks(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(days / 7);
}

export function NewMacrocyclePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState('');
  const [goalDistance, setGoalDistance] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [raceDate, setRaceDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const weeksCount = startDate && raceDate && startDate < raceDate
    ? countWeeks(startDate, raceDate)
    : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setConflictError(null);
    setFieldError(null);

    const goal = Number(goalDistance);
    if (isNaN(goal)) return;

    setSubmitting(true);
    try {
      await macrocycleService.create({ name: name.trim(), goalDistance: goal, startDate, raceDate });
      navigate('/week', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.';
      if (err instanceof Error && err.message.includes('ativo')) {
        setConflictError(message);
      } else {
        setFieldError(message);
      }
    } finally {
      setSubmitting(false);
    }
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
        <h1 className="text-[17px] font-semibold text-foreground">
          {TITLE}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-12">
        {conflictError != null && (
          <div className="flex items-start gap-2.5 mb-5 px-4 py-3.5 rounded-xl bg-destructive/10 border border-destructive/25">
            <AlertCircle size={16} className="text-destructive shrink-0 mt-px" />
            <span className="text-[13px] text-destructive leading-relaxed">
              {conflictError}
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

          <span className="section-label">{LABEL_DISTANCIA}</span>
          <input
            type="number"
            value={goalDistance}
            onChange={e => setGoalDistance(e.target.value)}
            min="0.1"
            step="0.1"
            placeholder="21.1"
            required
            className="input-glass"
          />

          <span className="section-label">{LABEL_DATA_INICIO}</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
            className="input-glass"
          />

          <span className="section-label">{LABEL_DATA_PROVA}</span>
          <input
            type="date"
            value={raceDate}
            onChange={e => setRaceDate(e.target.value)}
            required
            className="input-glass"
          />

          {weeksCount != null && (
            <div className="mt-3.5 flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-accent border border-primary/20">
              <Calendar size={13} className="text-primary-subtle" />
              <span className="text-xs text-primary-subtle font-medium">
                {MSG_SEMANAS(weeksCount)}
              </span>
            </div>
          )}

          {fieldError != null && (
            <div className="error-box mt-3.5">
              {fieldError}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="mt-7 w-full h-auto py-3.5 text-base rounded-xl bg-gradient-to-br from-primary to-violet shadow-primary-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? LABEL_CRIANDO : LABEL_CRIAR}
          </Button>
        </form>
      </div>
    </div>
  );
}
