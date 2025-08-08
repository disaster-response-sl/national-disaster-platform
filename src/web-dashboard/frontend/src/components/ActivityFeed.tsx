import React from 'react';
import { AlertTriangle, MessageSquare, Shield, Bell, MapPin, Clock } from 'lucide-react';
import type { ActivityFeedItem } from '../services/dashboardService';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  isLoading: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading }) => {
  const getActivityIcon = (type: string, priority?: string) => {
    switch (type) {
      case 'sos':
        return (
          <div className={`p-2 rounded-full ${
            priority === 'critical' ? 'bg-red-100' : 
            priority === 'high' ? 'bg-orange-100' : 'bg-yellow-100'
          }`}>
            <Shield className={`w-4 h-4 ${
              priority === 'critical' ? 'text-red-600' : 
              priority === 'high' ? 'text-orange-600' : 'text-yellow-600'
            }`} />
          </div>
        );
      case 'report':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
        );
      case 'team_update':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <AlertTriangle className="w-4 h-4 text-green-600" />
          </div>
        );
      case 'system_alert':
        return (
          <div className="p-2 bg-purple-100 rounded-full">
            <Bell className="w-4 h-4 text-purple-600" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <Bell className="w-4 h-4 text-gray-600" />
          </div>
        );
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const colors: { [key: string]: string } = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Activity Feed</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Real-time Activity Feed</h3>
        <div className="flex items-center text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          Live
        </div>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              {getActivityIcon(activity.type, activity.priority)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {activity.priority && getPriorityBadge(activity.priority)}
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {activity.description}
                </p>
                
                {activity.location && (
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>
                      {activity.location.address || 
                       `${activity.location.lat.toFixed(4)}, ${activity.location.lng.toFixed(4)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Activities →
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
