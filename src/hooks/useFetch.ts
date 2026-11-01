import { useCallback, useEffect, useState } from 'react';

export function useFetch<T>(fn: () => Promise<T>, initial: T, deps: any[] = []) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

   try { setData(await fn()); setError(false); }
    catch { if (!silent) setError(true); }
    
    finally { setLoading(false); }
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, setData, loading, error, reload: () => load(), silentReload: () => load(true) };
}