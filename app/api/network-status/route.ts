import { NextRequest, NextResponse } from 'next/server';
import { runNetworkDiagnostics, getStatusMessage } from '@/lib/network-diagnostics';

/**
 * GET /api/network-status
 * Returns comprehensive network diagnostics and health status
 */
export async function GET(req: NextRequest) {
  try {
    const diagnostics = await runNetworkDiagnostics();
    const statusMessage = getStatusMessage(diagnostics);
    
    return NextResponse.json({
      success: true,
      diagnostics,
      statusMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Network diagnostics failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run network diagnostics',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
