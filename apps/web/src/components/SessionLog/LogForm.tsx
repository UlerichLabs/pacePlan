import { type CSSProperties, type FormEvent, useState } from 'react';
import type { FeelingScale, LogSessionPayload, TrainingSession } from '@paceplan/types';
import { SessionType } from '@paceplan/types';
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

  const sectionLabel: CSSProperties = {
    fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
    textTransform: 'uppercase', color: 'var(--text-hint)',
    marginBottom: 8, marginTop: 20, display: 'block',
  };

  const inputStyle: CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.10)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'border-color .15s',
  };

  const errorText: CSSProperties = { fontSize: 11, color: '#f87171', marginTop: 4 };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      {serverError != null && (
        <div style={{
          marginBottom: 12, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.20)',
          color: '#f87171', fontSize: 13,
        }}>
          {serverError}
        </div>
      )}

      {isRunning && (
        <>
          <span style={sectionLabel}>{LABEL_DISTANCIA}</span>
          <input
            type="number" value={distanceInput}
            onChange={(e) => setDistanceInput(e.target.value)}
            min="0" step="0.1" placeholder="0.0"
            style={inputStyle}
          />
          {errors.distance != null && <span style={errorText}>{errors.distance}</span>}

          <span style={sectionLabel}>{LABEL_PACE}</span>
          <PaceInput value={pace} onChange={setPace} />
          {errors.pace != null && <span style={errorText}>{errors.pace}</span>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <span style={sectionLabel}>{LABEL_BPM_AVG}</span>
              <input
                type="number" value={bpmAvg}
                onChange={(e) => setBpmAvg(e.target.value)}
                min="0" step="1" placeholder="—"
                style={inputStyle}
              />
            </div>
            <div>
              <span style={sectionLabel}>{LABEL_BPM_MAX}</span>
              <input
                type="number" value={bpmMax}
                onChange={(e) => setBpmMax(e.target.value)}
                min="0" step="1" placeholder="—"
                style={inputStyle}
              />
            </div>
          </div>
        </>
      )}

      <span style={sectionLabel}>{LABEL_SENSACAO}</span>
      <FeelingScalePicker value={feeling} onChange={setFeeling} />
      {errors.feeling != null && <span style={errorText}>{errors.feeling}</span>}

      <span style={sectionLabel}>{LABEL_NOTAS}</span>
      <textarea
        value={notes} onChange={(e) => setNotes(e.target.value)}
        rows={3} placeholder={PLACEHOLDER_NOTAS}
        style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: '1.5' }}
      />

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="submit" disabled={isLoading}
          style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: 15, fontWeight: 600,
            border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(34,197,94,.25)',
            opacity: isLoading ? .6 : 1, transition: 'opacity .15s',
          }}
        >
          {isLoading ? BTN_CONFIRMANDO : BTN_CONFIRMAR}
        </button>
        <button
          type="button" onClick={onCancel} disabled={isLoading}
          style={{
            width: '100%', padding: '12px', borderRadius: 12,
            background: 'transparent', color: 'var(--text-muted)', fontSize: 14,
            border: '1px solid rgba(255,255,255,.08)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {BTN_CANCELAR}
        </button>
      </div>
    </form>
  );
}
