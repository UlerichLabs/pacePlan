import type { ReactNode } from 'react';

export function MetaRow({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[--border-subtle]">
      <span className="text-sm text-[--text-muted]">{label}</span>
      <div className="flex items-center">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        {children}
      </div>
    </div>
  );
}
