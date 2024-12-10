import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error: fetchError } = await supabase
          .from('locations')
          .select('*')
          .eq('active', true)
          .order('name');

        if (fetchError) throw fetchError;
        setLocations(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to fetch locations');
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  return { locations, loading, error };
}