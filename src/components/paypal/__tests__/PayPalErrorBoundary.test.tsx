
import { render, screen } from '@testing-library/react';
import { PayPalErrorBoundary } from '../PayPalErrorBoundary';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

describe('PayPalErrorBoundary', () => {
  const mockOnSuccess = vi.fn();
  const defaultProps = {
    amount: 100,
    onSuccess: mockOnSuccess,
    children: <div>Test Child</div>
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(<PayPalErrorBoundary {...defaultProps} />);
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    const TestError = () => {
      throw new Error('Test error');
    };

    render(
      <PayPalErrorBoundary {...defaultProps}>
        <TestError />
      </PayPalErrorBoundary>
    );

    expect(screen.getByText('Payment Error')).toBeInTheDocument();
    expect(screen.getByText(/There was a problem loading the PayPal payment system/)).toBeInTheDocument();
  });
});
