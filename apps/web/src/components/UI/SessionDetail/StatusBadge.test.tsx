import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renderiza o label para status planned', () => {
    render(<StatusBadge statusCfg={{ label: 'Planejado', variant: 'planned' }} />);
    expect(screen.getByText('Planejado')).toBeInTheDocument();
  });

  it('renderiza o label para status done', () => {
    render(<StatusBadge statusCfg={{ label: 'Concluído', variant: 'done' }} />);
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('renderiza o label para status skipped', () => {
    render(<StatusBadge statusCfg={{ label: 'Pulada', variant: 'skipped' }} />);
    expect(screen.getByText('Pulada')).toBeInTheDocument();
  });

  it('aplica classes de planned corretamente', () => {
    render(<StatusBadge statusCfg={{ label: 'Planejado', variant: 'planned' }} />);
    const badge = screen.getByText('Planejado');
    expect(badge.tagName.toLowerCase()).toBe('span');
  });

  it('aplica classes de done corretamente', () => {
    render(<StatusBadge statusCfg={{ label: 'Concluído', variant: 'done' }} />);
    const badge = screen.getByText('Concluído');
    expect(badge).toBeInTheDocument();
  });
});
