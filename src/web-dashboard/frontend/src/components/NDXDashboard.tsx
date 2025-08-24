import React, { useState } from 'react';
import { Layers, Database, Shield, Download, CheckCircle } from 'lucide-react';
import NDXDataProviders from './NDXDataProviders';
import NDXConsentManagement from './NDXConsentManagement';
import NDXDataExchange from './NDXDataExchange';
import NDXIntegrationSummary from './NDXIntegrationSummary';

const NDXDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'consent' | 'exchange' | 'summary'>('summary');
  
  // Debug log to verify component is loading
  React.useEffect(() => {
    console.log('NDX Dashboard component loaded successfully');
  }, []);

  const tabs = [
    {
      id: 'summary' as const,
      label: 'Integration Summary',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Complete NDX integration overview'
    },
    {
      id: 'providers' as const,
      label: 'Data Providers',
      icon: <Database className="w-5 h-5" />,
      description: 'View available data providers'
    },
    {
      id: 'consent' as const,
      label: 'Consent Management',
      icon: <Shield className="w-5 h-5" />,
      description: 'Manage data exchange consent'
    },
    {
      id: 'exchange' as const,
      label: 'Data Exchange',
      icon: <Download className="w-5 h-5" />,
      description: 'Exchange data with approved consent'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'summary':
        return <NDXIntegrationSummary />;
      case 'providers':
        return <NDXDataProviders />;
      case 'consent':
        return <NDXConsentManagement />;
      case 'exchange':
        return <NDXDataExchange />;
      default:
        return <NDXIntegrationSummary />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NDX Integration Dashboard</h1>
            <p className="text-gray-600">National Data Exchange Platform Integration</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">System Ready</span>
            </div>
            <p className="text-sm text-green-700 mt-1">All features available</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Data Providers</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">Connect to data sources</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Consent Management</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">Control data access permissions</p>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-900">Data Exchange</span>
            </div>
            <p className="text-sm text-indigo-700 mt-1">Retrieve authorized data</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 text-sm">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>
          
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default NDXDashboard;
