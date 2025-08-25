import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllResources } from '../../services/resourceService';
import { Resource, ResourceQueryParams, Pagination } from '../../types/resource';
import { canCreateResources, canEditResources, canAllocateResources } from '../../utils/permissions';
import { Search, Filter, MapPin, Package, AlertCircle, Plus } from 'lucide-react';
import ResourceModal from './ResourceModal';
import AllocationModal from './AllocationModal';
import toast from 'react-hot-toast';

const ResourceList: React.FC = () => {
  const { user, token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ResourceQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'updated_at',
    sortOrder: 'desc'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

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

  useEffect(() => {
    fetchResources();
  }, [filters, token]);

  const handleFilterChange = (key: keyof ResourceQueryParams, value: any) => {
    console.log(`Filter change: ${key} = ${value}`);
    if (key === 'page') {
      // When changing page, don't reset to page 1
      setFilters(prev => {
        const newFilters = { ...prev, [key]: value };
        console.log('New filters (page change):', newFilters);
        return newFilters;
      });
    } else {
      // When changing other filters, reset to page 1
      setFilters(prev => {
        const newFilters = { ...prev, [key]: value, page: 1 };
        console.log('New filters (filter change):', newFilters);
        return newFilters;
      });
    }
  };

  const handleRefresh = () => {
    fetchResources();
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setModalMode('edit');
    setShowResourceModal(true);
  };

  const handleAllocateResource = (resource: Resource) => {
    setSelectedResource(resource);
    setShowAllocationModal(true);
  };

  const fetchResources = async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching resources with filters:', filters);
      const response = await getAllResources(token, filters);
      console.log('API Response:', response);
      setResources(response.data || []);
      setPagination(response.pagination || null);
      console.log('Pagination set to:', response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load resources';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'allocated': return 'bg-blue-100 text-blue-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading resources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {canCreateResources(user) && (
          <button 
            onClick={() => {
              setSelectedResource(null);
              setModalMode('create');
              setShowResourceModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="medical">Medical</option>
            <option value="equipment">Equipment</option>
            <option value="vehicles">Vehicles</option>
            <option value="supplies">Supplies</option>
          </select>

          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="emergency">Emergency</option>
                <option value="rescue">Rescue</option>
                <option value="medical">Medical</option>
                <option value="logistics">Logistics</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy || 'updated_at'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="updated_at">Last Updated</option>
                <option value="name">Name</option>
                <option value="quantity">Quantity</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Resource List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredResources.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>No resources found matching your criteria.</p>
            </li>
          ) : (
            filteredResources.map((resource) => (
              <li key={resource._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{resource.name}</h3>
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                          {resource.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(resource.priority)}`}>
                          {resource.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <span className="capitalize">{resource.type} • {resource.category}</span>
                      <span>Qty: {renderQuantity(resource.available_quantity)}/{renderQuantity(resource.quantity)}</span>
                      {resource.location.address && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {resource.location.address}
                        </span>
                      )}
                    </div>
                    
                    {resource.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                    )}
                  </div>
                  
                  {(canEditResources(user) || canAllocateResources(user)) && (
                    <div className="ml-6 flex space-x-2">
                      {canEditResources(user) && (
                        <button 
                          onClick={() => handleEditResource(resource)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      )}
                      {canAllocateResources(user) && (
                        <button 
                          onClick={() => handleAllocateResource(resource)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Allocate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {pagination ? (
            <span>
              Showing page {pagination.page} of {pagination.pages} 
              ({pagination.total} total resources)
            </span>
          ) : (
            <span>Showing {filteredResources.length} resources</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Page {filters.page || 1} of {pagination?.pages || 1}
          </span>
          <button
            onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
            disabled={!pagination?.hasPrev || (filters.page || 1) === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
            disabled={!pagination?.hasNext || (filters.page || 1) >= (pagination?.pages || 1)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <ResourceModal
        isOpen={showResourceModal}
        onClose={() => {
          setShowResourceModal(false);
          setSelectedResource(null);
        }}
        onSuccess={handleRefresh}
        resource={selectedResource || undefined}
        mode={modalMode}
      />

      {selectedResource && (
        <AllocationModal
          isOpen={showAllocationModal}
          onClose={() => {
            setShowAllocationModal(false);
            setSelectedResource(null);
          }}
          onSuccess={handleRefresh}
          resource={selectedResource}
        />
      )}
    </div>
  );
};

export default ResourceList;
