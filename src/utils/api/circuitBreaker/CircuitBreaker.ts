
import { supabase } from '@/integrations/supabase/client';

export class CircuitBreaker {
  static async isOpen(): Promise<boolean> {
    const { data: apiHealth } = await supabase
      .from('api_health')
      .select('*')
      .eq('api_name', 'taphoammo')
      .single();
      
    if (apiHealth?.is_open) {
      const openedAt = new Date(apiHealth.opened_at);
      const now = new Date();
      const recoveryTime = 120000; // 2 minutes 
      const timeSinceOpen = now.getTime() - openedAt.getTime();
      
      if (timeSinceOpen > recoveryTime) {
        // Auto-close circuit after recovery time
        await this.reset();
        return false;
      }
      
      return true;
    }
    
    return false;
  }

  static async recordFailure(error: Error): Promise<void> {
    try {
      // First, get the values from the RPC functions
      const { data: errorCountData } = await supabase.rpc('increment_error_count');
      const { data: shouldOpenCircuit } = await supabase.rpc('check_if_should_open_circuit');
      const { data: openedAtValue } = await supabase.rpc('update_opened_at_if_needed');
      
      // Then use those values in the update
      await supabase
        .from('api_health')
        .update({
          error_count: errorCountData || 1, // Fallback to incrementing by 1
          last_error: error.message,
          is_open: shouldOpenCircuit || false, // Fallback to not opening circuit
          opened_at: openedAtValue || null, // Fallback to null
          updated_at: new Date().toISOString()
        })
        .eq('api_name', 'taphoammo');
        
      // Also log to api_logs table for monitoring
      await supabase.from('api_logs').insert({
        api: 'taphoammo',
        endpoint: 'unknown',
        status: 'error',
        details: {
          error: error.message,
          circuit_opened: shouldOpenCircuit || false
        }
      });
    } catch (err) {
      console.error('Error in recordFailure:', err);
    }
  }

  static async reset(): Promise<void> {
    await supabase
      .from('api_health')
      .update({
        is_open: false,
        error_count: 0,
        opened_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('api_name', 'taphoammo');
      
    // Log circuit reset to api_logs
    await supabase.from('api_logs').insert({
      api: 'taphoammo',
      endpoint: 'circuit_breaker',
      status: 'reset',
      details: {
        message: 'Circuit breaker reset'
      }
    });
  }
}
