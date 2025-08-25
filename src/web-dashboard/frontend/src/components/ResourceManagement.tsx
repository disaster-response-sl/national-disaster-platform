import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { canAccessResourceManagement } from '../utils/permissions';
import { Package, BarChart3, List, Truck, AlertCircle } from 'lucide-react';
import ResourceOverview from './resources/ResourceOverview';
import ResourceInventory from './resources/ResourceInventory';
import ResourceList from './resources/ResourceList';
import AllocationTracking from './resources/AllocationTracking';

type TabType = 'overview' | 'inventory' | 'list' | 'tracking';

const ResourceManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Check if user has permission to access resource management
  if (!canAccessResourceManagement(user)) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <AlertCircle className="w-8 h-8 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Access Restricted</h3>
            <p className="text-sm">Resource management is only available to administrators and responders.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'inventory' as TabType, label: 'Inventory', icon: Package },
    { id: 'list' as TabType, label: 'Resources', icon: List },
    { id: 'tracking' as TabType, label: 'Deployments', icon: Truck }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ResourceOverview />;
      case 'inventory':
        return <ResourceInventory />;
      case 'list':
        return <ResourceList />;
      case 'tracking':
        return <AllocationTracking />;
      default:
        return <ResourceOverview />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-8 px-4 sm:px-6 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center space-x-1 sm:space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ResourceManagement;
