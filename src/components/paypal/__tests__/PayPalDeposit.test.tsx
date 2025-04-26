
import { render, screen, fireEvent } from '@testing-library/react';
import PayPalDeposit from '../PayPalDeposit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import './setup';
import '@testing-library/jest-dom';

describe('PayPalDeposit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preset amount options', () => {
    render(<PayPalDeposit />);
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('$20')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('handles custom amount input', () => {
    render(<PayPalDeposit />);
    const input = screen.getByPlaceholderText('Enter amount (USD)');
    fireEvent.change(input, { target: { value: '75' } });
    expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
  });

  it('validates custom amount', () => {
    render(<PayPalDeposit />);
    const input = screen.getByPlaceholderText('Enter amount (USD)');
    fireEvent.change(input, { target: { value: '-50' } });
    expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument();
  });
});
