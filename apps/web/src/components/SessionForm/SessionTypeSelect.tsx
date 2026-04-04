import { type ChangeEvent } from 'react';
import { SESSION_TYPE_LABELS, SessionType } from '@paceplan/types';

const RUNNING_TYPES: SessionType[] = [
  SessionType.EASY_RUN,
  SessionType.QUALITY_RUN,
  SessionType.LONG_RUN,
  SessionType.PACE_RUN,
  SessionType.RECOVERY_RUN,
  SessionType.RACE,
];

const STRENGTH_TYPES: SessionType[] = [
  SessionType.STRENGTH_LOWER,
  SessionType.STRENGTH_UPPER,
];

const COMPLEMENTAR_TYPES: SessionType[] = [
  SessionType.MOBILITY,
  SessionType.REST,
];

const LABEL_GROUP_CORRIDA = 'Corrida';
const LABEL_GROUP_FORCA = 'Força';
const LABEL_GROUP_COMPLEMENTAR = 'Complementar';

interface SessionTypeSelectProps {
  value: SessionType;
  onChange: (t: SessionType) => void;
}

export function SessionTypeSelect({ value, onChange }: SessionTypeSelectProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value as SessionType);
  }

  const optStyle = { background: '#1a1d27' };

  return (
    <select
      value={value}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.10)',
        color: 'var(--text-primary)',
        fontSize: 14,
        appearance: 'none',
        cursor: 'pointer',
        outline: 'none',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <optgroup label={LABEL_GROUP_CORRIDA} style={optStyle}>
        {RUNNING_TYPES.map((t) => (
          <option key={t} value={t} style={optStyle}>
            {SESSION_TYPE_LABELS[t]}
          </option>
        ))}
      </optgroup>
      <optgroup label={LABEL_GROUP_FORCA} style={optStyle}>
        {STRENGTH_TYPES.map((t) => (
          <option key={t} value={t} style={optStyle}>
            {SESSION_TYPE_LABELS[t]}
          </option>
        ))}
      </optgroup>
      <optgroup label={LABEL_GROUP_COMPLEMENTAR} style={optStyle}>
        {COMPLEMENTAR_TYPES.map((t) => (
          <option key={t} value={t} style={optStyle}>
            {SESSION_TYPE_LABELS[t]}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
