
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as React from 'react';

// Make sure global test functions are available
import { describe, it, expect, beforeEach } from 'vitest';
global.describe = describe;
global.it = it;
global.expect = expect;
global.beforeEach = beforeEach;

// Add Jest DOM matchers to Vitest
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(matchers);

// Mock PayPal SDK
vi.mock('@paypal/react-paypal-js', () => {
  return {
    PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(React.Fragment, null, children);
    },
    PayPalButtons: ({ onApprove }: any) => {
      const handleClick = () => {
        onApprove(
          { orderID: 'test-order' }, 
          { order: { capture: () => Promise.resolve({ id: 'test-capture' }) } }
        );
      };
      
      return React.createElement(
        'button',
        { 
          onClick: handleClick,
          'data-testid': 'paypal-button'
        },
        'PayPal Button'
      );
    },
    usePayPalScriptReducer: () => [{
      isPending: false,
      isResolved: true,
      isRejected: false
    }]
  };
});

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
