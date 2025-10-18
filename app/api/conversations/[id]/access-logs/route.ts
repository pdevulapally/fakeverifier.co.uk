import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get access logs for a conversation
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const conversationRef = db.collection('chatHistory').doc(id);
    const conversation = await conversationRef.get();

    if (!conversation.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if user owns the conversation (only owners can see access logs)
    if (!uid || conversation.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Access denied - Only conversation owners can view access logs' }, { status: 403 });
    }

    // Get access logs from the conversation document
    const conversationData = conversation.data();
    const accessLogs = conversationData?.accessLogs || [];

    // Sort by most recent first
    const sortedLogs = accessLogs.sort((a: any, b: any) => 
      new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
    );

    return NextResponse.json({ accessLogs: sortedLogs });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return NextResponse.json({ error: 'Failed to fetch access logs' }, { status: 500 });
  }
}

// Log access to a conversation
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { ipAddress, userAgent, location } = await req.json();

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const conversationRef = db.collection('chatHistory').doc(id);
    const conversation = await conversationRef.get();

    if (!conversation.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if conversation is accessible (public or link-only)
    if (!conversation.data()?.isPublic) {
      return NextResponse.json({ error: 'Conversation is not accessible' }, { status: 403 });
    }

    // Add access log
    const accessLog = {
      ipAddress: ipAddress || 'Unknown',
      userAgent: userAgent || 'Unknown',
      location: location || 'Unknown',
      accessedAt: new Date()
    };

    const currentLogs = conversation.data()?.accessLogs || [];
    const updatedLogs = [accessLog, ...currentLogs].slice(0, 50); // Keep only last 50 logs

    await conversationRef.update({
      accessLogs: updatedLogs,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging access:', error);
    return NextResponse.json({ error: 'Failed to log access' }, { status: 500 });
  }
}
