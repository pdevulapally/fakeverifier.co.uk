/**
 * Network diagnostics and health checking utilities
 */

export interface NetworkDiagnostics {
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
 * Check API endpoint health
 */
export async function checkApiHealth(url: string, headers?: Record<string, string>): Promise<'healthy' | 'degraded' | 'down'> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    // Use GET instead of HEAD for better compatibility
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'FakeVerifier-HealthCheck/1.0',
        ...headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      return 'healthy';
    } else if (response.status >= 500) {
      return 'down';
    } else if (response.status === 401 || response.status === 403) {
      // Authentication errors mean the service is up but we need proper credentials
      return 'healthy';
    } else {
      return 'degraded';
    }
  } catch (error: any) {
    // If it's a network error, consider it down
    if (error.name === 'AbortError' || error.message?.includes('fetch')) {
      return 'down';
    }
    return 'degraded';
  }
}

/**
 * Check if environment variables are properly configured
 */
export function checkEnvironmentVariables(): NetworkDiagnostics['environmentVariables'] {
  return {
    hfToken: !!(process.env.HUGGINGFACE_TOKEN || process.env.HF_TOKEN),
    tavily: !!process.env.TAVILY_API_KEY,
    serpapi: !!process.env.SERPAPI_KEY,
    newsapi: !!process.env.NEWS_API_KEY,
    serper: !!process.env.SERPER_API_KEY,
  };
}

/**
 * Run comprehensive network diagnostics
 */
export async function runNetworkDiagnostics(): Promise<NetworkDiagnostics> {
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
  
  // Check API endpoints (only if we have the required keys)
  const apiStatus: NetworkDiagnostics['apiStatus'] = {
    tavily: 'unknown',
    serpapi: 'unknown',
    newsapi: 'unknown',
  };
  
  // No OpenAI/Anthropic checks
  
  if (envVars.tavily) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'HEAD',
        headers: { 
          'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      apiStatus.tavily = response.status === 200 ? 'healthy' : 
                        response.status === 401 ? 'healthy' : 
                        response.status >= 500 ? 'down' : 'degraded';
    } catch (error) {
      apiStatus.tavily = 'down';
      errors.push('Tavily API is not reachable');
    }
  }
  
  if (envVars.serpapi) {
    try {
      const serpUrl = `https://serpapi.com/search?api_key=${process.env.SERPAPI_KEY}&q=test&num=1`;
      const response = await fetch(serpUrl, { method: 'HEAD' });
      apiStatus.serpapi = response.status === 200 ? 'healthy' : 
                         response.status === 401 ? 'healthy' : 
                         response.status >= 500 ? 'down' : 'degraded';
    } catch (error) {
      apiStatus.serpapi = 'down';
      errors.push('SerpAPI is not reachable');
    }
  }
  
  if (envVars.newsapi) {
    try {
      const newsUrl = 'https://newsapi.org/v2/everything?q=test&pageSize=1';
      const response = await fetch(newsUrl, { 
        method: 'HEAD',
        headers: { 'X-Api-Key': process.env.NEWS_API_KEY || '' },
      });
      apiStatus.newsapi = response.status === 200 ? 'healthy' : 
                         response.status === 401 ? 'healthy' : 
                         response.status >= 500 ? 'down' : 'degraded';
    } catch (error) {
      apiStatus.newsapi = 'down';
      errors.push('NewsAPI is not reachable');
    }
  }
  
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
export function getStatusMessage(diagnostics: NetworkDiagnostics): string {
  if (!diagnostics.isOnline) {
    return 'No internet connection. Please check your network settings.';
  }
  
  if (diagnostics.errors.length > 0) {
    return `Configuration issues detected: ${diagnostics.errors.join(', ')}`;
  }
  
  const healthyApis = Object.values(diagnostics.apiStatus).filter(status => status === 'healthy').length;
  const totalApis = Object.values(diagnostics.apiStatus).filter(status => status !== 'unknown').length;
  
  if (totalApis === 0) {
    return 'No API keys configured. Please check your environment variables.';
  }
  
  if (healthyApis === totalApis) {
    return 'All systems operational.';
  }
  
  return `Some services may be experiencing issues. ${healthyApis}/${totalApis} APIs are healthy.`;
}
