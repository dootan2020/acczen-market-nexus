
// Mock imports
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock objects and functions
const mockSendEmail = vi.fn();
const mockLogInsert = vi.fn();

vi.mock('https://deno.land/std@0.168.0/http/server.ts', () => ({
  serve: vi.fn((handler) => handler)
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockLogInsert,
      select: () => ({
        eq: () => ({
          single: () => ({ 
            data: { 
              email: 'test@example.com',
              full_name: 'Test User',
              username: 'testuser'
            }, 
            error: null 
          })
        }),
      })
    })
  })
}));

// Mock email sender
vi.mock('../emailSender', () => ({
  sendEmail: mockSendEmail
}));

// Import the handler after mocks
const { handler } = await import('../index.ts');

describe('Send Notification Email Function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Set up default successful response
    mockSendEmail.mockResolvedValue({ success: true });
    mockLogInsert.mockResolvedValue({ error: null });
    
    // Mock Deno environment
    global.Deno = {
      env: {
        get: (key: string) => {
          if (key === 'EMAIL_API_KEY') return 'test-api-key';
          if (key === 'EMAIL_FROM_ADDRESS') return 'noreply@test.com';
          if (key === 'EMAIL_PROVIDER') return 'sendgrid';
          if (key === 'PUBLIC_URL') return 'https://test.com';
          return '';
        }
      }
    } as any;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle OPTIONS request for CORS', async () => {
    const request = new Request('https://example.com', {
      method: 'OPTIONS'
    });

    const response = await handler(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should successfully send order confirmation email', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'user-123',
        template: 'order_confirmation',
        data: {
          order_id: 'order-123',
          date: '2023-01-01T00:00:00.000Z',
          total: 99.99,
          payment_method: 'PayPal',
          transaction_id: 'tx-123',
          items: [
            { name: 'Product 1', quantity: 2, price: 29.99, total: 59.98 }
          ],
          digital_items: [
            { name: 'Product 1', keys: ['key-123', 'key-456'] }
          ]
        }
      })
    });

    const response = await handler(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    
    // Check that the email was sent with the right parameters
    const emailCall = mockSendEmail.mock.calls[0];
    expect(emailCall[0]).toBe('test@example.com');
    expect(emailCall[1]).toBe('Order Confirmation - Digital Deals Hub');
    expect(emailCall[2]).toContain('Product 1');
    expect(emailCall[2]).toContain('key-123');
  });

  it('should retry sending email on failure', async () => {
    // First attempt fails, second succeeds
    mockSendEmail
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ success: true });

    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'user-123',
        template: 'order_confirmation',
        data: { order_id: 'order-123', date: new Date().toISOString(), total: 10 }
      })
    });

    const response = await handler(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
  });

  it('should handle different payment methods correctly', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'user-123',
        template: 'order_confirmation',
        data: {
          order_id: 'order-123',
          date: '2023-01-01T00:00:00.000Z',
          total: 99.99,
          payment_method: 'USDT',
          transaction_id: 'tx-123',
          items: [
            { name: 'Product 1', quantity: 1, price: 99.99, total: 99.99 }
          ]
        }
      })
    });

    await handler(request);
    
    // Check that the payment method is included in the email
    const emailCall = mockSendEmail.mock.calls[0];
    expect(emailCall[2]).toContain('USDT');
  });

  it('should handle orders without digital keys', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'user-123',
        template: 'order_confirmation',
        data: {
          order_id: 'order-123',
          date: '2023-01-01T00:00:00.000Z',
          total: 99.99,
          payment_method: 'Account Balance',
          items: [
            { name: 'Physical Product', quantity: 1, price: 99.99, total: 99.99 }
          ]
          // No digital_items field
        }
      })
    });

    const response = await handler(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    
    // Email should be sent without digital items section
    const emailCall = mockSendEmail.mock.calls[0];
    expect(emailCall[2]).not.toContain('Digital Items');
  });

  it('should handle user not found error', async () => {
    // Mock user not found
    vi.mocked(createClient).mockImplementationOnce(() => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: new Error('User not found') })
          })
        })
      })
    }));

    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'invalid-user',
        template: 'order_confirmation',
        data: { order_id: 'order-123' }
      })
    });

    const response = await handler(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('User not found');
  });
});
