import { type ChangeEvent } from 'react';

const PLACEHOLDER_PACE = '5:30';
const PACE_REGEX = /^\d{1,2}:\d{2}$/;

interface PaceInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function PaceInput({ value, onChange, disabled = false }: PaceInputProps) {
  const isValid = value === '' || PACE_REGEX.test(value);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <input
      type="text"
      placeholder={disabled ? '—' : PLACEHOLDER_PACE}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        background: disabled ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)',
        border: `1px solid ${isValid ? 'rgba(255,255,255,.10)' : 'rgba(239,68,68,.4)'}`,
        color: disabled ? 'var(--text-hint)' : 'var(--text-primary)',
        fontSize: 14,
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'border-color .15s',
      }}
    />
  );
}
