import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { CreateSessionPayload } from '@paceplan/types';
import { SessionForm } from '../components/SessionForm/SessionForm';
import { sessionService } from '@paceplan/api-client';

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
    <div className="flex flex-col h-full">
      <header className="page-header gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex p-1 text-[--text-muted] hover:text-foreground transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[17px] font-semibold text-foreground">
          {PAGE_TITLE}
        </h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        {serverError != null && (
          <div className="error-box mb-4">
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
