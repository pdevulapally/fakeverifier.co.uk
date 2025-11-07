'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Activity,
  Shield
} from 'lucide-react';

interface AppStatus {
  isOnline: boolean;
  isConfigured: boolean;
  lastChecked: string;
  errors: string[];
}

export default function StatusPage() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [networkResponse, envResponse] = await Promise.all([
        fetch('/api/network-status-simple'),
        fetch('/api/env-check')
      ]);

      const networkData = await networkResponse.json();
      const envData = await envResponse.json();

      if (networkData.success && envData.success) {
        const diagnostics = networkData.diagnostics;
        const envCheck = envData.status;
        
        setStatus({
          isOnline: diagnostics.isOnline,
          isConfigured: envCheck.configured,
          lastChecked: diagnostics.lastChecked,
          errors: diagnostics.errors || []
        });
      } else {
        setError('Failed to retrieve status information');
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to check application status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = () => {
    if (!status) return 'unknown';
    
    if (!status.isOnline || !status.isConfigured || status.errors.length > 0) {
      return 'issues';
    }
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Application Status</h1>
          </div>
          <p className="text-lg text-gray-600">
            Real-time status of FakeVerifier services
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={checkStatus}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        {/* Overall Status Card */}
        <div className={`rounded-xl p-8 mb-8 shadow-lg transition-all ${
          overallStatus === 'healthy' 
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300' 
            : overallStatus === 'issues'
            ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300'
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300'
        }`}>
          <div className="flex items-center gap-4">
            {overallStatus === 'healthy' ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : overallStatus === 'issues' ? (
              <XCircle className="w-12 h-12 text-red-600" />
            ) : (
              <Activity className="w-12 h-12 text-gray-400 animate-pulse" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {overallStatus === 'healthy' 
                  ? 'All Systems Operational' 
                  : overallStatus === 'issues'
                  ? 'Service Issues Detected'
                  : 'Checking Status...'
                }
              </h2>
              <p className="text-gray-700">
                {overallStatus === 'healthy' 
                  ? 'FakeVerifier is running normally and ready to process requests' 
                  : overallStatus === 'issues'
                  ? 'Some services may be experiencing issues. Please check the details below.'
                  : 'Please wait while we check the system status...'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Status Details Grid */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Connectivity Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {status.isOnline ? (
                  <Wifi className="w-6 h-6 text-green-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">Connectivity</h3>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                status.isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {status.isOnline ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Online
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Offline
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {status.isOnline 
                  ? 'Internet connection is active' 
                  : 'No internet connection detected'
                }
              </p>
            </div>

            {/* Configuration Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className={`w-6 h-6 ${status.isConfigured ? 'text-green-600' : 'text-red-600'}`} />
                <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                status.isConfigured 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {status.isConfigured ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Configured
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Incomplete
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {status.isConfigured 
                  ? 'All required settings are properly configured' 
                  : 'Some configuration settings are missing'
                }
              </p>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {status && status.errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Issues Detected</h3>
            </div>
            <ul className="space-y-2">
              {status.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 bg-white rounded-lg p-4 border border-gray-200">
          <p className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            Last updated: {lastRefresh.toLocaleString()}
          </p>
          <p className="mt-1 text-xs">
            Status is automatically refreshed every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
