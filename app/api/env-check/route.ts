import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/env-check
 * Check if required environment variables are configured
 */
export async function GET(req: NextRequest) {
  const requiredVars = {
    HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN,
    HF_TOKEN: process.env.HF_TOKEN,
    HF_MODEL_ID: process.env.HF_MODEL_ID,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    SERPAPI_KEY: process.env.SERPAPI_KEY,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    SERPER_API_KEY: process.env.SERPER_API_KEY,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  const status = {
    configured: missingVars.length === 0,
    missing: missingVars,
    total: Object.keys(requiredVars).length,
    configuredCount: Object.keys(requiredVars).length - missingVars.length,
  };

  return NextResponse.json({
    success: true,
    status,
    message: missingVars.length === 0 
      ? 'All required environment variables are configured' 
      : `Missing ${missingVars.length} environment variables: ${missingVars.join(', ')}`,
  });
}
