import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Users, AlertTriangle, Activity, MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import NDXDashboard from './NDXDashboard';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

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
      case 'responder': return <Activity className="w-4 h-4" />;
      case 'citizen': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Disaster Response Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || user?.individualId}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                    {getRoleIcon(user?.role || '')}
                    {user?.role?.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to the Dashboard!
              </h2>
              <p className="text-gray-600 mb-6">
                You have successfully logged in to the Disaster Response Platform.
              </p>
              
              {/* User Info Card */}
              <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Account</h3>
                <div className="space-y-3 text-left">
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
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role:</span>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                      {getRoleIcon(user?.role || '')}
                      {user?.role?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {/* Maps Navigation Button */}
                  <button
                    onClick={() => navigate('/maps')}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-full">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Interactive Maps</h3>
                      <p className="text-blue-100 text-sm">
                        View disaster reports, heatmaps, and resource analysis on interactive maps
                      </p>
                      <div className="flex items-center justify-center mt-3 text-blue-200">
                        <Navigation className="w-4 h-4 mr-1" />
                        <span className="text-xs">Open Maps →</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>

                  {/* Dashboard Analytics Button */}
                  <button
                    onClick={() => {
                      // Scroll to NDX Dashboard section
                      const element = document.getElementById('ndx-dashboard');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-full">
                          <Activity className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                      <p className="text-green-100 text-sm">
                        View system analytics, reports, and platform performance metrics
                      </p>
                      <div className="flex items-center justify-center mt-3 text-green-200">
                        <Activity className="w-4 h-4 mr-1" />
                        <span className="text-xs">View Analytics ↓</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>

              <div className="mt-8" id="ndx-dashboard">
                <NDXDashboard />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
