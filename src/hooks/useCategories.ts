
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/supabase';
import { toast } from 'sonner';

export const useCategories = () => {
  const [categories, setCategories] = useState<Tables<'categories'>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw new Error(error.message);
      
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
