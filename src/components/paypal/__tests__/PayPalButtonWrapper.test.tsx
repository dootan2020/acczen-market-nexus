
import { render, screen, fireEvent } from '@testing-library/react';
import { PayPalButtonWrapper } from '../PayPalButtonWrapper';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import './setup';
import '@testing-library/jest-dom';

describe('PayPalButtonWrapper', () => {
  const mockOnSuccess = vi.fn();
  const defaultProps = {
    amount: 100,
    onSuccess: mockOnSuccess
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PayPal button', () => {
    render(<PayPalButtonWrapper {...defaultProps} />);
    expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
  });

  it('handles successful payment', async () => {
    render(<PayPalButtonWrapper {...defaultProps} />);
    const button = screen.getByTestId('paypal-button');
    await fireEvent.click(button);
    expect(mockOnSuccess).toHaveBeenCalledWith(
      { id: 'test-capture' },
      defaultProps.amount
    );
  });
});
