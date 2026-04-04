import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { CreateSessionPayload } from '@paceplan/types';
import { SessionForm } from '../components/SessionForm/SessionForm';
import { sessionService } from '../services/sessionService';

const PAGE_TITLE = 'Novo treino';

export function NewSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultDate = searchParams.get('date') ?? undefined;

  async function handleSubmit(payload: CreateSessionPayload) {
    setIsLoading(true);
    setServerError(null);
    try {
      await sessionService.create(payload);
      navigate('/week');
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Erro ao salvar sessão');
      setIsLoading(false);
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
        <button
          onClick={() => navigate(-1)}
          style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
          {PAGE_TITLE}
        </h1>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 32 }}>
        {serverError != null && (
          <div style={{
            marginBottom: 16, padding: '12px 14px', borderRadius: 10,
            background: 'rgba(239,68,68,.10)',
            border: '1px solid rgba(239,68,68,.20)',
            color: '#f87171', fontSize: 13,
          }}>
            {serverError}
          </div>
        )}
        <SessionForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          isLoading={isLoading}
          defaultDate={defaultDate}
        />
      </div>
    </div>
  );
}
