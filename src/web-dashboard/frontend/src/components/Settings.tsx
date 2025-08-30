import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, User, Key, Lock } from 'lucide-react';
import MainLayout from './MainLayout';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'access' | 'security'>('profile');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'responder': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'citizen': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5" />;
      case 'responder': return <Users className="w-5 h-5" />;
      case 'citizen': return <User className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'View and manage your profile information'
    },
    {
      id: 'access' as const,
      label: 'Access Management',
      icon: <Key className="w-5 h-5" />,
      description: 'Manage user permissions and access controls'
    },
    {
      id: 'security' as const,
      label: 'Security',
      icon: <Lock className="w-5 h-5" />,
      description: 'Security settings and authentication preferences'
    }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Avatar & Basic Info */}
            <div className="lg:col-span-1 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {getInitials(user?.name || 'User')}
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{user?.name || 'User'}</h3>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getRoleColor(user?.role || '')}`}>
                {getRoleIcon(user?.role || '')}
                {user?.role?.toUpperCase()}
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-normal">Individual ID</span>
                  <span className="text-gray-900 font-medium">{user?.individualId || 'Not available'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-normal">Full Name</span>
                  <span className="text-gray-900 font-medium">{user?.name || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-normal">Email Address</span>
                  <span className="text-gray-900 font-medium">{user?.email || 'Not provided'}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-normal">Phone Number</span>
                    <span className="text-gray-900 font-medium">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'access':
        return (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Management</h3>
            <p className="text-gray-600 mb-4 font-normal">Manage user permissions and access controls</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800 font-normal">
                <strong>Coming Soon:</strong> This feature will allow you to manage user roles, permissions, and access controls for different parts of the system.
              </p>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="text-center py-12">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security Settings</h3>
            <p className="text-gray-600 mb-4 font-normal">Configure security preferences and authentication</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800 font-normal">
                <strong>Coming Soon:</strong> Security features including two-factor authentication, password policies, and session management will be available here.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
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
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600 text-sm font-normal">
                  {tabs.find(t => t.id === activeTab)?.description}
                </p>
              </div>

              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
