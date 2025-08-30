import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import MainLayout from './MainLayout';

const Settings: React.FC = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-8 h-8 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Settings page coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
