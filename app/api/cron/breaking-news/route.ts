import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called by external cron services like:
// - Vercel Cron Jobs
// - GitHub Actions
// - External cron services (cron-job.org, etc.)

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Cron job triggered: Breaking news check');
    
    // Call our breaking news check API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/check-breaking-news`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Breaking news check failed: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('Breaking news check completed:', result);

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
      breakingNewsCheck: result
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { testMode = false } = body;

    console.log('Manual cron job triggered:', { testMode });
    
    // Call our breaking news check API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/check-breaking-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testMode })
    });

    if (!response.ok) {
      throw new Error(`Breaking news check failed: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('Breaking news check completed:', result);

    return NextResponse.json({
      success: true,
      message: 'Manual cron job executed successfully',
      timestamp: new Date().toISOString(),
      breakingNewsCheck: result
    });

  } catch (error: any) {
    console.error('Manual cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Manual cron job failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
