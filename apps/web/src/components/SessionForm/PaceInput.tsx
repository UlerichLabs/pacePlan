import { type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

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
      className={cn(
        'input-glass',
        !isValid && 'border-destructive/40'
      )}
    />
  );
}
