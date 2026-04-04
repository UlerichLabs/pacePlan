import { type CSSProperties, type FormEvent, useState } from 'react';
import { ChevronLeft, Plus, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMacrocycle } from '../hooks/useMacrocycle';
import { macrocycleService } from '../services/macrocycleService';
import type { CreateMacrocyclePayload, CreatePhasePayload } from '../services/macrocycleService';

const PAGE_TITLE = 'Macrociclo';
const LABEL_NOME = 'Nome do macrociclo';
const LABEL_DISTANCIA = 'Distância objetivo (km)';
const LABEL_DATA_PROVA = 'Data da prova';
const LABEL_DATA_INICIO = 'Data de início';
const LABEL_CRIAR_MACRO = 'Criar macrociclo';
const LABEL_CRIANDO = 'Criando...';
const LABEL_FASES = 'FASES';
const LABEL_ADD_FASE = 'Adicionar fase';
const LABEL_NOME_FASE = 'Nome da fase';
const LABEL_OBJETIVO = 'Objetivo da fase';
const LABEL_DATA_INI = 'Data de início';
const LABEL_DATA_FIM = 'Data de término';
const LABEL_LONGAO = 'Meta de longão (km, opcional)';
const LABEL_VOLUME = 'Volume semanal alvo (km, opcional)';
const LABEL_SALVAR_FASE = 'Salvar fase';
const LABEL_SALVANDO = 'Salvando...';
const LABEL_CANCELAR = 'Cancelar';
const LABEL_CARREGANDO = 'Carregando...';
const LABEL_SEMANAS = 'semanas';
const LABEL_LONGAO_META = 'longão meta';
const LABEL_VOLUME_META = 'volume meta/sem';
const PLACEHOLDER_NOME = 'Meia Maratona — Novembro 2026';
const PLACEHOLDER_OBJETIVO = 'Consolidar 10 km de forma confortável...';

const inputStyle: CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.10)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'border-color .15s',
};

const sectionLabel: CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
  textTransform: 'uppercase', color: 'var(--text-hint)',
  marginBottom: 8, marginTop: 20, display: 'block',
};

function countWeeks(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(days / 7);
}

