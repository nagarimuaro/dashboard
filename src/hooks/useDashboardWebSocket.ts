import { useEffect, useState, useCallback, useRef } from 'react';

interface DashboardWebSocketOptions {
  onDataUpdate?: (data: any, source: string) => void;
  pollingInterval?: number;
  enablePolling?: boolean;
}

/**
 * Hook for real-time dashboard updates
 * Uses smart polling with visibility detection (no WebSocket needed)
 */
export function useDashboardWebSocket(options: DashboardWebSocketOptions = {}) {
  const {
    onDataUpdate,
    pollingInterval = 15000, // 15 detik default
    enablePolling = true,
  } = options;

  const [isConnected, setIsConnected] = useState(true); // Always "connected" with polling
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Initial fetch
    if (onDataUpdate && isVisibleRef.current) {
      onDataUpdate(null, 'initial');
    }

    // Set up interval
    pollingRef.current = setInterval(() => {
      // Only poll if page is visible
      if (isVisibleRef.current && onDataUpdate) {
        onDataUpdate(null, 'polling');
        setLastUpdate(new Date());
      }
    }, pollingInterval);

    setIsConnected(true);
    setConnectionError(null);
  }, [onDataUpdate, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Handle visibility change - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      
      if (isVisibleRef.current && enablePolling) {
        // Page became visible - do immediate refresh
        if (onDataUpdate) {
          onDataUpdate(null, 'visibility');
          setLastUpdate(new Date());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onDataUpdate, enablePolling]);

  // Start/stop polling based on enablePolling
  useEffect(() => {
    if (enablePolling) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enablePolling, startPolling, stopPolling]);

  return {
    isConnected,
    lastUpdate,
    connectionError,
    connect: startPolling,
    disconnect: stopPolling,
  };
}

/**
 * Simple hook for manual refresh trigger
 */
export function useAutoRefresh(callback: () => void, interval = 30000, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, interval, enabled]);
}

export default useDashboardWebSocket;
