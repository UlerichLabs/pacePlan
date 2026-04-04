const PAGE_TITLE = 'Stats';
const TODO_MESSAGE = 'Épico 03 — a implementar';

export function DashboardPage() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        {PAGE_TITLE}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{TODO_MESSAGE}</p>
    </div>
  );
}
