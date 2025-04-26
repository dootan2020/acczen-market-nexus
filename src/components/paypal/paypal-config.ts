
export const PAYPAL_OPTIONS = {
  clientId: "test", // Replace with your working sandbox client ID
  currency: "USD",
  intent: "capture",
  components: "buttons",
  disableFunding: "credit",
  dataDsr: "false",
  debug: false // Setting debug to false to reduce errors in production
} as const;
