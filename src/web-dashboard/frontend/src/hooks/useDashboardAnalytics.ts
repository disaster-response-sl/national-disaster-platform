import { useEffect, useState } from 'react';
import {
  getDashboardStatistics,
  getTimeline,
  getZonesOverlap,
  getResourceSummary
} from '../services/analyticsService';

export function useDashboardAnalytics(token: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statistics, setStatistics] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeline, setTimeline] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [zonesOverlap, setZonesOverlap] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resourceSummary, setResourceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getDashboardStatistics(token),
      getTimeline(token),
      getZonesOverlap(token),
      getResourceSummary(token)
    ])
      .then(([stats, time, overlap, resource]) => {
        setStatistics(stats.data);
        setTimeline(time.data);
        setZonesOverlap(overlap.data);
        setResourceSummary(resource.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load analytics');
      })
      .finally(() => setLoading(false));
  }, [token]);

  return {
    statistics,
    timeline,
    zonesOverlap,
    resourceSummary,
    loading,
    error
  };
}
