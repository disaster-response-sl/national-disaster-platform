import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { allocateResource } from '../../services/resourceService';
import { Resource } from '../../types/resource';
import { X, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource: Resource;
}

const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  resource
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    disaster_id: '',
    location: {
      lat: 0,
      lng: 0,
      address: ''
    },
    estimated_duration: 24,
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  // Helper function to safely render quantity values
  const renderQuantity = (value: number | { current: number; unit?: string }): string => {
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object' && value !== null) {
      // If it's an object with current property, use that
      if ('current' in value) return value.current.toString();
      // Otherwise, try to extract a meaningful number
      return JSON.stringify(value);
    }
    return String(value || 0);
  };

  // Helper function to get numeric quantity value
  const getNumericQuantity = (value: number | { current: number; unit?: string }): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null) {
      // If it's an object with current property, use that
      if ('current' in value) return Number(value.current) || 0;
    }
    return Number(value) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate required fields
    if (formData.location.lat === 0 && formData.location.lng === 0) {
      toast.error('Please provide valid deployment coordinates');
      return;
    }

    if (!formData.disaster_id.trim()) {
      toast.error('Disaster ID is required');
      return;
    }

    const availableQty = getNumericQuantity(resource.available_quantity);
    if (formData.quantity > availableQty) {
      toast.error(`Cannot allocate more than ${availableQty} units`);
      return;
    }

    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const allocationData = {
        quantity: formData.quantity,
        disaster_id: formData.disaster_id,
        location: formData.location,
        estimated_duration: formData.estimated_duration
      };
      await allocateResource(token, resource._id, allocationData);
      toast.success('Resource allocated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Allocation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Allocate Resource</h2>
            <p className="text-gray-600 mt-1">Configure deployment details for {resource.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resource Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{resource.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {resource.type} • {resource.category}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Available</div>
              <div className="text-lg font-semibold text-green-600">
                {renderQuantity(resource.available_quantity)} / {renderQuantity(resource.quantity)}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
                  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' }
                ].map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => handleInputChange('priority', priority.value)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                      formData.priority === priority.value
                        ? `${priority.color} border-opacity-100`
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Allocate
              </label>
              <input
                type="number"
                required
                min="1"
                max={getNumericQuantity(resource.available_quantity)}
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum available: {renderQuantity(resource.available_quantity)} units
              </p>
            </div>

            {/* Disaster ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disaster ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.disaster_id}
                onChange={(e) => handleInputChange('disaster_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter the disaster ID to allocate resources to"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the ID of an existing disaster record
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (hours)
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimated_duration}
                onChange={(e) => handleInputChange('estimated_duration', parseInt(e.target.value) || 24)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Deployment Location */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Deployment Location</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.location.lat}
                    onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.location.lng}
                    onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Deployment address"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Any additional notes for this allocation"
              />
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-semibold text-base"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Allocating...</span>
                </div>
              ) : (
                'Allocate Resource'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationModal;
