'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface NetworkDiagnostics {
  isOnline: boolean;
  apiStatus: {
    tavily: 'healthy' | 'degraded' | 'down' | 'unknown';
    serpapi: 'healthy' | 'degraded' | 'down' | 'unknown';
    newsapi: 'healthy' | 'degraded' | 'down' | 'unknown';
  };
  environmentVariables: {
    hfToken: boolean;
    tavily: boolean;
    serpapi: boolean;
    newsapi: boolean;
    serper: boolean;
  };
  lastChecked: string;
  errors: string[];
}

interface NetworkStatusProps {
  onStatusChange?: (isHealthy: boolean) => void;
}

export default function NetworkStatus({ onStatusChange }: NetworkStatusProps) {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNetworkStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/network-status');
      const data = await response.json();
      
      if (data.success) {
        setDiagnostics(data.diagnostics);
        onStatusChange?.(data.diagnostics.errors.length === 0 && data.diagnostics.isOnline);
      } else {
        setError(data.message || 'Failed to check network status');
      }
    } catch (err) {
      setError('Network error while checking status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkNetworkStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (!diagnostics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600">Checking network status...</span>
        </div>
      </div>
    );
  }

  const isHealthy = diagnostics.errors.length === 0 && diagnostics.isOnline;
  const hasIssues = diagnostics.errors.length > 0 || !diagnostics.isOnline;

  return (
    <div className={`border rounded-lg p-4 ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {diagnostics.isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <h3 className="font-medium text-sm">
            {isHealthy ? 'Network Status: Healthy' : 'Network Status: Issues Detected'}
          </h3>
        </div>
        <button
          onClick={checkNetworkStatus}
          disabled={loading}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {hasIssues && (
        <div className="space-y-2 mb-3">
          {!diagnostics.isOnline && (
            <div className="text-sm text-red-600">
              ⚠️ No internet connection detected
            </div>
          )}
          {diagnostics.errors.map((error, index) => (
            <div key={index} className="text-sm text-red-600">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <div className="font-medium text-gray-700">API Status</div>
          {Object.entries(diagnostics.apiStatus).map(([api, status]) => (
            <div key={api} className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span className="capitalize">{api}</span>
              <span className={`text-xs ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
        
        <div className="space-y-1">
          <div className="font-medium text-gray-700">Environment</div>
          {Object.entries(diagnostics.environmentVariables).map(([key, configured]) => (
            <div key={key} className="flex items-center gap-2">
              {configured ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-500" />
              )}
              <span className="capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Last checked: {new Date(diagnostics.lastChecked).toLocaleTimeString()}
      </div>
    </div>
  );
}
