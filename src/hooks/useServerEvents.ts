// hooks/useServerEvents.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

type InvalidateCallback = (sections: string[]) => void;

export function useServerEvents(onInvalidate: InvalidateCallback) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const clientId = Math.random().toString(36).substring(7);
    const evtSource = new EventSource(`/api/events?clientId=${clientId}`);

    evtSource.onopen = () => {
      console.log('🔌 SSE Connected');
      setIsConnected(true);
    };

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'cache-invalidate' && data.sections) {
          console.log('📨 Cache invalidate:', data.sections);
          onInvalidate(data.sections);
        }
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    evtSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      evtSource.close();
    };
  }, [onInvalidate]);

  return { isConnected };
}
