import React from 'react';
import { Wifi, WifiOff, Loader, Clock, CheckCircle, XCircle } from 'lucide-react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

interface RealTimeStatusProps {
  status: ConnectionStatus;
  lastUpdate?: Date;
  updateCount?: number;
  className?: string;
}

const RealTimeStatus = ({
  status,
  lastUpdate,
  updateCount = 0,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Live',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          pulse: true,
        };
      case 'connecting':
        return {
          icon: <Loader className="w-4 h-4 animate-spin" />,
          text: 'Connecting',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          pulse: false,
        };
      case 'reconnecting':
        return {
          icon: <Loader className="w-4 h-4 animate-spin" />,
          text: 'Reconnecting',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          pulse: false,
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          pulse: false,
        };
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          pulse: false,
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          pulse: false,
        };
    }
  };

  const formatLastUpdate = (date?: Date) => {
    if (!date) return null;
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status Indicator */}
      <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full ${config.bgColor}`}>
        <div className={`${config.iconColor} ${config.pulse ? 'animate-pulse' : ''}`}>
          {config.icon}
        </div>
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>

      {/* Update Information */}
      {status === 'connected' && (lastUpdate || updateCount > 0) && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          {updateCount > 0 && (
            <span className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>{updateCount}</span>
            </span>
          )}
          {lastUpdate && (
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatLastUpdate(lastUpdate)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeStatus;
