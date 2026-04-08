import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeltaBadge } from './DeltaBadge';

describe('DeltaBadge', () => {
  it('renderiza o texto do delta', () => {
    render(<DeltaBadge text="−0:30/km" positive={true} />);
    expect(screen.getByText('−0:30/km')).toBeInTheDocument();
  });

  it('renderiza delta negativo', () => {
    render(<DeltaBadge text="+0:15/km" positive={false} />);
    expect(screen.getByText('+0:15/km')).toBeInTheDocument();
  });

  it('renderiza como span', () => {
    render(<DeltaBadge text="−0:30/km" positive={true} />);
    expect(screen.getByText('−0:30/km').tagName.toLowerCase()).toBe('span');
  });
});
