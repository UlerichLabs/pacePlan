import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, CalendarDays, ScrollText, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/week',       label: 'Semana',    Icon: CalendarDays },
  { to: '/dashboard',  label: 'Dashboard', Icon: Activity     },
  { to: '/history',    label: 'Histórico', Icon: ScrollText   },
  { to: '/macrocycle', label: 'Plano',     Icon: Target       },
] as const;

function SidebarContent() {
  return (
    <>
      <div className="mb-8 pl-3">
        <span className="text-base font-bold text-primary-subtle tracking-tight">
          PacePlan
        </span>
      </div>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-md mb-0.5 text-sm transition-all duration-150',
            isActive
              ? 'text-primary-subtle bg-accent font-semibold'
              : 'text-[--text-secondary] font-medium hover:bg-surface'
          )}
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
          className={({ isActive }) => cn(
            'flex-1 flex flex-col items-center gap-1 text-[10px] font-semibold tracking-wider uppercase transition-colors duration-150',
            isActive ? 'text-primary-subtle' : 'text-[--text-hint]'
          )}
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
    <div className="app-shell app-bg">
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
  );
}
