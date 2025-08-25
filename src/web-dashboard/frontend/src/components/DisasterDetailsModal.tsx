import React, { useState } from 'react';
import { X, MapPin, Clock, Users, AlertTriangle, Edit3, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Disaster, disasterService } from '../services/disasterService';

interface DisasterDetailsModalProps {
  disaster: Disaster;
  onClose: () => void;
  onUpdate: () => void;
}

const DisasterDetailsModal: React.FC<DisasterDetailsModalProps> = ({ 
  disaster, 
  onClose, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: disaster.status,
    priority_level: disaster.priority_level || 'medium',
    response_status: disaster.response_status || 'preparing',
    incident_commander: disaster.incident_commander || '',
    contact_number: disaster.contact_number || '',
    alert_message: disaster.alert_message || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!disaster._id) return;

    setLoading(true);
    try {
      await disasterService.updateDisaster(disaster._id, editData);
      toast.success('Disaster updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update disaster');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'landslide': return '⛰️';
      case 'cyclone': return '🌀';
      case 'fire': return '🔥';
      case 'earthquake': return '🌍';
      case 'drought': return '🏜️';
      case 'tsunami': return '🌊';
      default: return '⚠️';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white my-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="text-3xl mr-3">{getTypeIcon(disaster.type)}</div>
            <div>
              <h3 className="text-xl font-medium text-gray-900">{disaster.title}</h3>
              <p className="text-sm text-gray-500">{disaster.disaster_code}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <div className="mt-1 text-sm text-gray-900 capitalize">{disaster.type}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(disaster.severity)}`}>
                      {disaster.severity}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(disaster.status)}`}>
                        {disaster.status}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority Level</label>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={editData.priority_level}
                        onChange={(e) => setEditData(prev => ({ ...prev, priority_level: e.target.value as any }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900 capitalize">{disaster.priority_level}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Response Status</label>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={editData.response_status}
                        onChange={(e) => setEditData(prev => ({ ...prev, response_status: e.target.value as any }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="preparing">Preparing</option>
                        <option value="responding">Responding</option>
                        <option value="recovery">Recovery</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900 capitalize">{disaster.response_status}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(disaster.createdAt)}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Description</h4>
              <p className="text-sm text-gray-700">{disaster.description}</p>
            </div>

            {disaster.location && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </h4>
                <div className="text-sm text-gray-900">
                  Latitude: {disaster.location.lat.toFixed(6)}<br />
                  Longitude: {disaster.location.lng.toFixed(6)}
                </div>
              </div>
            )}

            {disaster.zones && disaster.zones.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Affected Zones</h4>
                <div className="space-y-2">
                  {disaster.zones.map((zone, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{zone.zone_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Population: {zone.estimated_population?.toLocaleString() || 'Unknown'} | 
                            Area: {zone.area_km2} km² | 
                            Risk: <span className="capitalize">{zone.risk_level}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact & Management Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incident Commander</label>
                  <div className="mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.incident_commander}
                        onChange={(e) => setEditData(prev => ({ ...prev, incident_commander: e.target.value }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{disaster.incident_commander || 'Not assigned'}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <div className="mt-1">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.contact_number}
                        onChange={(e) => setEditData(prev => ({ ...prev, contact_number: e.target.value }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{disaster.contact_number || 'Not provided'}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reporting Agency</label>
                  <div className="mt-1 text-sm text-gray-900">{disaster.reporting_agency || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Timeline
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Duration</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {disaster.estimated_duration ? `${disaster.estimated_duration} hours` : 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Actual Duration</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {disaster.actual_duration ? `${disaster.actual_duration} hours` : 'Ongoing'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(disaster.updatedAt)}</div>
                </div>
              </div>
            </div>

            {(disaster.public_alert || disaster.alert_message) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Alert Settings
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Public Alert</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {disaster.public_alert ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Evacuation Required</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {disaster.evacuation_required ? 'Yes' : 'No'}
                    </div>
                  </div>
                  {disaster.alert_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alert Message</label>
                      <div className="mt-1">
                        {isEditing ? (
                          <textarea
                            value={editData.alert_message}
                            onChange={(e) => setEditData(prev => ({ ...prev, alert_message: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 bg-white p-2 rounded border">
                            {disaster.alert_message}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {disaster.resources_required && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Resources Required</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Personnel: {disaster.resources_required.personnel || 0}</div>
                  <div>Rescue Teams: {disaster.resources_required.rescue_teams || 0}</div>
                  <div>Medical Units: {disaster.resources_required.medical_units || 0}</div>
                  <div>Vehicles: {disaster.resources_required.vehicles || 0}</div>
                  <div>Food: {disaster.resources_required.food_supplies || 0} kg</div>
                  <div>Water: {disaster.resources_required.water_supplies || 0} L</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterDetailsModal;
