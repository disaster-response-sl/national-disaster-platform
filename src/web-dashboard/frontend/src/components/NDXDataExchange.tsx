import React, { useState } from 'react';
import { ndxService } from '../services/ndxService';
import { Database, Download, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExchangeRequest {
  consentId: string;
  dataProvider: string;
  dataType: string;
  purpose: string;
  location: { lat: number; lng: number };
}

interface DisasterData {
  _id: string;
  type: string;
  severity: string;
  description: string;
  location?: { lat: number; lng: number };
  timestamp: string;
}

interface ExchangeResult {
  success: boolean;
  data: DisasterData[];
  consentId: string;
  message: string;
}

const NDXDataExchange: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exchangeData, setExchangeData] = useState<DisasterData[]>([]);
  const [lastExchange, setLastExchange] = useState<string | null>(null);
  const [exchangeRequest, setExchangeRequest] = useState<ExchangeRequest>({
    consentId: '',
    dataProvider: 'disaster-management',
    dataType: 'disasters',
    purpose: 'exchange-test',
    location: { lat: 6.9271, lng: 79.8612 }
  });

  const handleDataExchange = async () => {
    if (!exchangeRequest.consentId.trim()) {
      toast.error('Please enter a valid Consent ID');
      return;
    }

    setLoading(true);
    try {
      const response: ExchangeResult = await ndxService.exchangeData(exchangeRequest);
      if (response.success) {
        setExchangeData(response.data);
        setLastExchange(new Date().toLocaleString());
        toast.success(`Data exchange successful! Retrieved ${response.data.length} records`);
      } else {
        toast.error('Data exchange failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error during data exchange';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDisasterInfo = async () => {
    setLoading(true);
    try {
      const response: ExchangeResult = await ndxService.getDisasterInfo(exchangeRequest.location);
      if (response.success) {
        setExchangeData(response.data);
        setLastExchange(new Date().toLocaleString());
        toast.success(`Quick disaster info retrieved! ${response.data.length} records found`);
        // Update the consent ID from the response for future use
        setExchangeRequest(prev => ({ ...prev, consentId: response.consentId }));
      } else {
        toast.error('Failed to get disaster information');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error getting disaster info';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickWeatherAlerts = async () => {
    setLoading(true);
    try {
      const response: ExchangeResult = await ndxService.getWeatherAlerts('Colombo');
      if (response.success) {
        setExchangeData(response.data);
        setLastExchange(new Date().toLocaleString());
        toast.success(`Weather alerts retrieved! ${response.data.length} records found`);
        // Update the consent ID from the response for future use
        setExchangeRequest(prev => ({ ...prev, consentId: response.consentId }));
      } else {
        toast.error('Failed to get weather alerts');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error getting weather alerts';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flood': return '🌊';
      case 'earthquake': return '🏔️';
      case 'fire': return '🔥';
      case 'storm': return '⛈️';
      case 'drought': return '🏜️';
      default: return '⚠️';
    }
  };

  return (
    <div className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <Database className="w-6 h-6 text-indigo-600" />
      <h2 className="text-xl font-semibold text-gray-800">NDX Data Exchange</h2>
    </div>

      {/* Exchange Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Data Exchange Request</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Consent ID</label>
            <input 
              type="text" 
              value={exchangeRequest.consentId}
              onChange={(e) => setExchangeRequest(prev => ({ ...prev, consentId: e.target.value }))}
              placeholder="Enter approved consent ID"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Provider</label>
            <select 
              value={exchangeRequest.dataProvider}
              onChange={(e) => setExchangeRequest(prev => ({ ...prev, dataProvider: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="disaster-management">Disaster Management Center</option>
              <option value="weather-service">Weather Service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
            <select 
              value={exchangeRequest.dataType}
              onChange={(e) => setExchangeRequest(prev => ({ ...prev, dataType: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="disasters">Disasters</option>
              <option value="weather">Weather</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input 
              type="number" 
              step="any"
              value={exchangeRequest.location.lat}
              onChange={(e) => setExchangeRequest(prev => ({ 
                ...prev, 
                location: { ...prev.location, lat: parseFloat(e.target.value) }
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input 
              type="number" 
              step="any"
              value={exchangeRequest.location.lng}
              onChange={(e) => setExchangeRequest(prev => ({ 
                ...prev, 
                location: { ...prev.location, lng: parseFloat(e.target.value) }
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDataExchange}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Exchanging...' : 'Exchange Data'}
          </button>
          
          <button
            onClick={handleQuickDisasterInfo}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Quick Disaster Info
          </button>
          
          <button
            onClick={handleQuickWeatherAlerts}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Quick Weather Alerts
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Exchange Results</h3>
          {lastExchange && (
            <span className="text-sm text-gray-500">Last updated: {lastExchange}</span>
          )}
        </div>
        
        {exchangeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data exchanged yet. Use the form above to request data.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Found {exchangeData.length} record(s)
            </div>
            
            {exchangeData.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <div>
                      <h4 className="font-medium text-gray-800 capitalize">{item.type}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{item.description}</p>
                
                {item.location && item.location.lat !== undefined && item.location.lng !== undefined ? (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Lat: {item.location.lat.toFixed(4)}, Lng: {item.location.lng.toFixed(4)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>Location not available</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NDXDataExchange;
