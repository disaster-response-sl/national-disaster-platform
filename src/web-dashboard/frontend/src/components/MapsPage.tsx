import React from 'react';
import { ArrowLeft } from 'lucide-react';
import SimpleMap from './SimpleMap';
import MainLayout from './MainLayout';

interface MapsPageProps {
  onBack: () => void;
}

const MapsPage: React.FC<MapsPageProps> = ({ onBack }) => {
  return (
    <MainLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Disaster Risk Maps</h1>
                <p className="text-sm text-gray-600">Real-time monitoring and response system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Live API Integration</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Content - Map */}
        <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow">
          <SimpleMap />
        </div>
      </div>
    </MainLayout>
  );
};

export default MapsPage;
