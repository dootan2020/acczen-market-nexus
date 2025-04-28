
import { taphoammoApi } from '@/services/taphoammo-api';
import { CircuitBreaker } from '@/utils/api/circuitBreaker/CircuitBreaker';
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility for testing the circuit breaker pattern with simulated failures
 */
export async function testCircuitBreaker() {
  console.log("=== Starting Circuit Breaker Test ===");
  
  // Reset circuit breaker state
  await CircuitBreaker.reset();
  console.log("Circuit breaker reset");
  
  // Check initial state
  const initialState = await CircuitBreaker.isOpen();
  console.log("Initial circuit state:", initialState ? "OPEN" : "CLOSED");
  
  let successCount = 0;
  let failureCount = 0;
  
  // Function that will fail
  const failingFunction = async () => {
    try {
      await taphoammoApi.fetchTaphoammo('non-existent-endpoint', { invalid: true });
      successCount++;
      return true;
    } catch (error) {
      failureCount++;
      console.log(`Test failure #${failureCount}: ${error.message}`);
      return false;
    }
  };
  
  // Generate 4 failures to trip the circuit breaker (threshold is 3)
  console.log("Generating failures to trip circuit breaker...");
  for (let i = 0; i < 4; i++) {
    await failingFunction();
    
    // Check circuit state after each failure
    const isOpen = await CircuitBreaker.isOpen();
    console.log(`After failure #${i+1}: Circuit is ${isOpen ? "OPEN" : "CLOSED"}`);
    
    // If circuit opened, break the loop
    if (isOpen) {
      console.log("Circuit breaker has opened!");
      break;
    }
  }
  
  // Check final circuit state
  const finalState = await CircuitBreaker.isOpen();
  console.log("Final circuit state:", finalState ? "OPEN" : "CLOSED");
  
  // Check API health status
  const { data: apiHealth } = await supabase
    .from('api_health')
    .select('*')
    .eq('api_name', 'taphoammo')
    .single();
  
  console.log("API health status:", apiHealth);
  console.log("=== Circuit Breaker Test Complete ===");
  
  return {
    successCount,
    failureCount,
    circuitOpened: finalState,
    apiHealth
  };
}
