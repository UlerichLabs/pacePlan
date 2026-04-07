import { type CSSProperties, type FormEvent, useState } from 'react';
import { ChevronLeft, Target, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { macrocycleService, MacrocycleApiError } from '../services/macrocycleService';

const TITLE = 'Novo Projeto de Treino';
const LABEL_NOME = 'Nome do projeto';
const LABEL_DISTANCIA = 'Distância alvo (km)';
const LABEL_DATA_INICIO = 'Data de início';
const LABEL_DATA_PROVA = 'Data da prova';
const LABEL_CRIAR = 'Criar projeto';
const LABEL_CRIANDO = 'Criando...';
const PLACEHOLDER_NOME = 'Meia Maratona — Novembro 2026';
const MSG_SEMANAS = (n: number) => `Duração estimada: ${n} semana${n !== 1 ? 's' : ''}`;

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
  marginTop: 20,
  display: 'block',
};

function countWeeks(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(days / 7);
}

export function NewMacrocyclePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState('');
  const [goalDistance, setGoalDistance] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [raceDate, setRaceDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const weeksCount = startDate && raceDate && startDate < raceDate
    ? countWeeks(startDate, raceDate)
    : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setConflictError(null);
    setFieldError(null);

    const goal = Number(goalDistance);
    if (isNaN(goal)) return;

    setSubmitting(true);
    try {
      await macrocycleService.create({ name: name.trim(), goalDistance: goal, startDate, raceDate });
      navigate('/week', { replace: true });
    } catch (err) {
      if (err instanceof MacrocycleApiError) {
        if (err.statusCode === 409) {
          setConflictError(err.message);
        } else {
          setFieldError(err.message);
        }
      } else {
        setFieldError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ color: 'var(--text-muted)', display: 'flex', padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronLeft size={22} />
        </button>
        <Target size={17} color="#a5b4fc" />
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {TITLE}
        </h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 48px' }}>
        {conflictError != null && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 20,
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(239,68,68,.10)',
            border: '1px solid rgba(239,68,68,.25)',
          }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: '#f87171', lineHeight: '1.5' }}>
              {conflictError}
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

          <span style={labelStyle}>{LABEL_DISTANCIA}</span>
          <input
            type="number"
            value={goalDistance}
            onChange={e => setGoalDistance(e.target.value)}
            min="0.1"
            step="0.1"
            placeholder="21.1"
            required
            style={inputStyle}
          />

          <span style={labelStyle}>{LABEL_DATA_INICIO}</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />

          <span style={labelStyle}>{LABEL_DATA_PROVA}</span>
          <input
            type="date"
            value={raceDate}
            onChange={e => setRaceDate(e.target.value)}
            required
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />

          {weeksCount != null && (
            <div style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(99,102,241,.10)',
              border: '1px solid rgba(99,102,241,.20)',
            }}>
              <Calendar size={13} color="#a5b4fc" />
              <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 500 }}>
                {MSG_SEMANAS(weeksCount)}
              </span>
            </div>
          )}

          {fieldError != null && (
            <div style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,.10)',
              border: '1px solid rgba(239,68,68,.20)',
              color: '#f87171',
              fontSize: 13,
            }}>
              {fieldError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 28,
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,.35)',
              opacity: submitting ? 0.6 : 1,
              transition: 'opacity .15s',
            }}
          >
            {submitting ? LABEL_CRIANDO : LABEL_CRIAR}
          </button>
        </form>
      </div>
    </div>
  );
}
