import { NextRequest, NextResponse } from 'next/server';

// Simple auth check - in a real app, you'd check JWT tokens or sessions
export async function GET(req: NextRequest) {
  try {
    // For now, we'll assume the user is always authenticated
    // In a real app, you'd check for valid JWT tokens or session cookies
    return NextResponse.json({ 
      authenticated: true,
      userId: 'anonymous-user' // In a real app, you'd get this from the token
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Failed to check authentication' 
    }, { status: 500 });
  }
}
