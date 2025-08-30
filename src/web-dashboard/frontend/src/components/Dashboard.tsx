import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Package, Layers } from 'lucide-react';
import MainLayout from './MainLayout';
import AnalyticsDashboard from './AnalyticsDashboard';

const Dashboard: React.FC = () => {

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Quick Access Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                to="/disasters"
                className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-blue-200 transition-colors"
              >
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">Disaster Management</h3>
                    <p className="text-blue-600 text-sm">Monitor and manage active disasters</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/sos"
                className="bg-red-50 hover:bg-red-100 p-6 rounded-lg border border-red-200 transition-colors"
              >
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-medium text-red-900">SOS Dashboard</h3>
                    <p className="text-red-600 text-sm">Emergency response management</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/resources"
                className="bg-green-50 hover:bg-green-100 p-6 rounded-lg border border-green-200 transition-colors"
              >
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-medium text-green-900">Resource Management</h3>
                    <p className="text-green-600 text-sm">Manage disaster response resources</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/ndx"
                className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-blue-200 transition-colors"
              >
                <div className="flex items-center">
                  <Layers className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">NDX Integration</h3>
                    <p className="text-blue-600 text-sm">National Data Exchange Platform</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="mb-8">
            <AnalyticsDashboard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
