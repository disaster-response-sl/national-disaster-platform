import React from 'react';
import { CheckCircle, Layers, Database, Shield, Download, Zap } from 'lucide-react';

const NDXIntegrationSummary: React.FC = () => {
  const integrationSteps = [
    {
      id: 1,
      title: 'NDX Service Layer',
      description: 'Complete API service with all 8 NDX endpoints',
      status: 'completed',
      features: ['Authentication headers', 'TypeScript types', 'Error handling']
    },
    {
      id: 2,
      title: 'Data Providers Component',
      description: 'Display and manage available data providers',
      status: 'completed',
      features: ['GET /api/ndx/providers', 'Loading states', 'Refresh functionality']
    },
    {
      id: 3,
      title: 'Consent Management',
      description: 'Request, approve, and manage consent status',
      status: 'completed',
      features: ['Request consent', 'Approve consent', 'Status checking', 'Revoke consent']
    },
    {
      id: 4,
      title: 'Data Exchange',
      description: 'Exchange data using approved consent',
      status: 'completed',
      features: ['Data exchange', 'Quick disaster info', 'Weather alerts', 'Results display']
    },
    {
      id: 5,
      title: 'Integrated Dashboard',
      description: 'Complete NDX integration with tabbed interface',
      status: 'completed',
      features: ['Tabbed navigation', 'Quick stats', 'All components integrated']
    }
  ];

  const quickActions = [
    {
      title: 'View Data Providers',
      description: 'See available data sources',
      icon: <Database className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      title: 'Manage Consent',
      description: 'Control data access permissions',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      title: 'Exchange Data',
      description: 'Get authorized data',
      icon: <Download className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      title: 'Quick Access',
      description: 'Instant data shortcuts',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">NDX Integration Summary</h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Complete
        </span>
      </div>

      {/* Integration Steps */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Integration Steps</h3>
        <div className="space-y-4">
          {integrationSteps.map((step) => (
            <div key={step.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-800">
                  Step {step.id}: {step.title}
                </h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  ✓ COMPLETED
                </span>
              </div>
              <p className="text-gray-600 mb-3 ml-8">{step.description}</p>
              <div className="ml-8">
                <div className="flex flex-wrap gap-2">
                  {step.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${action.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {action.icon}
                <h4 className="font-medium">{action.title}</h4>
              </div>
              <p className="text-sm opacity-75">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Integrated API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Core Endpoints</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• GET /api/ndx/providers</li>
              <li>• POST /api/ndx/consent/request</li>
              <li>• POST /api/ndx/consent/approve</li>
              <li>• GET /api/ndx/consent/:id</li>
              <li>• POST /api/ndx/consent/revoke</li>
              <li>• POST /api/ndx/data/exchange</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Quick Access</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• POST /api/ndx/data/disaster-info</li>
              <li>• POST /api/ndx/data/weather-alerts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-green-800">Integration Complete!</h4>
        </div>
        <p className="text-green-700 text-sm mt-1">
          All NDX endpoints have been successfully integrated into your dashboard. 
          You can now view data providers, manage consent, and exchange data seamlessly.
        </p>
      </div>
    </div>
  );
};

export default NDXIntegrationSummary;
