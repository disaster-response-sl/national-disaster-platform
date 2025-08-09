import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import toast from 'react-hot-toast';

interface Resource {
  _id: string;
  name: string;
  type: string;
  category: string;
  quantity: {
    current: number;
    allocated: number;
    reserved: number;
    unit: string;
  };
  status: 'available' | 'dispatched' | 'reserved' | 'depleted';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  supplier?: string | {
    name?: string;
    contact?: string;
    organization?: string;
  };
  created_at: string;
  updated_at: string;
}

interface DashboardMetrics {
  overview: {
    total_resources: number;
    low_stock_alerts: number;
    avg_utilization_rate: number;
    recent_deployments: number;
  };
  breakdown: {
    by_status: Array<{ _id: string; count: number; total_quantity: number }>;
    by_type: Array<{ _id: string; count: number; total_quantity: number }>;
  };
}

// Helper function to safely get supplier name
const getSupplierName = (supplier?: string | { name?: string; contact?: string; organization?: string }): string => {
  if (!supplier) return '';
  if (typeof supplier === 'string') return supplier;
  return supplier.name || '';
};

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    quantity: { current: 0, unit: '' },
    location: { lat: 6.9271, lng: 79.8612, address: '' }, // Default to Colombo, Sri Lanka
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    supplier: { name: '', contact: '', organization: '' }
  });

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    dispatched: 'bg-blue-100 text-blue-800', 
    reserved: 'bg-yellow-100 text-yellow-800',
    depleted: 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    console.log('🔄 ResourceManagement: Loading data...');
    try {
      const [resourcesData, metricsData] = await Promise.all([
        resourceService.getAllResources().catch((error: any) => {
          console.error('Error loading resources:', error);
          toast.error('Could not load resources data');
          return [];
        }),
        resourceService.getDashboardMetrics().catch((error: any) => {
          console.error('Error loading metrics:', error);
          toast.error('Could not load metrics data');
          return {
            overview: {
              total_resources: 0,
              low_stock_alerts: 0,
              avg_utilization_rate: 0,
              recent_deployments: 0
            },
            breakdown: {
              by_status: [],
              by_type: []
            }
          };
        })
      ]);
      
      console.log('📊 Resources loaded:', resourcesData.length);
      console.log('📈 Metrics loaded:', metricsData);
      
      setResources(resourcesData);
      setMetrics(metricsData);
      
      if (resourcesData.length === 0) {
        toast('No resources found. Click "Add Resource" to create your first resource.', {
          icon: 'ℹ️',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error loading resource data:', error);
      toast.error('Failed to load resource data');
      // Set empty state
      setResources([]);
      setMetrics({
        overview: {
          total_resources: 0,
          low_stock_alerts: 0,
          avg_utilization_rate: 0,
          recent_deployments: 0
        },
        breakdown: {
          by_status: [],
          by_type: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async () => {
    try {
      await resourceService.createResource(formData);
      toast.success('Resource created successfully');
      setShowAddModal(false);
      setFormData({
        name: '',
        type: '',
        category: '',
        quantity: { current: 0, unit: '' },
        location: { lat: 6.9271, lng: 79.8612, address: '' },
        priority: 'medium',
        supplier: { name: '', contact: '', organization: '' }
      });
      loadData();
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource');
    }
  };

  const handleEditResource = async () => {
    if (!selectedResource) return;
    
    try {
      await resourceService.updateResource(selectedResource._id, formData);
      toast.success('Resource updated successfully');
      setShowEditModal(false);
      setSelectedResource(null);
      loadData();
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await resourceService.deleteResource(id);
      toast.success('Resource deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const openEditModal = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      category: resource.category,
      quantity: { current: resource.quantity.current, unit: resource.quantity.unit },
      location: { 
        lat: resource.location.lat, 
        lng: resource.location.lng, 
        address: resource.location.address || '' 
      },
      priority: resource.priority,
      supplier: typeof resource.supplier === 'string' 
        ? { name: resource.supplier, contact: '', organization: '' }
        : {
            name: resource.supplier?.name || '',
            contact: resource.supplier?.contact || '',
            organization: resource.supplier?.organization || ''
          }
    });
    setShowEditModal(true);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getAvailableQuantity = (resource: Resource) => {
    return resource.quantity.current - resource.quantity.allocated - resource.quantity.reserved;
  };

  const getUtilizationRate = (resource: Resource) => {
    const used = resource.quantity.allocated + resource.quantity.reserved;
    return resource.quantity.current > 0 ? (used / resource.quantity.current) * 100 : 0;
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
              <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
              <p className="text-gray-600">Monitor and manage disaster response resources</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Resources</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.overview.total_resources}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.overview.low_stock_alerts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Truck className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Deployments</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.overview.recent_deployments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.overview.avg_utilization_rate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="dispatched">Dispatched</option>
              <option value="reserved">Reserved</option>
              <option value="depleted">Depleted</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="medical_supplies">Medical Supplies</option>
              <option value="food">Food</option>
              <option value="water">Water</option>
              <option value="shelter">Shelter</option>
              <option value="equipment">Equipment</option>
              <option value="vehicles">Vehicles</option>
            </select>

            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                          {resource.supplier && (
                            <div className="text-sm text-gray-500">Supplier: {getSupplierName(resource.supplier)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{resource.type}</div>
                      <div className="text-sm text-gray-500">{resource.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getAvailableQuantity(resource)} / {resource.quantity.current} {resource.quantity.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Allocated: {resource.quantity.allocated} | Reserved: {resource.quantity.reserved}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[resource.status]}`}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[resource.priority]}`}>
                        {resource.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {resource.location.address || `${resource.location.lat}, ${resource.location.lng}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(getUtilizationRate(resource), 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{Math.round(getUtilizationRate(resource))}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditModal(resource)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Resource"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteResource(resource._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Resource"
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
          
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No resources found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Resource</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Resource name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., medical_supplies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., emergency"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity.current}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: { ...prev.quantity, current: Number(e.target.value) } }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={formData.quantity.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: { ...prev.quantity, unit: e.target.value } }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., units, liters"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, lat: Number(e.target.value) } }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="6.9271"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, lng: Number(e.target.value) } }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="79.8612"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Supplier Information */}
              <div className="col-span-3">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Supplier Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                    <input
                      type="text"
                      value={formData.supplier.name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        supplier: { ...prev.supplier, name: e.target.value } 
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <input
                      type="text"
                      value={formData.supplier.contact}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        supplier: { ...prev.supplier, contact: e.target.value } 
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone or email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      value={formData.supplier.organization}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        supplier: { ...prev.supplier, organization: e.target.value } 
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Organization name"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResource}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Resource</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity.current}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: { ...prev.quantity, current: Number(e.target.value) } }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={formData.quantity.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: { ...prev.quantity, unit: e.target.value } }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Supplier Information */}
              <div className="col-span-3">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Supplier Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                    <input
                      type="text"
                      value={formData.supplier.name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        supplier: { ...prev.supplier, name: e.target.value } 
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <input
                      type="text"
                      value={formData.supplier.contact}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        supplier: { ...prev.supplier, contact: e.target.value } 
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone or email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      value={formData.supplier.organization}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        supplier: { ...prev.supplier, organization: e.target.value } 
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Organization name"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditResource}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Update Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
