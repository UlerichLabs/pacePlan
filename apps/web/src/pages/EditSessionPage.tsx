import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PAGE_TITLE = 'Editar treino';
const TODO_MESSAGE = 'Story 01.2 — a implementar';

export function EditSessionPage() {
  const navigate = useNavigate();

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
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[--text-muted] text-sm">{TODO_MESSAGE}</p>
      </div>
    </div>
  );
}
