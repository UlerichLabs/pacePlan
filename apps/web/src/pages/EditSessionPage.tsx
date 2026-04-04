import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PAGE_TITLE = 'Editar treino';
const TODO_MESSAGE = 'Story 01.2 — a implementar';

export function EditSessionPage() {
  const navigate = useNavigate();

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
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{TODO_MESSAGE}</p>
      </div>
    </div>
  );
}
