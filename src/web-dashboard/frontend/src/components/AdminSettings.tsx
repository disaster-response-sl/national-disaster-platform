import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Bell,
  Shield,
  Database,
  Server,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

interface SystemSettings {
  alertThresholds: {
    critical: number;
    high: number;
    medium: number;
  };
  autoRefreshInterval: number;
  mapSettings: {
    defaultZoom: number;
    defaultCenter: [number, number];
    clusterDistance: number;
  };
  notificationChannels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook: boolean;
  };
  backupSettings: {
    frequency: string;
    retentionDays: number;
    location: string;
  };
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  totalResources: number;
  systemUptime: string;
  lastBackup: string;
  diskUsage: number;
  memoryUsage: number;
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'operator'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setUsers([
        {
          _id: '1',
          username: 'admin',
          email: 'admin@disaster.gov',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          username: 'operator1',
          email: 'op1@disaster.gov',
          role: 'operator',
          status: 'active',
          lastLogin: '2024-01-15T09:15:00Z',
          createdAt: '2024-01-05T00:00:00Z'
        },
        {
          _id: '3',
          username: 'viewer1',
          email: 'viewer@disaster.gov',
          role: 'viewer',
          status: 'inactive',
          lastLogin: '2024-01-10T14:20:00Z',
          createdAt: '2024-01-10T00:00:00Z'
        }
      ]);

      setSettings({
        alertThresholds: {
          critical: 100,
          high: 50,
          medium: 10
        },
        autoRefreshInterval: 30,
        mapSettings: {
          defaultZoom: 6,
          defaultCenter: [20.5937, 78.9629],
          clusterDistance: 50
        },
        notificationChannels: {
          email: true,
          sms: true,
          push: true,
          webhook: false
        },
        backupSettings: {
          frequency: 'daily',
          retentionDays: 30,
          location: 'cloud'
        }
      });

      setStats({
        totalUsers: 15,
        activeUsers: 12,
        totalReports: 1250,
        totalResources: 450,
        systemUptime: '15 days, 6 hours',
        lastBackup: '2024-01-15T02:00:00Z',
        diskUsage: 65,
        memoryUsage: 78
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // API call to save settings
      console.log('Saving settings:', settings);
      setUnsavedChanges(false);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // API call to create user
      const createdUser: User = {
        _id: Date.now().toString(),
        ...newUser,
        status: 'active',
        lastLogin: '',
        createdAt: new Date().toISOString()
      };
      setUsers([...users, createdUser]);
      setNewUser({ username: '', email: '', password: '', role: 'operator' });
      setShowAddUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      // API call to update user
      setUsers(users.map(u => u._id === user._id ? user : u));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // API call to delete user
        setUsers(users.filter(u => u._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const exportBackup = async () => {
    try {
      // API call to export backup
      console.log('Exporting backup...');
      // Show success message
    } catch (error) {
      console.error('Error exporting backup:', error);
    }
  };

  const importBackup = async (file: File) => {
    try {
      // API call to import backup
      console.log('Importing backup:', file.name);
      // Show success message
    } catch (error) {
      console.error('Error importing backup:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-600">Manage users, system settings, and configurations</p>
            </div>
            {unsavedChanges && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 text-sm">Unsaved changes</span>
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'users', name: 'User Management', icon: Users },
                { id: 'system', name: 'System Settings', icon: Settings },
                { id: 'security', name: 'Security', icon: Shield },
                { id: 'backup', name: 'Backup & Data', icon: Database },
                { id: 'monitoring', name: 'System Monitoring', icon: Server }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'operator' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add User Modal */}
            {showAddUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Add New User</h3>
                    <button onClick={() => setShowAddUser(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => setShowAddUser(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateUser}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && settings && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>

            {/* Alert Thresholds */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Critical (people affected)</label>
                  <input
                    type="number"
                    value={settings.alertThresholds.critical}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        alertThresholds: { ...settings.alertThresholds, critical: Number(e.target.value) }
                      });
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">High (people affected)</label>
                  <input
                    type="number"
                    value={settings.alertThresholds.high}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        alertThresholds: { ...settings.alertThresholds, high: Number(e.target.value) }
                      });
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medium (people affected)</label>
                  <input
                    type="number"
                    value={settings.alertThresholds.medium}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        alertThresholds: { ...settings.alertThresholds, medium: Number(e.target.value) }
                      });
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Channels */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
              <div className="space-y-3">
                {Object.entries(settings.notificationChannels).map(([channel, enabled]) => (
                  <div key={channel} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {channel} notifications
                    </label>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          notificationChannels: { ...settings.notificationChannels, [channel]: e.target.checked }
                        });
                        setUnsavedChanges(true);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Monitoring Tab */}
        {activeTab === 'monitoring' && stats && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500">{stats.activeUsers} active</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Database className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.diskUsage}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Server className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.memoryUsage}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-lg text-gray-900">{stats.systemUptime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Backup</p>
                  <p className="text-lg text-gray-900">
                    {new Date(stats.lastBackup).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup & Data Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Backup & Data Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Export system data for backup or migration purposes.
                </p>
                <button
                  onClick={exportBackup}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Backup
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Import Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import data from a previous backup or external source.
                </p>
                <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer inline-flex">
                  <Upload className="w-4 h-4" />
                  Import Backup
                  <input
                    type="file"
                    accept=".zip,.json"
                    onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
