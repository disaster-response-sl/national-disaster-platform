import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <div className="fixed bottom-4 left-4 bg-gray-100 border border-gray-300 p-4 rounded text-xs max-w-sm">
      <div className="font-semibold mb-2">Auth Debug Info:</div>
      <div>isLoading: {isLoading ? 'true' : 'false'}</div>
      <div>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>user: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
      <div className="mt-2">
        <div>localStorage token: {localStorage.getItem('token') ? 'exists' : 'none'}</div>
        <div>localStorage user: {localStorage.getItem('user') ? 'exists' : 'none'}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
