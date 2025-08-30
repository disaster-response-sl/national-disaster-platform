import React, { useState } from 'react';
import { Database, Shield, Download, Upload, AlertTriangle } from 'lucide-react';
import NDXDataProviders from './NDXDataProviders';
import NDXConsentManagement from './NDXConsentManagement';
import NDXDataExchange from './NDXDataExchange';
import ImportExportPage from './ImportExportPage';
import SOSDashboard from './SOSDashboard';
// import NDXIntegrationSummary from './NDXIntegrationSummary';

const NDXDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'consent' | 'exchange' | 'import-export' | 'sos'>('providers');

  const tabs = [
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
    },
    {
      id: 'import-export' as const,
      label: 'Import & Export',
      icon: <Upload className="w-5 h-5" />,
      description: 'Bulk import and export disaster data'
    },
    {
      id: 'sos' as const,
      label: 'SOS Emergency',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Monitor and manage SOS emergency signals'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'providers':
        return <NDXDataProviders />;
      case 'consent':
        return <NDXConsentManagement />;
      case 'exchange':
        return <NDXDataExchange />;
      case 'import-export':
        return <ImportExportPage onBack={() => setActiveTab('providers')} />;
      case 'sos':
        return <SOSDashboard standalone={false} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
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
