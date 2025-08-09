import React, { useState } from 'react';
import { Plus, Shield, Radio, AlertTriangle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { dashboardService } from '../services/dashboardService';

interface QuickActionsProps {
  onRefresh: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  const [alertForm, setAlertForm] = useState({
    type: 'flood',
    severity: 'medium',
    description: '',
    location: { lat: 6.9271, lng: 79.8612 }
  });

  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    priority: 'medium'
  });

  const handleCreateAlert = async () => {
    if (!alertForm.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsCreatingAlert(true);
    try {
      const success = await dashboardService.createDisasterAlert({
        type: alertForm.type,
        severity: alertForm.severity as any,
        description: alertForm.description,
        location: alertForm.location,
        status: 'active',
        timestamp: new Date().toISOString()
      });

      if (success) {
        toast.success('Disaster alert created successfully');
        setShowCreateForm(false);
        setAlertForm({ type: 'flood', severity: 'medium', description: '', location: { lat: 6.9271, lng: 79.8612 } });
        onRefresh();
      } else {
        toast.error('Failed to create disaster alert');
      }
    } catch (error) {
      toast.error('Error creating disaster alert');
    } finally {
      setIsCreatingAlert(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsBroadcasting(true);
    try {
      const success = await dashboardService.broadcastEmergencyMessage(
        broadcastForm.message,
        broadcastForm.priority
      );

      if (success) {
        toast.success('Emergency message broadcasted successfully');
        setShowBroadcastForm(false);
        setBroadcastForm({ message: '', priority: 'medium' });
      } else {
        toast.error('Failed to broadcast message');
      }
    } catch (error) {
      toast.error('Error broadcasting message');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Emergency Management</h3>
        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          Quick Actions
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Create New Disaster Alert */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors group"
        >
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-red-100 rounded-full group-hover:bg-red-200">
              <Plus className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Create Alert</p>
            <p className="text-xs text-gray-500">New disaster event</p>
          </div>
        </button>

        {/* View All SOS Signals */}
        <button 
          onClick={() => navigate('/sos')}
          className="flex items-center justify-center p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group"
        >
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full group-hover:bg-orange-200">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">SOS Signals</p>
            <p className="text-xs text-gray-500">Emergency requests</p>
          </div>
        </button>

        {/* Broadcast Emergency Message */}
        <button
          onClick={() => setShowBroadcastForm(true)}
          className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
        >
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200">
              <Radio className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Broadcast</p>
            <p className="text-xs text-gray-500">Public alerts</p>
          </div>
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              Create New Disaster Alert
            </h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={alertForm.type}
                onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="flood">Flood</option>
                <option value="landslide">Landslide</option>
                <option value="fire">Fire</option>
                <option value="earthquake">Earthquake</option>
                <option value="cyclone">Cyclone</option>
                <option value="drought">Drought</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={alertForm.severity}
                onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={alertForm.description}
              onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
              placeholder="Describe the disaster situation..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAlert}
              disabled={isCreatingAlert}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
            >
              {isCreatingAlert ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Create Alert
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Form */}
      {showBroadcastForm && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Radio className="w-5 h-5 text-blue-600 mr-2" />
              Broadcast Emergency Message
            </h4>
            <button
              onClick={() => setShowBroadcastForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={broadcastForm.priority}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              placeholder="Enter emergency message to broadcast to all users..."
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowBroadcastForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
            >
              {isBroadcasting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Broadcast Message
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
