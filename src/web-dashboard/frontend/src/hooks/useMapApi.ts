import { useState, useEffect } from 'react';
import MapApiService, { 
  Report, 
  HeatmapPoint, 
  ResourceAnalysis, 
  MapStatistics, 
  Disaster,
  ReportsQuery,
  HeatmapQuery 
} from '../services/mapApiService';

export const useMapApi = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [resourceAnalysis, setResourceAnalysis] = useState<ResourceAnalysis[]>([]);
  const [statistics, setStatistics] = useState<MapStatistics | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (query?: ReportsQuery) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MapApiService.getReports(query);
      if (response.success) {
        setReports(response.data);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (err) {
      setError('Error fetching reports: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async (query?: HeatmapQuery) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MapApiService.getHeatmap(query);
      if (response.success) {
        setHeatmapData(response.data);
      } else {
        setError('Failed to fetch heatmap data');
      }
    } catch (err) {
      setError('Error fetching heatmap: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MapApiService.getResourceAnalysis();
      if (response.success) {
        setResourceAnalysis(response.data);
      } else {
        setError('Failed to fetch resource analysis');
      }
    } catch (err) {
      setError('Error fetching resource analysis: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MapApiService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError('Error fetching statistics: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MapApiService.getDisasters();
      if (response.success) {
        setDisasters(response.data);
      } else {
        setError('Failed to fetch disasters');
      }
    } catch (err) {
      setError('Error fetching disasters: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    await Promise.all([
      fetchReports(),
      fetchHeatmap(),
      fetchResourceAnalysis(),
      fetchStatistics(),
      fetchDisasters()
    ]);
  };

  // Initial load
  useEffect(() => {
    fetchAll();
  }, []);

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
      resourceAnalysis: fetchResourceAnalysis,
      statistics: fetchStatistics,
      disasters: fetchDisasters,
      all: fetchAll
    }
  };
};
