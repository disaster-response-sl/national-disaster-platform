import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { allocateResource } from '../../services/resourceService';
import { Resource } from '../../types/resource';
import { X } from 'lucide-react';
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
  const renderQuantity = (value: any): string => {
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
  const getNumericQuantity = (value: any): number => {
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

    const availableQty = getNumericQuantity(resource.available_quantity);
    if (formData.quantity > availableQty) {
      toast.error(`Cannot allocate more than ${availableQty} units`);
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Allocate Resource: {resource.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Available: <span className="font-medium">{renderQuantity(resource.available_quantity)}</span> / {renderQuantity(resource.quantity)}
          </p>
          <p className="text-sm text-gray-600">
            Type: <span className="font-medium capitalize">{resource.type}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Allocate *
            </label>
            <input
              type="number"
              required
              min="1"
              max={getNumericQuantity(resource.available_quantity)}
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disaster ID (Optional)
            </label>
            <input
              type="text"
              value={formData.disaster_id}
              onChange={(e) => handleInputChange('disaster_id', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter disaster ID if applicable"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (hours)
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimated_duration}
              onChange={(e) => handleInputChange('estimated_duration', parseInt(e.target.value) || 24)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Deployment Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.location.lat}
                  onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.location.lng}
                  onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Deployment address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes for this allocation"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Allocating...' : 'Allocate Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocationModal;
