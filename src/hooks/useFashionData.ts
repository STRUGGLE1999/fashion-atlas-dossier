import { useState, useEffect } from 'react';

export function useFashionData<T>(type: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/data/${type}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [type]);

  return { data, loading, error };
}
