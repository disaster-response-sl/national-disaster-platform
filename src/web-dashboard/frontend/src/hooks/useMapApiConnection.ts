// Custom hook for testing map API connectivity and data fetching
import { useState, useEffect } from 'react';
import MapService from '../services/mapService';
import { MapStatisticsResponse } from '../types/mapTypes';

export interface MapApiStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  statistics: MapStatisticsResponse | null;
  lastChecked: Date | null;
}

export const useMapApiConnection = () => {
  const [status, setStatus] = useState<MapApiStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
    statistics: null,
    lastChecked: null
  });

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Test connection and get basic statistics
      const statistics = await MapService.getMapStatistics();
      
      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
        statistics,
        lastChecked: new Date()
      });
      
      console.log('Map API Connection Success:', statistics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      
      setStatus({
        isConnected: false,
        isLoading: false,
        error: errorMessage,
        statistics: null,
        lastChecked: new Date()
      });
      
      console.error('Map API Connection Failed:', error);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    ...status,
    testConnection
  };
};
