import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeelingScalePicker } from './FeelingScale';

describe('FeelingScalePicker', () => {
  it('renderiza os 5 botões de feeling', () => {
    render(<FeelingScalePicker value={null} onChange={() => {}} />);
    expect(screen.getByText('Muito difícil')).toBeInTheDocument();
    expect(screen.getByText('Difícil')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Bem')).toBeInTheDocument();
    expect(screen.getByText('Ótimo')).toBeInTheDocument();
  });

  it('chama onChange com valor 5 ao clicar em Ótimo', async () => {
    const onChange = vi.fn();
    render(<FeelingScalePicker value={null} onChange={onChange} />);
    await userEvent.click(screen.getByText('Ótimo'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('chama onChange com valor 1 ao clicar em Muito difícil', async () => {
    const onChange = vi.fn();
    render(<FeelingScalePicker value={null} onChange={onChange} />);
    await userEvent.click(screen.getByText('Muito difícil'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('chama onChange com valor correto para cada opção', async () => {
    const onChange = vi.fn();
    render(<FeelingScalePicker value={null} onChange={onChange} />);
    await userEvent.click(screen.getByText('OK'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('botão selecionado recebe classe de destaque', () => {
    render(<FeelingScalePicker value={4} onChange={() => {}} />);
    const bemButton = screen.getByText('Bem');
    expect(bemButton).toBeInTheDocument();
  });
});
