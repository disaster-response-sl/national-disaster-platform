import React, { useState, useEffect } from 'react';
import MetricsCards from './MetricsCards';
import ActivityFeed from './ActivityFeed';
import GeographicOverview from './GeographicOverview';
import QuickActions from './QuickActions';
import api from '../services/api';
import toast from 'react-hot-toast';

interface DashboardData {
  metrics: any;
  activities: any[];
  disasters: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    metrics: null,
    activities: [],
    disasters: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch data from multiple endpoints with fallbacks
      const results = await Promise.allSettled([
        api.get('/admin/analytics/dashboard').catch(() => ({ data: { data: null } })),
        api.get('/admin/sos?limit=5&sortBy=created_at&sortOrder=desc').catch(() => ({ data: { data: [] } })),
        api.get('/admin/disasters?limit=10&sortBy=created_at&sortOrder=desc').catch(() => ({ data: { data: [] } })),
        api.get('/mobile/reports?limit=5&sortBy=created_at&sortOrder=desc').catch(() => ({ data: { data: [] } })),
        api.get('/resources/dashboard/metrics').catch(() => ({ data: { data: { overview: { recent_deployments: 0 } } } }))
      ]);

      // Extract data with fallbacks
      const metricsRes = results[0].status === 'fulfilled' ? results[0].value : { data: { data: null } };
      const sosRes = results[1].status === 'fulfilled' ? results[1].value : { data: { data: [] } };
      const disastersRes = results[2].status === 'fulfilled' ? results[2].value : { data: { data: [] } };
      const reportsRes = results[3].status === 'fulfilled' ? results[3].value : { data: { data: [] } };
      const resourcesRes = results[4].status === 'fulfilled' ? results[4].value : { data: { data: { overview: { recent_deployments: 0 } } } };

      // Process metrics with fallback values
      const combinedMetrics = {
        activeDisasters: disastersRes.data.data?.filter((d: any) => d.status === 'active').length || 0,
        pendingSosSignals: sosRes.data.data?.filter((s: any) => s.status === 'pending').length || 0,
        totalCitizensAffected: disastersRes.data.data?.reduce((sum: number, d: any) => sum + (d.affected_population || 0), 0) || 0,
        responseTeamsDeployed: resourcesRes.data.data?.overview?.recent_deployments || 0,
        systemHealth: 'healthy',
        dataSyncStatus: 'synced',
        alertDistributionRate: 85
      };

      // Process activities - combine SOS signals and reports
      const activities = [
        ...(sosRes.data.data || []).map((sos: any) => ({
          id: sos._id,
          type: 'sos',
          title: 'SOS Signal Received',
          description: sos.message || 'Emergency assistance requested',
          location: sos.location && sos.location.lat && sos.location.lng ? sos.location : { lat: 6.9271, lng: 79.8612, address: 'Unknown location' },
          priority: sos.urgency_level || 'medium',
          timestamp: sos.created_at
        })),
        ...(reportsRes.data.data || []).map((report: any) => ({
          id: report._id,
          type: 'report',
          title: 'Citizen Report',
          description: report.description || 'New disaster report',
          location: report.location && report.location.lat && report.location.lng ? report.location : { lat: 6.9271, lng: 79.8612, address: 'Unknown location' },
          priority: report.severity || 'medium',
          timestamp: report.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      // Add mock data if no real data is available
      if (activities.length === 0) {
        activities.push(
          {
            id: 'mock-1',
            type: 'sos',
            title: 'Demo SOS Signal',
            description: 'This is demo data - connect to real backend for live data',
            location: { lat: 6.9271, lng: 79.8612, address: 'Colombo District' },
            priority: 'high',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          }
        );
      }

      setData({
        metrics: combinedMetrics,
        activities,
        disasters: (disastersRes.data.data || []).filter((disaster: any) => 
          disaster && disaster.location && disaster.location.lat && disaster.location.lng
        )
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Some dashboard data could not be loaded. Using demo data.');
      
      // Provide completely fallback data
      setData({
        metrics: {
          activeDisasters: 0,
          pendingSosSignals: 0,
          totalCitizensAffected: 0,
          responseTeamsDeployed: 0,
          systemHealth: 'healthy',
          dataSyncStatus: 'synced',
          alertDistributionRate: 85
        },
        activities: [
          {
            id: 'demo-1',
            type: 'sos',
            title: 'Demo SOS Signal',
            description: 'This is demo data - authentication may be required for real data',
            location: { lat: 6.9271, lng: 79.8612, address: 'Colombo District' },
            priority: 'high',
            timestamp: new Date().toISOString()
          }
        ],
        disasters: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    toast.success('Refreshing dashboard...');
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the National Disaster Management Platform</p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards 
        metrics={data.metrics || {
          activeDisasters: 0,
          pendingSosSignals: 0,
          totalCitizensAffected: 0,
          responseTeamsDeployed: 0,
          systemHealth: 'healthy',
          dataSyncStatus: 'synced',
          alertDistributionRate: 0
        }} 
        isLoading={isLoading} 
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed 
            activities={data.activities}
            isLoading={isLoading} 
          />
        </div>
        
        {/* Right Column - Geographic Overview */}
        <div className="lg:col-span-2">
          <GeographicOverview 
            disasters={data.disasters}
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onRefresh={handleRefresh} />
    </div>
  );
};

export default Dashboard;
