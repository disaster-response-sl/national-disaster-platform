import React, { useState } from 'react';
import { ndxService } from '../services/ndxService';
import { Shield, Send, Clock, Target, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConsentRequestData {
  dataProvider: string;
  dataType: string;
  purpose: string;
  consentDuration: number;
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
    purpose: 'emergency-response',
    consentDuration: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  });

  // Predefined templates for common consent requests
  const consentTemplates = [
    {
      name: 'Emergency Response',
      purpose: 'emergency-response',
      duration: 24 * 60 * 60 * 1000,
      description: 'Access disaster data for emergency response coordination'
    },
    {
      name: 'Weather Monitoring',
      purpose: 'weather-monitoring',
      duration: 12 * 60 * 60 * 1000,
      description: 'Monitor weather alerts and conditions'
    },
    {
      name: 'Resource Planning',
      purpose: 'resource-planning',
      duration: 7 * 24 * 60 * 60 * 1000,
      description: 'Access resource availability data for planning'
    },
    {
      name: 'Research & Analysis',
      purpose: 'research-analysis',
      duration: 30 * 24 * 60 * 60 * 1000,
      description: 'Access data for research and analysis purposes'
    }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    if (formData.consentDuration < 3600000) {
      newErrors.duration = 'Duration must be at least 1 hour';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyTemplate = (template: typeof consentTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      purpose: template.purpose,
      consentDuration: template.duration
    }));
    toast.success(`Applied "${template.name}" template`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    
    try {
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
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error creating consent request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ConsentRequestData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isSubmitDisabled = externalLoading || loading;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Request Data Exchange Consent</h2>
      </div>

      {/* Quick Templates */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Quick Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {consentTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => applyTemplate(template)}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="font-medium text-gray-900 text-sm">{template.name}</div>
              <div className="text-xs text-gray-600 mt-1">{template.description}</div>
              <div className="text-xs text-blue-600 mt-1">
                Duration: {template.duration / (24 * 60 * 60 * 1000)} days
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Provider & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Provider
            </label>
            <select
              value={formData.dataProvider}
              onChange={(e) => handleInputChange('dataProvider', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="disaster-management">🏥 Disaster Management Center</option>
              <option value="weather-service">🌤️ Weather Service</option>
              <option value="health-ministry">⚕️ Health Ministry</option>
              <option value="transport-ministry">🚗 Transport Ministry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              value={formData.dataType}
              onChange={(e) => handleInputChange('dataType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="disasters">🚨 Disasters & Incidents</option>
              <option value="weather-alerts">🌧️ Weather Alerts</option>
              <option value="resources">📦 Resources & Supplies</option>
              <option value="health-status">🏥 Health Status</option>
              <option value="road-conditions">🛣️ Road Conditions</option>
            </select>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose *
          </label>
          <input
            type="text"
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            placeholder="e.g., emergency-response, research-analysis, resource-planning"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.purpose ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.purpose && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.purpose}
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consent Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 12, 24].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => handleInputChange('consentDuration', hours * 60 * 60 * 1000)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  formData.consentDuration === hours * 60 * 60 * 1000
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {hours} hour{hours > 1 ? 's' : ''}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handleInputChange('consentDuration', days * 24 * 60 * 60 * 1000)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  formData.consentDuration === days * 24 * 60 * 60 * 1000
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {days} day{days > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            <Send className="w-5 h-5" />
            {isSubmitDisabled ? 'Creating Consent Request...' : 'Request Consent'}
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
