'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Clock,
  Server,
  Key,
  Activity
} from 'lucide-react';
import NetworkStatus from '@/components/NetworkStatus';

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

interface EnvCheck {
  configured: boolean;
  missing: string[];
  total: number;
  configuredCount: number;
}

export default function StatusPage() {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics | null>(null);
  const [envCheck, setEnvCheck] = useState<EnvCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [useDetailedCheck, setUseDetailedCheck] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use simplified diagnostics by default to avoid false "degraded" status
      const endpoint = useDetailedCheck ? '/api/network-status' : '/api/network-status-simple';
      const [networkResponse, envResponse] = await Promise.all([
        fetch(endpoint),
        fetch('/api/env-check')
      ]);

      const networkData = await networkResponse.json();
      const envData = await envResponse.json();

      if (networkData.success) {
        setDiagnostics(networkData.diagnostics);
      }

      if (envData.success) {
        setEnvCheck(envData.status);
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to check system status');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getOverallStatus = () => {
    if (!diagnostics || !envCheck) return 'unknown';
    
    const hasNetworkIssues = !diagnostics.isOnline || diagnostics.errors.length > 0;
    const hasConfigIssues = !envCheck.configured;
    
    if (hasNetworkIssues || hasConfigIssues) return 'issues';
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <p className="text-gray-600 mt-2">
                Monitor the health and performance of FakeVerifier services
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useDetailedCheck}
                  onChange={(e) => setUseDetailedCheck(e.target.checked)}
                  className="rounded"
                />
                Detailed API checks
              </label>
              <button
                onClick={checkStatus}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Checking...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleString()}
          </div>
        </div>

        {/* Overall Status */}
        <div className={`rounded-lg p-6 mb-8 ${
          overallStatus === 'healthy' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {overallStatus === 'healthy' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {overallStatus === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
              </h2>
              <p className="text-sm text-gray-600">
                {overallStatus === 'healthy' 
                  ? 'All services are running normally' 
                  : 'Some services may be experiencing issues'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {diagnostics?.errors && diagnostics.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-800 mb-2">Issues Detected:</h3>
            <ul className="space-y-1">
              {diagnostics.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Network Status */}
        {diagnostics && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Network Status</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">API Services</h4>
                <div className="space-y-2">
                  {Object.entries(diagnostics.apiStatus).map(([api, status]) => (
                    <div key={api} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{api}</span>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="capitalize">{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Environment Variables</h4>
                <div className="space-y-2">
                  {Object.entries(diagnostics.environmentVariables).map(([key, configured]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{key}</span>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                        configured ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                      }`}>
                        {configured ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{configured ? 'Configured' : 'Missing'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Check */}
        {envCheck && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Configuration Status</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{envCheck.configuredCount}</div>
                <div className="text-sm text-gray-600">Configured</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{envCheck.missing.length}</div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{envCheck.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {envCheck.missing.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Missing Environment Variables:</h4>
                <div className="text-sm text-yellow-700">
                  {envCheck.missing.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Service Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Service Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">API Endpoints</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Tavily: api.tavily.com</div>
                <div>• SerpAPI: serpapi.com</div>
                <div>• NewsAPI: newsapi.org</div>
                <div>• Serper: google.serper.dev</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Status Pages</h4>
              <div className="space-y-1 text-sm">
                <a href="https://tavily.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  • Tavily Status
                </a>
                <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  • SerpAPI Status
                </a>
                <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  • NewsAPI Status
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>System status is automatically updated every 30 seconds</p>
          <p className="mt-1">
            For technical support, check the{' '}
            <a href="/api/troubleshooting" target="_blank" className="text-blue-600 hover:underline">
              troubleshooting guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
