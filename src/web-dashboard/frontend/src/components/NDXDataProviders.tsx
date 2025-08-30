import React, { useState, useEffect } from 'react';
import { ndxService } from '../services/ndxService';
import { Database, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DataProvider {
  id: string;
  name: string;
}

const NDXDataProviders: React.FC = () => {
  const [providers, setProviders] = useState<DataProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ndxService.getProviders();
      if (response.success) {
        setProviders(response.providers);
        toast.success('Data providers loaded successfully');
      } else {
        setError('Failed to load data providers');
        toast.error('Failed to load data providers');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error loading data providers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">NDX Data Providers</h2>
      </div>
      <button
        onClick={fetchProviders}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>

    {error && (
      <div className="flex items-center gap-2 p-4 mb-4 bg-red-100 border border-red-300 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-red-700">{error}</span>
      </div>
    )}

    {loading ? (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading providers...</span>
      </div>
    ) : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <h3 className="font-medium text-gray-800">{provider.name}</h3>
                <p className="text-sm text-gray-500">ID: {provider.id}</p>
              </div>
            </div>
          </div>
        ))}
        {providers.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No data providers available
          </div>
        )}
      </div>
    )}
    </div>
  );
};

export default NDXDataProviders;
