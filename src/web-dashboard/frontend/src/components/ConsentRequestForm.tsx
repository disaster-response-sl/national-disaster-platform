import React, { useState } from 'react';
import { ndxService } from '../services/ndxService';
import { Shield, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConsentRequestData {
  dataProvider: string;
  dataType: string;
  purpose: string;
  consentDuration: number;
  location: { lat: number; lng: number };
}

interface ConsentResponse {
  success: boolean;
  consentId: string;
  status: string;
  message: string;
}

interface ConsentRequestFormProps {
  onSubmit?: (data: ConsentRequestData) => Promise<{ success: boolean; consentId?: string; error?: string }>;
  loading?: boolean;
}

const ConsentRequestForm: React.FC<ConsentRequestFormProps> = ({ onSubmit, loading: externalLoading }) => {
  const [loading, setLoading] = useState(false);
  const [consentResponse, setConsentResponse] = useState<ConsentResponse | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<ConsentRequestData>({
    dataProvider: 'disaster-management',
    dataType: 'disasters',
    purpose: 'exchange-test',
    consentDuration: 86400000, // 24 hours in milliseconds
    location: { lat: 6.9271, lng: 79.8612 } // Colombo default
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate purpose
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    // Validate duration (minimum 1 hour)
    if (formData.consentDuration < 3600000) {
      newErrors.duration = 'Duration must be at least 1 hour';
    }

    // Validate location
    if (isNaN(formData.location.lat) || formData.location.lat < -90 || formData.location.lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (isNaN(formData.location.lng) || formData.location.lng < -180 || formData.location.lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    
    try {
      // Use external callback if provided, otherwise use internal service
      if (onSubmit) {
        const response = await onSubmit(formData);
        if (response.success) {
          setConsentResponse({
            success: true,
            consentId: response.consentId || 'N/A',
            status: 'PENDING_APPROVAL',
            message: 'Consent request created successfully'
          });
          toast.success('Consent request created successfully');
        } else {
          toast.error(response.error || 'Failed to create consent request');
        }
      } else {
        const response = await ndxService.requestConsent(formData);
        if (response.success) {
          setConsentResponse(response);
          toast.success('Consent request created successfully');
        } else {
          toast.error('Failed to create consent request');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error creating consent request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ConsentRequestData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: 'lat' | 'lng', value: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const isSubmitDisabled = externalLoading || loading;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-800">Request Data Exchange Consent</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Provider
            </label>
            <select
              value={formData.dataProvider}
              onChange={(e) => handleInputChange('dataProvider', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="disaster-management">Disaster Management Center</option>
              <option value="weather-service">Weather Service</option>
              <option value="health-ministry">Health Ministry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Type
            </label>
            <select
              value={formData.dataType}
              onChange={(e) => handleInputChange('dataType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="disasters">Disasters</option>
              <option value="weather">Weather Data</option>
              <option value="health">Health Records</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose *
          </label>
          <input
            type="text"
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            placeholder="Enter the purpose for data exchange"
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.purpose ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.purpose && (
            <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consent Duration (hours) *
          </label>
          <input
            type="number"
            min="1"
            value={formData.consentDuration / 3600000}
            onChange={(e) => handleInputChange('consentDuration', parseInt(e.target.value) * 3600000)}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.duration ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.location.lat}
              onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.latitude ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.latitude && (
              <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.location.lng}
              onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value))}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.longitude ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.longitude && (
              <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="w-4 h-4" />
            {isSubmitDisabled ? 'Requesting...' : 'Request Consent'}
          </button>
        </div>
      </form>

      {/* Status Display */}
      {consentResponse && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-900">Consent Request Status</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Consent ID:</span>
              <span className="font-mono text-gray-900">{consentResponse.consentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                {consentResponse.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Message:</span>
              <span className="text-gray-900">{consentResponse.message}</span>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-yellow-700">
            Your consent request is pending approval. You will be notified once it's processed.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentRequestForm;
