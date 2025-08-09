import React, { useEffect, useState } from 'react';
import api from '../services/api';

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Testing backend connection...');
        const response = await api.get('/health');
        console.log('Backend response:', response.data);
        setStatus('connected');
      } catch (err: any) {
        console.error('Backend connection failed:', err);
        setError(err.response?.data?.message || err.message || 'Connection failed');
        setStatus('disconnected');
      }
    };

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
        Checking backend connection...
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded max-w-sm">
        <div className="font-semibold">Backend Connection Failed</div>
        <div className="text-sm">{error}</div>
        <div className="text-xs mt-1">
          Make sure backend is running on http://localhost:3001
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
      Backend Connected ✓
    </div>
  );
};

export default HealthCheck;
