import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Delete a specific access log entry
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string; logId: string }> }
) {
  try {
    const { id: conversationId, logId } = await params;
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Verify ownership using Admin SDK
    const conversationRef = db.collection('chatHistory').doc(conversationId);
    const conversation = await conversationRef.get();

    if (!conversation.exists || conversation.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Get current access logs
    const currentData = conversation.data();
    const currentLogs = currentData?.accessLogs || [];

    // Remove the specific log entry
    const updatedLogs = currentLogs.filter((log: any) => log.id !== logId);

    // Update the conversation with the new access logs
    await conversationRef.update({
      accessLogs: updatedLogs,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing access log:', error);
    return NextResponse.json({ error: 'Failed to remove access log' }, { status: 500 });
  }
}
