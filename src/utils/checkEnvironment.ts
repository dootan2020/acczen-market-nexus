
/**
 * A utility function to check the current environment
 * and perform any necessary setup or validation.
 */
export function checkEnvironment(): void {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    console.log('Application running in development mode');
  }

  // Check if we're in production mode
  if (import.meta.env.PROD) {
    console.log('Application running in production mode');
  }

  // Add any other environment-specific checks or setup here
}
