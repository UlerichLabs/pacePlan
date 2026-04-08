import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Environment } from '@paceplan/types';
import { EnvironmentBadge } from './EnvironmentBadge';

describe('EnvironmentBadge', () => {
  it('renderiza "Rua" para OUTDOOR', () => {
    render(<EnvironmentBadge env={Environment.OUTDOOR} />);
    expect(screen.getByText('Rua')).toBeInTheDocument();
  });

  it('renderiza "Esteira" para TREADMILL', () => {
    render(<EnvironmentBadge env={Environment.TREADMILL} />);
    expect(screen.getByText('Esteira')).toBeInTheDocument();
  });

  it('renderiza como span', () => {
    render(<EnvironmentBadge env={Environment.OUTDOOR} />);
    expect(screen.getByText('Rua').tagName.toLowerCase()).toBe('span');
  });
});
