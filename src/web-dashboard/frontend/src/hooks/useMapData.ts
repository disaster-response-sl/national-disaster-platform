import { useState, useEffect, useCallback } from 'react';
import { mapService } from '../services/mapService';
import type { 
  Report, 
  HeatmapPoint, 
  ResourceAnalysis, 
  MapStatistics, 
  Disaster,
  ReportsQuery,
  HeatmapQuery 
} from '../types/map';

interface UseMapDataResult {
  reports: Report[];
  heatmapData: HeatmapPoint[];
  resourceAnalysis: ResourceAnalysis[];
  statistics: MapStatistics | null;
  disasters: Disaster[];
  loading: {
    reports: boolean;
    heatmap: boolean;
    resources: boolean;
    statistics: boolean;
    disasters: boolean;
  };
  error: string | null;
  refetch: {
    reports: (query?: ReportsQuery) => Promise<void>;
    heatmap: (query?: HeatmapQuery) => Promise<void>;
    resources: () => Promise<void>;
    statistics: () => Promise<void>;
    disasters: () => Promise<void>;
    all: () => Promise<void>;
  };
}

export const useMapData = (): UseMapDataResult => {
  const [reports, setReports] = useState<Report[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [resourceAnalysis, setResourceAnalysis] = useState<ResourceAnalysis[]>([]);
  const [statistics, setStatistics] = useState<MapStatistics | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState({
    reports: false,
    heatmap: false,
    resources: false,
    statistics: false,
    disasters: false,
  });

  const updateLoading = (key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const fetchReports = useCallback(async (query: ReportsQuery = {}) => {
    updateLoading('reports', true);
    setError(null);
    try {
      const response = await mapService.getReports(query);
      if (response.success) {
        setReports(response.data);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      updateLoading('reports', false);
    }
  }, []);

  const fetchHeatmap = useCallback(async (query: HeatmapQuery = {}) => {
    updateLoading('heatmap', true);
    setError(null);
    try {
      const response = await mapService.getHeatmapData(query);
      if (response.success) {
        setHeatmapData(response.data);
      } else {
        setError('Failed to fetch heatmap data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch heatmap data');
    } finally {
      updateLoading('heatmap', false);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    updateLoading('resources', true);
    setError(null);
    try {
      const response = await mapService.getResourceAnalysis();
      if (response.success) {
        setResourceAnalysis(response.data);
      } else {
        setError('Failed to fetch resource analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resource analysis');
    } finally {
      updateLoading('resources', false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    updateLoading('statistics', true);
    setError(null);
    try {
      const response = await mapService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      updateLoading('statistics', false);
    }
  }, []);

  const fetchDisasters = useCallback(async () => {
    updateLoading('disasters', true);
    setError(null);
    try {
      const response = await mapService.getDisasters();
      if (response.success) {
        setDisasters(response.data);
      } else {
        setError('Failed to fetch disasters');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disasters');
    } finally {
      updateLoading('disasters', false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchReports(),
      fetchHeatmap(),
      fetchResources(),
      fetchStatistics(),
      fetchDisasters(),
    ]);
  }, [fetchReports, fetchHeatmap, fetchResources, fetchStatistics, fetchDisasters]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    reports,
    heatmapData,
    resourceAnalysis,
    statistics,
    disasters,
    loading,
    error,
    refetch: {
      reports: fetchReports,
      heatmap: fetchHeatmap,
      resources: fetchResources,
      statistics: fetchStatistics,
      disasters: fetchDisasters,
      all: fetchAll,
    },
  };
};
