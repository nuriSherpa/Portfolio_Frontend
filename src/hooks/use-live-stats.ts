import { useEffect, useRef, useCallback } from 'react';
import { PublicStats } from '@/lib/api/actions/stats';

export const useLiveStats = (onUpdate: (stats: Partial<PublicStats>) => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isMountedRef = useRef(true);
  const connectionIdRef = useRef(0);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'disconnect');
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    disconnect();

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/stats`;

    const connectionId = ++connectionIdRef.current;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const timeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) ws.close();
      }, 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        if (!isMountedRef.current || wsRef.current !== ws) return;
        reconnectAttemptsRef.current = 0;
        ws.send(JSON.stringify({ action: 'subscribe', channels: ['visitors', 'likes'] }));
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'init':
              // Ignored — client fetch already has fresh data
              break;
            case 'visitors':
              onUpdateRef.current({ visitors: msg.data });
              break;
            case 'likes':
              onUpdateRef.current({ likes: msg.data });
              break;
          }
        } catch (err) {
          console.error(`[ws] #${connectionId} parse error:`, err);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (wsRef.current !== ws) return;
        if (isMountedRef.current && event.code !== 1000) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectAttemptsRef.current++;
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) connect();
            }, delay);
          }
        }
        if (wsRef.current === ws) wsRef.current = null;
      };

      ws.onerror = () => {};
    } catch (err) {
      console.error(`[ws] failed to create:`, err);
    }
  }, [disconnect]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, 'unmount');
        wsRef.current = null;
      }
    };
  }, [connect]);
};
