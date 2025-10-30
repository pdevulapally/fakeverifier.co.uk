import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * GET /api/troubleshooting
 * Returns the troubleshooting guide content
 */
export async function GET(req: NextRequest) {
  try {
    const filePath = join(process.cwd(), 'NETWORK_TROUBLESHOOTING.md');
    const content = readFileSync(filePath, 'utf8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('Failed to read troubleshooting guide:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load troubleshooting guide',
      message: error.message,
    }, { status: 500 });
  }
}
