import { useEffect, useState, useCallback } from 'react';
import webSocketService from '../services/webSocketService';
import type { Report, Disaster, ResourceAnalysis, MapStatistics } from '../types/map';

interface UseRealTimeDataProps {
  onReportUpdate?: (report: Report) => void;
  onDisasterUpdate?: (disaster: Disaster) => void;
  onResourceUpdate?: (resources: ResourceAnalysis[]) => void;
  onStatisticsUpdate?: (statistics: MapStatistics) => void;
  enabled?: boolean;
}

interface UseRealTimeDataResult {
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastUpdate: Date | null;
  toggleConnection: () => void;
}

export const useRealTimeData = ({
  onReportUpdate,
  onDisasterUpdate,
  onResourceUpdate,
  onStatisticsUpdate,
  enabled = true,
}: UseRealTimeDataProps): UseRealTimeDataResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleReportUpdate = useCallback((data: Report) => {
    setLastUpdate(new Date());
    onReportUpdate?.(data);
  }, [onReportUpdate]);

  const handleDisasterUpdate = useCallback((data: Disaster) => {
    setLastUpdate(new Date());
    onDisasterUpdate?.(data);
  }, [onDisasterUpdate]);

  const handleResourceUpdate = useCallback((data: ResourceAnalysis[]) => {
    setLastUpdate(new Date());
    onResourceUpdate?.(data);
  }, [onResourceUpdate]);

  const handleStatisticsUpdate = useCallback((data: MapStatistics) => {
    setLastUpdate(new Date());
    onStatisticsUpdate?.(data);
  }, [onStatisticsUpdate]);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, []);

  const toggleConnection = useCallback(() => {
    if (isConnected) {
      webSocketService.disconnect();
    } else {
      setConnectionStatus('connecting');
      webSocketService.connect({
        onReportUpdate: handleReportUpdate,
        onDisasterUpdate: handleDisasterUpdate,
        onResourceUpdate: handleResourceUpdate,
        onStatisticsUpdate: handleStatisticsUpdate,
        onConnectionChange: handleConnectionChange,
      });
    }
  }, [isConnected, handleReportUpdate, handleDisasterUpdate, handleResourceUpdate, handleStatisticsUpdate, handleConnectionChange]);

  useEffect(() => {
    if (enabled) {
      setConnectionStatus('connecting');
      webSocketService.connect({
        onReportUpdate: handleReportUpdate,
        onDisasterUpdate: handleDisasterUpdate,
        onResourceUpdate: handleResourceUpdate,
        onStatisticsUpdate: handleStatisticsUpdate,
        onConnectionChange: handleConnectionChange,
      });

      return () => {
        webSocketService.disconnect();
      };
    }
  }, [enabled, handleReportUpdate, handleDisasterUpdate, handleResourceUpdate, handleStatisticsUpdate, handleConnectionChange]);

  return {
    isConnected,
    connectionStatus,
    lastUpdate,
    toggleConnection,
  };
};
