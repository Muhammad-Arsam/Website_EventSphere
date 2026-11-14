'use client';

// Loads one piece of data for a key (for example an event id) and gives back
// { data, loading, error }. Used for data that may load or fail on its own.
//
// - A slow old response can never overwrite a newer one (the effect cleans up).
// - "loading" is derived (not stored), so there is no state update inside the effect body.
// - `loader` must be a stable function (defined outside the component).
// - Change `reloadToken` to load the same key again (for example a Refresh button).

import { useEffect, useState } from 'react';

interface Settled<T> {
  requestId: string;
  data: T | null;
  error: string | null;
}

export interface AsyncResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncResource<T>(
  key: string,
  loader: (key: string) => Promise<T>,
  reloadToken = 0
): AsyncResource<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const requestId = `${key}:${reloadToken}`;

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    loader(key)
      .then((data) => {
        if (!cancelled) setSettled({ requestId, data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSettled({
            requestId,
            data: null,
            error: err instanceof Error ? err.message : 'Something went wrong.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, loader, requestId]);

  const isCurrent = settled?.requestId === requestId;
  return {
    data: isCurrent ? settled.data : null,
    error: isCurrent ? settled.error : null,
    loading: Boolean(key) && !isCurrent,
  };
}
