import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllResources, allocateResource } from '../../services/resourceService';
import { Resource } from '../../types/resource';
import { X, Package, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuickAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QuickAllocationModal: React.FC<QuickAllocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [allocationData, setAllocationData] = useState({
    quantity: 1,
    disaster_id: '',
    location: {
      lat: 0,
      lng: 0,
      address: ''
    },
    estimated_duration: 24
  });

  useEffect(() => {
    if (isOpen && token) {
      fetchAvailableResources();
    }
  }, [isOpen, token]);

  const fetchAvailableResources = async () => {
    if (!token) {
      console.error('No authentication token available');
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      const response = await getAllResources(token, {
        status: 'available',
        limit: 20,
        sortBy: 'priority',
        sortOrder: 'desc'
      });
      // Filter resources with available quantity > 0
      const availableResources = (response.data || []).filter(
        (resource: Resource) => resource.available_quantity > 0
      );
      setResources(availableResources);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      toast.error('Failed to load available resources');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    setAllocationData(prev => ({
      ...prev,
      quantity: Math.min(1, resource.available_quantity)
    }));
  };

  const handleAllocation = async () => {
    if (!selectedResource || !token) return;

    if (allocationData.quantity > selectedResource.available_quantity) {
      toast.error(`Cannot allocate more than ${selectedResource.available_quantity} units`);
      return;
    }

    try {
      setLoading(true);
      await allocateResource(token, selectedResource._id, allocationData);
      toast.success(`Successfully allocated ${allocationData.quantity} units of ${selectedResource.name}`);
      onSuccess();
      onClose();
      setSelectedResource(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Allocation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setAllocationData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: string, value: any) => {
    setAllocationData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Resource Allocation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Resources */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Available Resources</h3>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>No resources available for allocation</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {resources.map((resource) => (
                  <div
                    key={resource._id}
                    onClick={() => handleResourceSelect(resource)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedResource?._id === resource._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{resource.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {resource.type} • {resource.category}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {resource.location.address || `${resource.location.lat}, ${resource.location.lng}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          resource.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          resource.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          resource.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {resource.priority}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {resource.available_quantity} available
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allocation Form */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Allocation Details</h3>
            {selectedResource ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedResource.name}</h4>
                  <p className="text-sm text-blue-700">
                    Available: {selectedResource.available_quantity} units
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Allocate *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedResource.available_quantity}
                    value={allocationData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disaster ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={allocationData.disaster_id}
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
                    value={allocationData.estimated_duration}
                    onChange={(e) => handleInputChange('estimated_duration', parseInt(e.target.value) || 24)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Deployment Location</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={allocationData.location.lat}
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
                        value={allocationData.location.lng}
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
                      value={allocationData.location.address}
                      onChange={(e) => handleLocationChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Deployment address"
                    />
                  </div>
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
                    onClick={handleAllocation}
                    disabled={loading || !selectedResource}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Allocating...' : 'Allocate Resource'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Select a resource from the list to allocate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAllocationModal;
