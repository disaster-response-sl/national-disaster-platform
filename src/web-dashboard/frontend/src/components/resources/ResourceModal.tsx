import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createResource, updateResource } from '../../services/resourceService';
import { Resource, CreateResourceRequest } from '../../types/resource';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource?: Resource;
  mode: 'create' | 'edit';
}

const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  resource,
  mode
}) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateResourceRequest>({
    name: '',
    type: '',
    category: '',
    quantity: { current: 0, unit: '' },
    location: {
      lat: 0,
      lng: 0,
      address: ''
    },
    status: 'available',
    priority: 'medium',
    description: '',
    specifications: {},
    vendor_info: {
      vendor_name: '',
      contact_info: ''
    }
  });

  useEffect(() => {
    if (resource && mode === 'edit') {
      setFormData({
        name: resource.name,
        type: resource.type,
        category: resource.category,
        quantity: resource.quantity || { current: 0, unit: '' },
        location: resource.location,
        status: resource.status,
        priority: resource.priority,
        description: resource.description || '',
        specifications: resource.specifications || {},
        vendor_info: resource.vendor_info || { vendor_name: '', contact_info: '' }
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        type: '',
        category: '',
        quantity: { current: 0, unit: '' },
        location: {
          lat: 0,
          lng: 0,
          address: ''
        },
        status: 'available',
        priority: 'medium',
        description: '',
        specifications: {},
        vendor_info: {
          vendor_name: '',
          contact_info: ''
        }
      });
    }
  }, [resource, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      // Transform formData to match service expectations
      const serviceData = {
        ...formData,
        quantity: typeof formData.quantity === 'object' ? formData.quantity.current : formData.quantity
      };

      if (mode === 'create') {
        await createResource(token, serviceData);
        toast.success('Resource created successfully');
      } else if (mode === 'edit' && resource) {
        await updateResource(token, resource._id, serviceData);
        toast.success('Resource updated successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleQuantityChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      quantity: { ...prev.quantity, [field]: value }
    }));
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const handleVendorChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vendor_info: { ...prev.vendor_info, [field]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-0 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Resource' : 'Edit Resource'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

  <form id="resource-modal-form" onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                <option value="medicine">Medicine</option>
                <option value="food">Food</option>
                <option value="shelter">Shelter</option>
                <option value="water">Water</option>
                <option value="medical_supplies">Medical Supplies</option>
                <option value="transportation">Transportation</option>
                <option value="personnel">Personnel</option>
                <option value="equipment">Equipment</option>
                <option value="clothing">Clothing</option>
                <option value="communication">Communication</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="emergency">Emergency</option>
                <option value="medical">Medical</option>
                <option value="basic_needs">Basic Needs</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="logistics">Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity.current}
                  onChange={(e) => handleQuantityChange('current', parseInt(e.target.value) || 0)}
                  className="w-2/3 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Current"
                />
                <select
                  required
                  value={formData.quantity.unit}
                  onChange={(e) => handleQuantityChange('unit', e.target.value)}
                  className="w-1/3 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unit</option>
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kg</option>
                  <option value="liters">Liters</option>
                  <option value="boxes">Boxes</option>
                  <option value="people">People</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="sets">Sets</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="allocated">Allocated</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.location.lat}
                  onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.location.lng}
                  onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.location.address || ''}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Vendor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.vendor_info?.vendor_name || ''}
                  onChange={(e) => handleVendorChange('vendor_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Info
                </label>
                <input
                  type="text"
                  value={formData.vendor_info?.contact_info || ''}
                  onChange={(e) => handleVendorChange('contact_info', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

        </form>
      </div>
      {/* Action bar always visible at the bottom */}
      <div className="flex justify-end space-x-3 pt-4 border-t bg-white p-4 sticky bottom-0 left-0 z-20">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="resource-modal-form"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Resource' : 'Update Resource'}
        </button>
      </div>
    </div>
    </div>
  );
};

export default ResourceModal;
