import { type CSSProperties, type FormEvent, useState } from 'react';
import type { CreateSessionPayload } from '@paceplan/types';
import { SessionType } from '@paceplan/types';
import { hasDistance } from '../../services/sessionUtils';
import { PaceInput } from './PaceInput';
import { SessionTypeSelect } from './SessionTypeSelect';

const LABEL_TIPO = 'Tipo de treino';
const LABEL_DATA = 'Data';
const LABEL_DISTANCIA = 'Distância alvo (km)';
const LABEL_PACE = 'Pace alvo';
const LABEL_NOTAS = 'Notas';
const PLACEHOLDER_DISTANCE = '10.0';
const PLACEHOLDER_NOTAS = 'Observações opcionais...';
const BTN_SALVAR = 'Salvar treino';
const BTN_SALVANDO = 'Salvando...';
const BTN_CANCELAR = 'Cancelar';
const ERROR_DATE_REQUIRED = 'Data obrigatória';
const ERROR_DISTANCE_POSITIVE = 'Distância deve ser maior que zero';
const ERROR_PACE_FORMAT = 'Formato inválido. Use MM:SS (ex: 5:30)';

const PACE_REGEX = /^\d{1,2}:\d{2}$/;

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
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const withDistance = hasDistance(type);

  function handleTypeChange(t: SessionType) {
    setType(t);
    if (t === SessionType.REST_DAY) {
      setDistanceInput('');
      setPace('');
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!date) next.date = ERROR_DATE_REQUIRED;
    if (withDistance && distanceInput !== '' && Number(distanceInput) <= 0) {
      next.distance = ERROR_DISTANCE_POSITIVE;
    }
    if (withDistance && pace !== '' && !PACE_REGEX.test(pace)) {
      next.pace = ERROR_PACE_FORMAT;
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
      ...(withDistance && distanceInput !== '' ? { targetDistance: Number(distanceInput) } : {}),
      ...(withDistance && pace !== '' ? { targetPace: pace } : {}),
      ...(notes.trim() !== '' ? { notes: notes.trim() } : {}),
    };

    await onSubmit(payload);
  }

  const sectionLabel: CSSProperties = {
    fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
    textTransform: 'uppercase', color: 'var(--text-hint)',
    marginBottom: 8, marginTop: 20, display: 'block',
  };

  const inputBase: CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.10)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'border-color .15s',
  };

  const inputDisabled: CSSProperties = {
    ...inputBase,
    background: 'rgba(255,255,255,.03)',
    color: 'var(--text-hint)',
    cursor: 'not-allowed',
  };

  const errorText: CSSProperties = {
    fontSize: 11, color: '#f87171', marginTop: 4,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={sectionLabel}>{LABEL_TIPO}</span>
      <SessionTypeSelect value={type} onChange={handleTypeChange} />

      <span style={sectionLabel}>{LABEL_DATA}</span>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ ...inputBase, colorScheme: 'dark' }}
      />
      {errors.date != null && <span style={errorText}>{errors.date}</span>}

      <span style={sectionLabel}>{LABEL_DISTANCIA}</span>
      <input
        type="number"
        value={distanceInput}
        onChange={(e) => setDistanceInput(e.target.value)}
        disabled={!withDistance}
        min="0"
        step="0.1"
        placeholder={withDistance ? PLACEHOLDER_DISTANCE : '—'}
        style={withDistance ? inputBase : inputDisabled}
      />
      {errors.distance != null && <span style={errorText}>{errors.distance}</span>}

      <span style={sectionLabel}>{LABEL_PACE}</span>
      <PaceInput value={pace} onChange={setPace} disabled={!withDistance} />
      {errors.pace != null && <span style={errorText}>{errors.pace}</span>}

      <span style={sectionLabel}>{LABEL_NOTAS}</span>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder={PLACEHOLDER_NOTAS}
        style={{ ...inputBase, resize: 'vertical', lineHeight: '1.5' }}
      />

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 15, fontWeight: 600,
            border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(99,102,241,.35)',
            opacity: isLoading ? .6 : 1,
            transition: 'opacity .15s',
          }}
        >
          {isLoading ? BTN_SALVANDO : BTN_SALVAR}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            width: '100%', padding: '12px', borderRadius: 12,
            background: 'transparent',
            color: 'var(--text-muted)', fontSize: 14,
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