export function MacrocyclePage() {
  const navigate = useNavigate();
  const { macrocycle, phases, loading, error, refetch } = useMacrocycle();

  const today = new Date().toISOString().slice(0, 10);

  const [macroName, setMacroName] = useState('');
  const [macroGoalDistance, setMacroGoalDistance] = useState('');
  const [macroRaceDate, setMacroRaceDate] = useState('');
  const [macroStartDate, setMacroStartDate] = useState(today);
  const [macroSubmitting, setMacroSubmitting] = useState(false);
  const [macroError, setMacroError] = useState<string | null>(null);

  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [phaseName, setPhaseName] = useState('');
  const [phaseObjective, setPhaseObjective] = useState('');
  const [phaseStartDate, setPhaseStartDate] = useState('');
  const [phaseEndDate, setPhaseEndDate] = useState('');
  const [phaseLongRun, setPhaseLongRun] = useState('');
  const [phaseVolume, setPhaseVolume] = useState('');
  const [phaseSubmitting, setPhaseSubmitting] = useState(false);
  const [phaseError, setPhaseError] = useState<string | null>(null);

  async function handleCreateMacrocycle(e: FormEvent) {
    e.preventDefault();
    const goal = Number(macroGoalDistance);
    if (!macroName.trim() || isNaN(goal) || goal <= 0 || !macroRaceDate || !macroStartDate) return;

    const payload: CreateMacrocyclePayload = {
      name: macroName.trim(),
      goalDistance: goal,
      raceDate: macroRaceDate,
      startDate: macroStartDate,
    };

    setMacroSubmitting(true);
    setMacroError(null);
    try {
      await macrocycleService.create(payload);
      await refetch();
    } catch (err) {
      setMacroError(err instanceof Error ? err.message : 'Erro ao criar macrociclo');
    } finally {
      setMacroSubmitting(false);
    }
  }

  async function handleCreatePhase(e: FormEvent) {
    e.preventDefault();
    if (!macrocycle || !phaseName.trim() || !phaseObjective.trim() || !phaseStartDate || !phaseEndDate) return;

    const payload: CreatePhasePayload = {
      name: phaseName.trim(),
      objective: phaseObjective.trim(),
      startDate: phaseStartDate,
      endDate: phaseEndDate,
      orderIndex: phases.length + 1,
      ...(phaseLongRun !== '' ? { longRunTarget: Number(phaseLongRun) } : {}),
      ...(phaseVolume !== '' ? { weeklyVolumeTarget: Number(phaseVolume) } : {}),
    };

    setPhaseSubmitting(true);
    setPhaseError(null);
    try {
      await macrocycleService.createPhase(macrocycle.id, payload);
      await refetch();
      setShowPhaseForm(false);
      setPhaseName('');
      setPhaseObjective('');
      setPhaseStartDate('');
      setPhaseEndDate('');
      setPhaseLongRun('');
      setPhaseVolume('');
    } catch (err) {
      setPhaseError(err instanceof Error ? err.message : 'Erro ao criar fase');
    } finally {
      setPhaseSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
          <ChevronLeft size={22} />
        </button>
        <Target size={17} color="#a5b4fc" />
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
          {PAGE_TITLE}
        </h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-muted)', fontSize: 14 }}>
            {LABEL_CARREGANDO}
          </div>
        ) : error != null ? (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.20)',
            color: '#f87171', fontSize: 13,
          }}>
            {error}
          </div>
        ) : macrocycle === null ? (
          <form onSubmit={handleCreateMacrocycle} style={{ display: 'flex', flexDirection: 'column' }}>
            {macroError != null && (
              <div style={{
                marginBottom: 16, padding: '12px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.20)',
                color: '#f87171', fontSize: 13,
              }}>
                {macroError}
              </div>
            )}

            <span style={sectionLabel}>{LABEL_NOME}</span>
            <input
              type="text" value={macroName} onChange={e => setMacroName(e.target.value)}
              placeholder={PLACEHOLDER_NOME} required style={inputStyle}
            />

            <span style={sectionLabel}>{LABEL_DISTANCIA}</span>
            <input
              type="number" value={macroGoalDistance} onChange={e => setMacroGoalDistance(e.target.value)}
              min="1" step="0.5" placeholder="21" required style={inputStyle}
            />

            <span style={sectionLabel}>{LABEL_DATA_PROVA}</span>
            <input
              type="date" value={macroRaceDate} onChange={e => setMacroRaceDate(e.target.value)}
              required style={{ ...inputStyle, colorScheme: 'dark' }}
            />

            <span style={sectionLabel}>{LABEL_DATA_INICIO}</span>
            <input
              type="date" value={macroStartDate} onChange={e => setMacroStartDate(e.target.value)}
              required style={{ ...inputStyle, colorScheme: 'dark' }}
            />

            {macroStartDate && macroRaceDate && macroStartDate < macroRaceDate && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,.10)', border: '1px solid rgba(99,102,241,.18)' }}>
                <span style={{ fontSize: 12, color: '#a5b4fc' }}>
                  Duração total: {countWeeks(macroStartDate, macroRaceDate)} {LABEL_SEMANAS}
                </span>
              </div>
            )}

            <button
              type="submit" disabled={macroSubmitting}
              style={{
                marginTop: 28, width: '100%', padding: '13px', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                border: 'none', cursor: macroSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,.35)',
                opacity: macroSubmitting ? .6 : 1, transition: 'opacity .15s',
              }}
            >
              {macroSubmitting ? LABEL_CRIANDO : LABEL_CRIAR_MACRO}
            </button>
          </form>
        ) : (
          <>
            <div style={{
              borderRadius: 14, padding: '16px 18px', marginBottom: 20,
              background: 'rgba(255,255,255,0.065)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#818cf8', marginBottom: 6 }}>
                MACROCICLO ATIVO
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {macrocycle.name}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{macrocycle.goalDistance} km</span>
                <span>Prova: {macrocycle.raceDate}</span>
                <span>{countWeeks(macrocycle.startDate, macrocycle.raceDate)} semanas</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
                {LABEL_FASES}
              </span>
              {phases.length < 6 && (
                <button
                  onClick={() => setShowPhaseForm(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, color: '#a5b4fc',
                    background: 'rgba(99,102,241,.12)',
                    border: '1px solid rgba(99,102,241,.25)',
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                  {LABEL_ADD_FASE}
                </button>
              )}
            </div>

            {phases.length === 0 && !showPhaseForm && (
              <div style={{
                textAlign: 'center', padding: '32px 16px',
                borderRadius: 14,
                background: 'rgba(255,255,255,.03)',
                border: '1px dashed rgba(255,255,255,.10)',
                color: 'var(--text-muted)', fontSize: 13,
                marginBottom: 16,
              }}>
                Nenhuma fase criada ainda. Adicione a primeira fase do seu plano.
              </div>
            )}

            {phases
              .slice()
              .sort((a, b) => a.order - b.order)
              .map(phase => (
                <div key={phase.id} style={{
                  borderRadius: 12, marginBottom: 8, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.065)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#818cf8', marginBottom: 3 }}>
                        FASE {phase.order}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {phase.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                      <div>{phase.startDate}</div>
                      <div>{phase.endDate}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {phase.objective}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {phase.longRunTarget != null && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 6, padding: '3px 8px' }}>
                        {LABEL_LONGAO_META}: {phase.longRunTarget} km
                      </span>
                    )}
                    {phase.weeklyVolumeTarget != null && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(34,197,94,.10)', border: '1px solid rgba(34,197,94,.18)', borderRadius: 6, padding: '3px 8px' }}>
                        {LABEL_VOLUME_META}: {phase.weeklyVolumeTarget} km/sem
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {showPhaseForm && (
              <form onSubmit={handleCreatePhase} style={{
                marginTop: 8,
                borderRadius: 14, padding: '20px 16px',
                background: 'rgba(99,102,241,.07)',
                border: '1px solid rgba(99,102,241,.2)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 16 }}>
                  {LABEL_ADD_FASE} #{phases.length + 1}
                </div>

                {phaseError != null && (
                  <div style={{
                    marginBottom: 12, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.20)',
                    color: '#f87171', fontSize: 13,
                  }}>
                    {phaseError}
                  </div>
                )}

                <span style={{ ...sectionLabel, marginTop: 0 }}>{LABEL_NOME_FASE}</span>
                <input
                  type="text" value={phaseName} onChange={e => setPhaseName(e.target.value)}
                  placeholder="Fase 1 — Construção de Base" required style={inputStyle}
                />

                <span style={sectionLabel}>{LABEL_OBJETIVO}</span>
                <textarea
                  value={phaseObjective} onChange={e => setPhaseObjective(e.target.value)}
                  rows={2} placeholder={PLACEHOLDER_OBJETIVO} required
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <span style={sectionLabel}>{LABEL_DATA_INI}</span>
                    <input type="date" value={phaseStartDate} onChange={e => setPhaseStartDate(e.target.value)}
                      required style={{ ...inputStyle, colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <span style={sectionLabel}>{LABEL_DATA_FIM}</span>
                    <input type="date" value={phaseEndDate} onChange={e => setPhaseEndDate(e.target.value)}
                      required style={{ ...inputStyle, colorScheme: 'dark' }} />
                  </div>
                </div>

                {phaseStartDate && phaseEndDate && phaseStartDate < phaseEndDate && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                    {countWeeks(phaseStartDate, phaseEndDate)} {LABEL_SEMANAS}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <span style={sectionLabel}>{LABEL_LONGAO}</span>
                    <input type="number" value={phaseLongRun} onChange={e => setPhaseLongRun(e.target.value)}
                      min="1" step="0.5" placeholder="10" style={inputStyle} />
                  </div>
                  <div>
                    <span style={sectionLabel}>{LABEL_VOLUME}</span>
                    <input type="number" value={phaseVolume} onChange={e => setPhaseVolume(e.target.value)}
                      min="1" step="1" placeholder="20" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button
                    type="submit" disabled={phaseSubmitting}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', fontSize: 14, fontWeight: 600,
                      border: 'none', cursor: phaseSubmitting ? 'not-allowed' : 'pointer',
                      opacity: phaseSubmitting ? .6 : 1, transition: 'opacity .15s',
                    }}
                  >
                    {phaseSubmitting ? LABEL_SALVANDO : LABEL_SALVAR_FASE}
                  </button>
                  <button
                    type="button" onClick={() => setShowPhaseForm(false)} disabled={phaseSubmitting}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12,
                      background: 'transparent', color: 'var(--text-muted)', fontSize: 14,
                      border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer',
                    }}
                  >
                    {LABEL_CANCELAR}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
