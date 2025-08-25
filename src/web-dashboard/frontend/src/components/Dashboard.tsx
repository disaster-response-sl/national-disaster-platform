import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Shield, Users, AlertTriangle, Activity, MapPin } from 'lucide-react';
import { canAccessResourceManagement } from '../utils/permissions';
import toast from 'react-hot-toast';
import NDXDashboard from './NDXDashboard';
import ResourceManagement from './ResourceManagement';
import NotificationBell from './NotificationBell';

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
              <NotificationBell />
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

              <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <Activity className="w-8 h-8 text-green-600 mr-4" />
                      <div>
                        <h3 className="text-lg font-medium text-green-900">Resources</h3>
                        <p className="text-green-600 text-sm">Manage disaster response resources</p>
                      </div>
                    </div>
                  </div>
                </div>

                <NDXDashboard />
              </div>

              {/* Resource Management Section - Only for Admin/Responder */}
              {canAccessResourceManagement(user) && (
                <>
                  {/* Section Divider */}
                  <div className="mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
                    <div className="text-center mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Resource Management</h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Manage disaster response resources and deployments
                      </p>
                    </div>
                    <ResourceManagement />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
