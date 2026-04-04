import { type ChangeEvent } from 'react';
import { SESSION_TYPE_LABELS, SessionType } from '@paceplan/types';

interface SessionTypeSelectProps {
  value: SessionType;
  onChange: (t: SessionType) => void;
}

export function SessionTypeSelect({ value, onChange }: SessionTypeSelectProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value as SessionType);
  }

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
      {Object.values(SessionType).map((t) => (
        <option key={t} value={t} style={{ background: '#1a1d27' }}>
          {SESSION_TYPE_LABELS[t]}
        </option>
      ))}
    </select>
  );
}
