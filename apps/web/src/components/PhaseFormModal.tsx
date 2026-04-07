import { type CSSProperties, type FormEvent, useState } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
import { phaseService, PhaseApiError } from '../services/phaseService';

const TITLE = 'Nova Fase';
const LABEL_NOME = 'Nome da fase';
const LABEL_OBJETIVO = 'Objetivo';
const LABEL_DATA_INI = 'Data de início';
const LABEL_DATA_FIM = 'Data de término';
const LABEL_LONGAO = 'Meta de longão (km, opcional)';
const LABEL_VOLUME = 'Volume semanal alvo (km, opcional)';
const LABEL_SALVAR = 'Adicionar fase';
const LABEL_SALVANDO = 'Adicionando...';
const PLACEHOLDER_NOME = 'Fase 1 — Construção de Base';
const PLACEHOLDER_OBJETIVO = 'Consolidar corridas de até 8 km com conforto...';
const CODE_OUT_OF_BOUNDS = '400.021';
const CODE_OVERLAP = '409.020';

interface PhaseFormModalProps {
  macrocycleId: string;
  onSuccess: () => void;
  onClose: () => void;
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.10)',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'border-color .15s',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--text-hint)',
  marginBottom: 6,
  marginTop: 18,
  display: 'block',
};

function countWeeks(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(days / 7);
}

export function PhaseFormModal({ macrocycleId, onSuccess, onClose }: PhaseFormModalProps) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [longRunTarget, setLongRunTarget] = useState('');
  const [weeklyVolumeTarget, setWeeklyVolumeTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const weeksCount = startDate && endDate && startDate < endDate
    ? countWeeks(startDate, endDate)
    : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setSubmitting(true);

    try {
      await phaseService.create(macrocycleId, {
        name: name.trim(),
        objective: objective.trim(),
        startDate,
        endDate,
        ...(longRunTarget !== '' ? { longRunTarget: Number(longRunTarget) } : {}),
        ...(weeklyVolumeTarget !== '' ? { weeklyVolumeTarget: Number(weeklyVolumeTarget) } : {}),
      });
      onSuccess();
    } catch (err) {
      if (err instanceof PhaseApiError) {
        setError(err.message);
        setErrorCode(err.code);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isOutOfBounds = errorCode === CODE_OUT_OF_BOUNDS;
  const isOverlap = errorCode === CODE_OVERLAP;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, margin: '0 auto',
          background: 'rgba(18,20,30,.98)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: '20px 20px 0 0',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          maxHeight: '92dvh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            {TITLE}
          </span>
          <button
            onClick={onClose}
            style={{
              display: 'flex', padding: 6,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.10)',
              borderRadius: 8, cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 32px' }}>
          {error != null && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginTop: 16,
              padding: '12px 14px', borderRadius: 10,
              background: isOverlap ? 'rgba(234,179,8,.08)' : 'rgba(239,68,68,.10)',
              border: `1px solid ${isOverlap ? 'rgba(234,179,8,.25)' : 'rgba(239,68,68,.25)'}`,
            }}>
              <AlertCircle size={15} color={isOverlap ? '#fbbf24' : '#f87171'} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: isOverlap ? '#fbbf24' : '#f87171', lineHeight: 1.5 }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={labelStyle}>{LABEL_NOME}</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={PLACEHOLDER_NOME}
              required
              style={inputStyle}
            />

            <span style={labelStyle}>{LABEL_OBJETIVO}</span>
            <textarea
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder={PLACEHOLDER_OBJETIVO}
              rows={2}
              required
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span style={labelStyle}>{LABEL_DATA_INI}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    colorScheme: 'dark',
                    border: isOutOfBounds ? '1px solid rgba(239,68,68,.4)' : inputStyle.border,
                  }}
                />
              </div>
              <div>
                <span style={labelStyle}>{LABEL_DATA_FIM}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    colorScheme: 'dark',
                    border: isOutOfBounds ? '1px solid rgba(239,68,68,.4)' : inputStyle.border,
                  }}
                />
              </div>
            </div>

            {weeksCount != null && (
              <div style={{
                marginTop: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', borderRadius: 8,
                background: 'rgba(99,102,241,.10)',
                border: '1px solid rgba(99,102,241,.18)',
              }}>
                <Calendar size={12} color="#a5b4fc" />
                <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 500 }}>
                  {weeksCount} semana{weeksCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span style={labelStyle}>{LABEL_LONGAO}</span>
                <input
                  type="number"
                  value={longRunTarget}
                  onChange={e => setLongRunTarget(e.target.value)}
                  min="1" step="0.5" placeholder="10"
                  style={inputStyle}
                />
              </div>
              <div>
                <span style={labelStyle}>{LABEL_VOLUME}</span>
                <input
                  type="number"
                  value={weeklyVolumeTarget}
                  onChange={e => setWeeklyVolumeTarget(e.target.value)}
                  min="1" step="1" placeholder="20"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 28,
                width: '100%', padding: '13px', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,.35)',
                opacity: submitting ? 0.6 : 1,
                transition: 'opacity .15s',
              }}
            >
              {submitting ? LABEL_SALVANDO : LABEL_SALVAR}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
