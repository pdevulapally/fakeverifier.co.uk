/**
 * Simplified network diagnostics that doesn't make actual API calls
 * This version assumes services are healthy if environment variables are configured
 */

export interface SimpleNetworkDiagnostics {
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

/**
 * Check if the application is online
 */
export async function checkOnlineStatus(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache',
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if environment variables are properly configured
 */
export function checkEnvironmentVariables(): SimpleNetworkDiagnostics['environmentVariables'] {
  return {
    hfToken: !!(process.env.HUGGINGFACE_TOKEN || process.env.HF_TOKEN),
    tavily: !!process.env.TAVILY_API_KEY,
    serpapi: !!process.env.SERPAPI_KEY,
    newsapi: !!process.env.NEWS_API_KEY,
    serper: !!process.env.SERPER_API_KEY,
  };
}

/**
 * Run simplified network diagnostics
 */
export async function runSimpleNetworkDiagnostics(): Promise<SimpleNetworkDiagnostics> {
  const errors: string[] = [];
  
  // Check online status
  const isOnline = await checkOnlineStatus();
  if (!isOnline) {
    errors.push('No internet connection detected');
  }
  
  // Check environment variables
  const envVars = checkEnvironmentVariables();
  const missingVars = Object.entries(envVars)
    .filter(([_, exists]) => !exists)
    .map(([key, _]) => key);
  
  if (missingVars.length > 0) {
    errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  // Assume services are healthy if environment variables are configured
  const apiStatus: SimpleNetworkDiagnostics['apiStatus'] = {
    tavily: envVars.tavily ? 'healthy' : 'unknown',
    serpapi: envVars.serpapi ? 'healthy' : 'unknown',
    newsapi: envVars.newsapi ? 'healthy' : 'unknown',
  };
  
  return {
    isOnline,
    apiStatus,
    environmentVariables: envVars,
    lastChecked: new Date().toISOString(),
    errors,
  };
}

/**
 * Get a user-friendly status message
 */
export function getSimpleStatusMessage(diagnostics: SimpleNetworkDiagnostics): string {
  if (!diagnostics.isOnline) {
    return 'No internet connection. Please check your network settings.';
  }
  
  if (diagnostics.errors.length > 0) {
    return `Configuration issues detected: ${diagnostics.errors.join(', ')}`;
  }
  
  const configuredApis = Object.values(diagnostics.environmentVariables).filter(Boolean).length;
  const totalApis = Object.values(diagnostics.environmentVariables).length;
  
  if (configuredApis === 0) {
    return 'No API keys configured. Please check your environment variables.';
  }
  
  if (configuredApis === totalApis) {
    return 'All systems operational.';
  }
  
  return `Some API keys are missing. ${configuredApis}/${totalApis} APIs are configured.`;
}
