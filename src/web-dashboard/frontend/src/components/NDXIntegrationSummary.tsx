import React from 'react';
import { CheckCircle, Layers, Database, Shield, Download, Zap } from 'lucide-react';
import MainLayout from './MainLayout';

const NDXIntegrationSummary: React.FC = () => {
  const integrationSteps = [
    {
      id: 1,
      title: 'Data Service',
      description: 'Secure access to disaster and weather information',
      status: 'completed',
      features: ['Secure authentication', 'Real-time data', 'Error handling']
    },
    {
      id: 2,
      title: 'Data Providers',
      description: 'Browse available information sources',
      status: 'completed',
      features: ['Provider directory', 'Live status', 'Easy refresh']
    },
    {
      id: 3,
      title: 'Consent Management',
      description: 'Control your data sharing preferences and permissions',
      status: 'completed',
      features: ['Grant permissions', 'Review access', 'Monitor usage', 'Revoke access']
    },
    {
      id: 4,
      title: 'Data Access',
      description: 'Access authorized information when you need it',
      status: 'completed',
      features: ['Secure access', 'Disaster information', 'Weather alerts', 'Real-time updates']
    },
    {
      id: 5,
      title: 'Unified Dashboard',
      description: 'Your complete disaster response interface',
      status: 'completed',
      features: ['Easy navigation', 'Quick overview', 'Integrated tools']
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
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      title: 'Exchange Data',
      description: 'Access authorized information',
      icon: <Download className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      title: 'Quick Access',
      description: 'Fast information retrieval',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  ];

  return (
    <MainLayout>
      <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Data Platform Overview</h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Active
        </span>
      </div>

      {/* Platform Features */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Platform Features</h3>
        <div className="space-y-4">
          {integrationSteps.map((step) => (
            <div key={step.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-800">
                  {step.title}
                </h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  ✓ AVAILABLE
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

      {/* Success Message */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-green-800">Platform Ready!</h4>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Your disaster response platform is fully operational. 
          Access real-time data, manage permissions, and get instant alerts seamlessly.
        </p>
      </div>
      </div>
    </MainLayout>
  );
};

export default NDXIntegrationSummary;
