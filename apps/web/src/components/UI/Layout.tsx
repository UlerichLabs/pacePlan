import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, CalendarDays, ScrollText } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/week',      label: 'Semana',    Icon: CalendarDays },
  { to: '/dashboard', label: 'Dashboard',  Icon: Activity },
  { to: '/history',   label: 'Histórico', Icon: ScrollText },
] as const;

function SidebarContent() {
  return (
    <>
      <div style={{ marginBottom: 32, paddingLeft: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#a5b4fc', letterSpacing: '-.01em' }}>
          PacePlan
        </span>
      </div>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, marginBottom: 2,
            color: isActive ? '#a5b4fc' : 'rgba(255,255,255,.4)',
            background: isActive ? 'rgba(99,102,241,.12)' : 'transparent',
            fontSize: 14, fontWeight: isActive ? 600 : 500,
            transition: 'all .15s',
          })}
        >
          <item.Icon size={17} />
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

function BottomNavContent() {
  return (
    <>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
            textTransform: 'uppercase' as const,
            color: isActive ? '#a5b4fc' : 'rgba(255,255,255,.28)',
            transition: 'color .15s',
          })}
        >
          <item.Icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden', background: '#0f1117' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: '#6366f1', filter: 'blur(90px)', opacity: .16, top: -100, left: -80 }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: '#8b5cf6', filter: 'blur(90px)', opacity: .14, bottom: 80, right: -60 }} />
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: '#22c55e', filter: 'blur(80px)', opacity: .08, top: '40%', right: '20%' }} />
      </div>
      <div className="app-shell" style={{ position: 'relative', zIndex: 1 }}>
        <nav className="sidebar">
          <SidebarContent />
        </nav>
        <main className="main-content">
          {children}
        </main>
        <nav className="bottom-nav">
          <BottomNavContent />
        </nav>
      </div>
    </div>
  );
}
