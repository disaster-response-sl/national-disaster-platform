import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!individualId || !otp) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(individualId, otp);
      
      if (success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Disaster Response Platform
          </h1>
          <p className="text-gray-600">
            Emergency Management Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Secure Access
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Individual ID Field */}
            <div>
              <label htmlFor="individualId" className="block text-sm font-medium text-gray-700 mb-2">
                Individual ID
              </label>
              <input
                id="individualId"
                type="text"
                value={individualId}
                onChange={(e) => setIndividualId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your Individual ID (e.g., admin001)"
                disabled={isLoading}
              />
            </div>

            {/* OTP Field */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password (OTP)
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type={showOtp ? 'text' : 'password'}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter OTP (use: 123456)"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showOtp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials (Click to use):</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIndividualId('responder001');
                  setOtp('123456');
                }}
                className="w-full text-left p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                disabled={isLoading}
              >
                <div className="font-medium text-blue-800">👨‍🚒 Responder Account</div>
                <div className="text-blue-600">responder001 / OTP: 123456</div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIndividualId('admin001');
                  setOtp('123456');
                }}
                className="w-full text-left p-2 text-xs bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                disabled={isLoading}
              >
                <div className="font-medium text-red-800">👑 Admin Account</div>
                <div className="text-red-600">admin001 / OTP: 123456</div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIndividualId('citizen001');
                  setOtp('123456');
                }}
                className="w-full text-left p-2 text-xs bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors"
                disabled={isLoading}
              >
                <div className="font-medium text-green-800">👤 Citizen Account</div>
                <div className="text-green-600">citizen001 / OTP: 123456</div>
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Click any credential above to auto-fill the form
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Emergency Response System © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
