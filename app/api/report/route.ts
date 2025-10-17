import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { uid, conversationId, reason, note } = await req.json();
    
    if (!uid || !conversationId) {
      return NextResponse.json({ error: 'User ID and conversation ID are required' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Report reason is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Create a report document
    const reportRef = db.collection('reports').doc();
    await reportRef.set({
      uid: uid,
      conversationId: conversationId,
      reason: reason,
      note: note || '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Conversation reported successfully',
      reportId: reportRef.id
    });

  } catch (error) {
    console.error('Error reporting conversation:', error);
    return NextResponse.json({ error: 'Failed to report conversation' }, { status: 500 });
  }
}
