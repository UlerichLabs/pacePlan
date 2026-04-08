import { type FormEvent, useState } from 'react';
import type { CreateSessionPayload } from '@paceplan/types';
import { Environment, SessionType } from '@paceplan/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isRunningSession } from '../../services/sessionUtils';
import { PaceInput } from './PaceInput';
import { SessionTypeSelect } from './SessionTypeSelect';

const LABEL_TIPO = 'Tipo de treino';
const LABEL_DATA = 'Data';
const LABEL_DISTANCIA = 'Distância alvo (km)';
const LABEL_PACE = 'Pace alvo';
const LABEL_AMBIENTE = 'Ambiente';
const LABEL_NOTAS = 'Notas';
const PLACEHOLDER_DISTANCE = '8.0';
const BTN_ESTEIRA = 'Esteira';
const BTN_RUA = 'Rua';
const BTN_SALVAR = 'Salvar treino';
const BTN_SALVANDO = 'Salvando...';
const BTN_CANCELAR = 'Cancelar';
const ERROR_DATE_REQUIRED = 'Data obrigatória';
const ERROR_DISTANCE_REQUIRED = 'Informe a distância alvo para corridas';
const ERROR_DISTANCE_POSITIVE = 'Distância deve ser maior que zero';
const ERROR_PACE_FORMAT = 'Formato inválido. Use MM:SS (ex: 5:30)';

const PACE_REGEX = /^\d{1,2}:\d{2}$/;

const NOTES_PLACEHOLDER: Record<SessionType, string> = {
  [SessionType.EASY_RUN]:       'Manter BPM abaixo de 160, focar na cadência...',
  [SessionType.QUALITY_RUN]:    'Manter BPM abaixo de 160, focar na cadência...',
  [SessionType.LONG_RUN]:       'Manter BPM abaixo de 160, focar na cadência...',
  [SessionType.PACE_RUN]:       'Manter BPM abaixo de 160, focar na cadência...',
  [SessionType.RECOVERY_RUN]:   'Manter BPM abaixo de 160, focar na cadência...',
  [SessionType.RACE]:           'Manter BPM abaixo de 160, focar na cadência...',
  [SessionType.STRENGTH_LOWER]: 'Agachamento 4x12, Leg Press 3x15, Panturrilha 4x20...',
  [SessionType.STRENGTH_UPPER]: 'Supino 4x12, Remada 3x12, Prancha 3x60s...',
  [SessionType.MOBILITY]:       'Alongamento de quadril, mobilidade de tornozelo...',
  [SessionType.REST]:           'Dia de descanso completo',
};

interface FormErrors {
  date?: string;
  distance?: string;
  pace?: string;
}

interface SessionFormProps {
  onSubmit: (payload: CreateSessionPayload) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  defaultDate?: string | undefined;
}

export function SessionForm({ onSubmit, onCancel, isLoading, defaultDate }: SessionFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<SessionType>(SessionType.EASY_RUN);
  const [date, setDate] = useState(defaultDate ?? today);
  const [distanceInput, setDistanceInput] = useState('');
  const [pace, setPace] = useState('');
  const [environment, setEnvironment] = useState<Environment>(Environment.TREADMILL);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const withRunning = isRunningSession(type);

  function handleTypeChange(t: SessionType) {
    setType(t);
    if (!isRunningSession(t)) {
      setDistanceInput('');
      setPace('');
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!date) next.date = ERROR_DATE_REQUIRED;
    if (withRunning) {
      if (distanceInput === '') {
        next.distance = ERROR_DISTANCE_REQUIRED;
      } else if (Number(distanceInput) <= 0) {
        next.distance = ERROR_DISTANCE_POSITIVE;
      }
      if (pace !== '' && !PACE_REGEX.test(pace)) {
        next.pace = ERROR_PACE_FORMAT;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateSessionPayload = {
      date,
      type,
      ...(withRunning && distanceInput !== '' ? { targetDistance: Number(distanceInput) } : {}),
      ...(withRunning && pace !== '' ? { targetPace: pace } : {}),
      ...(withRunning ? { environment } : {}),
      ...(notes.trim() !== '' ? { notes: notes.trim() } : {}),
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <span className="section-label">{LABEL_TIPO}</span>
      <SessionTypeSelect value={type} onChange={handleTypeChange} />

      <span className="section-label">{LABEL_DATA}</span>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input-glass"
      />
      {errors.date != null && <span className="text-[11px] text-destructive mt-1">{errors.date}</span>}

      {withRunning && (
        <>
          <span className="section-label">{LABEL_DISTANCIA}</span>
          <input
            type="number"
            value={distanceInput}
            onChange={(e) => setDistanceInput(e.target.value)}
            min="0"
            step="0.1"
            placeholder={PLACEHOLDER_DISTANCE}
            className="input-glass"
          />
          {errors.distance != null && <span className="text-[11px] text-destructive mt-1">{errors.distance}</span>}

          <span className="section-label">{LABEL_PACE}</span>
          <PaceInput value={pace} onChange={setPace} />
          {errors.pace != null && <span className="text-[11px] text-destructive mt-1">{errors.pace}</span>}

          <span className="section-label">{LABEL_AMBIENTE}</span>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setEnvironment(Environment.TREADMILL)}
              className={cn(
                'flex-1 px-3.5 py-[11px] rounded-md text-sm transition-all duration-150',
                environment === Environment.TREADMILL
                  ? 'bg-accent border border-primary/45 text-primary-subtle font-semibold'
                  : 'bg-surface border border-[--border] text-[--text-muted] font-medium'
              )}
            >
              {BTN_ESTEIRA}
            </button>
            <button
              type="button"
              onClick={() => setEnvironment(Environment.OUTDOOR)}
              className={cn(
                'flex-1 px-3.5 py-[11px] rounded-md text-sm transition-all duration-150',
                environment === Environment.OUTDOOR
                  ? 'bg-accent border border-primary/45 text-primary-subtle font-semibold'
                  : 'bg-surface border border-[--border] text-[--text-muted] font-medium'
              )}
            >
              {BTN_RUA}
            </button>
          </div>
        </>
      )}

      <span className="section-label">{LABEL_NOTAS}</span>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder={NOTES_PLACEHOLDER[type]}
        className="input-glass resize-y leading-relaxed"
      />

      <div className="mt-7 flex flex-col gap-2.5">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-auto py-3.5 text-base rounded-xl bg-gradient-to-br from-primary to-violet shadow-primary-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? BTN_SALVANDO : BTN_SALVAR}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full h-auto py-3 text-sm rounded-xl disabled:cursor-not-allowed"
        >
          {BTN_CANCELAR}
        </Button>
      </div>
    </form>
  );
}
