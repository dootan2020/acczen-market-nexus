
export const PAYPAL_OPTIONS = {
  clientId: "test", // Replace with your working sandbox client ID
  currency: "USD",
  intent: "capture",
  components: "buttons",
  disableFunding: "credit",
  dataDsr: "false",
  debug: false // Setting debug to false to reduce errors in production
} as const;

// These are the PayPal webhook event types we handle
export const PAYPAL_WEBHOOK_EVENTS = {
  PAYMENT_CAPTURE_COMPLETED: 'PAYMENT.CAPTURE.COMPLETED',
  PAYMENT_CAPTURE_DENIED: 'PAYMENT.CAPTURE.DENIED',
  PAYMENT_CAPTURE_REFUNDED: 'PAYMENT.CAPTURE.REFUNDED',
  PAYMENT_CAPTURE_PENDING: 'PAYMENT.CAPTURE.PENDING'
} as const;

// PayPal payment statuses
export const PAYMENT_STATUS = {
  COMPLETED: 'COMPLETED',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
  PENDING: 'PENDING'
} as const;

// Export types for better TypeScript support
export type PayPalWebhookEvent = typeof PAYPAL_WEBHOOK_EVENTS[keyof typeof PAYPAL_WEBHOOK_EVENTS];
export type PayPalPaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
