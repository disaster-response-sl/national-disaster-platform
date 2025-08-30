import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, Users, AlertTriangle, MapPin, Package, Layers } from 'lucide-react';
import MainLayout from './MainLayout';
import AnalyticsDashboard from './AnalyticsDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'responder': return 'bg-blue-100 text-blue-800';
      case 'citizen': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'responder': return <Users className="w-4 h-4" />;
      case 'citizen': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* User Info Card */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Individual ID:</span>
                    <span className="font-medium">{user?.individualId || 'Not available'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{user?.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{user?.email || 'Not provided'}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-center">
                  <div className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(user?.role || '')}`}>
                    {getRoleIcon(user?.role || '')}
                    {user?.role?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                className="bg-purple-50 hover:bg-purple-100 p-6 rounded-lg border border-purple-200 transition-colors"
              >
                <div className="flex items-center">
                  <Layers className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-medium text-purple-900">NDX Integration</h3>
                    <p className="text-purple-600 text-sm">National Data Exchange Platform</p>
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
