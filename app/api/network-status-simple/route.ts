import { NextRequest, NextResponse } from 'next/server';
import { runSimpleNetworkDiagnostics, getSimpleStatusMessage } from '@/lib/simple-network-diagnostics';

/**
 * GET /api/network-status-simple
 * Returns simplified network diagnostics without making actual API calls
 */
export async function GET(req: NextRequest) {
  try {
    const diagnostics = await runSimpleNetworkDiagnostics();
    const statusMessage = getSimpleStatusMessage(diagnostics);
    
    return NextResponse.json({
      success: true,
      diagnostics,
      statusMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Simple network diagnostics failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run network diagnostics',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
