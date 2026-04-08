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

  return (
    <select
      value={value}
      onChange={handleChange}
      className="input-glass appearance-none cursor-pointer"
    >
      <optgroup label={LABEL_GROUP_CORRIDA} className="bg-popover">
        {RUNNING_TYPES.map((t) => (
          <option key={t} value={t} className="bg-popover">
            {SESSION_TYPE_LABELS[t]}
          </option>
        ))}
      </optgroup>
      <optgroup label={LABEL_GROUP_FORCA} className="bg-popover">
        {STRENGTH_TYPES.map((t) => (
          <option key={t} value={t} className="bg-popover">
            {SESSION_TYPE_LABELS[t]}
          </option>
        ))}
      </optgroup>
      <optgroup label={LABEL_GROUP_COMPLEMENTAR} className="bg-popover">
        {COMPLEMENTAR_TYPES.map((t) => (
          <option key={t} value={t} className="bg-popover">
            {SESSION_TYPE_LABELS[t]}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
