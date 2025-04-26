
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock PayPal SDK
vi.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PayPalButtons: ({ onApprove, onError, createOrder }: any) => {
    return (
      <button 
        onClick={() => onApprove({ orderID: 'test-order' }, { order: { capture: () => Promise.resolve({ id: 'test-capture' }) } })}
        data-testid="paypal-button"
      >
        PayPal Button
      </button>
    );
  },
  usePayPalScriptReducer: () => [{
    isPending: false,
    isResolved: true,
    isRejected: false
  }]
}));

// Mock navigation
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true } })
    }
  }
}));

// Mock Auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' }
  })
}));
