import { type FormEvent, useState } from 'react';
import type { FeelingScale, LogSessionPayload, TrainingSession } from '@paceplan/types';
import { SessionType } from '@paceplan/types';
import { Button } from '@/components/ui/button';
import { isRunningSession } from '../../services/sessionUtils';
import { sessionService } from '../../services/sessionService';
import { PaceInput } from '../SessionForm/PaceInput';
import { FeelingScalePicker } from './FeelingScale';

const LABEL_DISTANCIA = 'Distância real (km)';
const LABEL_PACE = 'Pace real';
const LABEL_BPM_AVG = 'BPM médio (opcional)';
const LABEL_BPM_MAX = 'BPM máximo (opcional)';
const LABEL_SENSACAO = 'Sensação';
const LABEL_NOTAS = 'Notas';
const PLACEHOLDER_NOTAS = 'Como foi o treino?';
const BTN_CONFIRMAR = 'Confirmar treino';
const BTN_CONFIRMANDO = 'Confirmando...';
const BTN_CANCELAR = 'Cancelar';
const ERROR_DISTANCE = 'Distância obrigatória e positiva';
const ERROR_PACE = 'Pace obrigatório. Use MM:SS (ex: 5:30)';
const ERROR_FEELING = 'Selecione uma sensação';
const PACE_REGEX = /^\d{1,2}:\d{2}$/;

interface LogFormErrors {
  distance?: string;
  pace?: string;
  feeling?: string;
}

interface LogFormProps {
  sessionId: string;
  sessionType: SessionType;
  targetDistance?: number | undefined;
  targetPace?: string | undefined;
  onSuccess: (session: TrainingSession) => void;
  onCancel: () => void;
}

export function LogForm({
  sessionId,
  sessionType,
  targetDistance,
  targetPace,
  onSuccess,
  onCancel,
}: LogFormProps) {
  const isRunning = isRunningSession(sessionType);

  const [distanceInput, setDistanceInput] = useState(
    isRunning && targetDistance != null ? String(targetDistance) : ''
  );
  const [pace, setPace] = useState(isRunning && targetPace != null ? targetPace : '');
  const [bpmAvg, setBpmAvg] = useState('');
  const [bpmMax, setBpmMax] = useState('');
  const [feeling, setFeeling] = useState<FeelingScale | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<LogFormErrors>({});

  function validate(): boolean {
    const next: LogFormErrors = {};
    if (isRunning) {
      const dist = Number(distanceInput);
      if (distanceInput === '' || isNaN(dist) || dist <= 0) next.distance = ERROR_DISTANCE;
      if (pace === '' || !PACE_REGEX.test(pace)) next.pace = ERROR_PACE;
    }
    if (feeling == null) next.feeling = ERROR_FEELING;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || feeling == null) return;

    const payload: LogSessionPayload = { feeling };

    if (isRunning) {
      payload.actualDistance = Number(distanceInput);
      payload.actualPace = pace;
      const avg = parseInt(bpmAvg, 10);
      const max = parseInt(bpmMax, 10);
      if (!isNaN(avg) && avg > 0) payload.heartRateAvg = avg;
      if (!isNaN(max) && max > 0) payload.heartRateMax = max;
    }

    if (notes.trim() !== '') payload.notes = notes.trim();

    setIsLoading(true);
    setServerError(null);
    try {
      const updated = await sessionService.log(sessionId, payload);
      onSuccess(updated);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao confirmar treino');
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {serverError != null && (
        <div className="error-box mb-3">
          {serverError}
        </div>
      )}

      {isRunning && (
        <>
          <span className="section-label">{LABEL_DISTANCIA}</span>
          <input
            type="number" value={distanceInput}
            onChange={(e) => setDistanceInput(e.target.value)}
            min="0" step="0.1" placeholder="0.0"
            className="input-glass"
          />
          {errors.distance != null && <span className="text-[11px] text-destructive mt-1">{errors.distance}</span>}

          <span className="section-label">{LABEL_PACE}</span>
          <PaceInput value={pace} onChange={setPace} />
          {errors.pace != null && <span className="text-[11px] text-destructive mt-1">{errors.pace}</span>}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="section-label">{LABEL_BPM_AVG}</span>
              <input
                type="number" value={bpmAvg}
                onChange={(e) => setBpmAvg(e.target.value)}
                min="0" step="1" placeholder="—"
                className="input-glass"
              />
            </div>
            <div>
              <span className="section-label">{LABEL_BPM_MAX}</span>
              <input
                type="number" value={bpmMax}
                onChange={(e) => setBpmMax(e.target.value)}
                min="0" step="1" placeholder="—"
                className="input-glass"
              />
            </div>
          </div>
        </>
      )}

      <span className="section-label">{LABEL_SENSACAO}</span>
      <FeelingScalePicker value={feeling} onChange={setFeeling} />
      {errors.feeling != null && <span className="text-[11px] text-destructive mt-1">{errors.feeling}</span>}

      <span className="section-label">{LABEL_NOTAS}</span>
      <textarea
        value={notes} onChange={(e) => setNotes(e.target.value)}
        rows={3} placeholder={PLACEHOLDER_NOTAS}
        className="input-glass resize-y leading-relaxed"
      />

      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-auto py-3.5 text-base rounded-xl bg-gradient-to-br from-success to-success-fg text-white shadow-success-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? BTN_CONFIRMANDO : BTN_CONFIRMAR}
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
