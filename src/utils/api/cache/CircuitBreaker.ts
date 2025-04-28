
import { supabase } from '@/integrations/supabase/client';

export class CircuitBreaker {
  static async isOpen(): Promise<boolean> {
    const { data: apiHealth } = await supabase
      .from('api_health')
      .select('*')
      .eq('api_name', 'taphoammo')
      .single();
      
    return !!apiHealth?.is_open;
  }

  static async recordFailure(error: Error): Promise<void> {
    try {
      const { data: errorCountData } = await supabase.rpc('increment_error_count');
      const { data: shouldOpenCircuit } = await supabase.rpc('check_if_should_open_circuit');
      const { data: openedAtValue } = await supabase.rpc('update_opened_at_if_needed');
      
      await supabase
        .from('api_health')
        .update({
          error_count: errorCountData || 1,
          last_error: error.message,
          is_open: shouldOpenCircuit || false,
          opened_at: openedAtValue || null
        })
        .eq('api_name', 'taphoammo');
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
        opened_at: null
      })
      .eq('api_name', 'taphoammo');
  }
}
