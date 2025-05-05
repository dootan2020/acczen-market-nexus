
import { supabase } from '@/integrations/supabase/client';

export class BaseApiClient {
  protected async callEdgeFunction(
    functionName: string,
    params: Record<string, any>
  ) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: params
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { data, error: null };
    } catch (err) {
      console.error(`Error calling ${functionName}:`, err);
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Unknown error') 
      };
    }
  }
}
