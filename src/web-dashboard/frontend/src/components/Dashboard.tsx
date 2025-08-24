import React from 'react';
import SimpleMap from './SimpleMap';

const Dashboard = () => {
  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Disaster Management Platform</h1>
              <p className="text-sm text-gray-600">Real-time monitoring and response system</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Live API Integration</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Map */}
      <main className="h-[calc(100vh-80px)]">
        <SimpleMap />
      </main>
    </div>
  );
};

export default Dashboard;
