import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Continue a shared conversation in user's own chat history
export async function POST(req: NextRequest) {
  try {
    const { sourceConversationId, title } = await req.json();

    if (!sourceConversationId) {
      return NextResponse.json({ error: 'Source conversation ID required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Get the source conversation
    const sourceRef = db.collection('chatHistory').doc(sourceConversationId);
    const sourceConversation = await sourceRef.get();

    if (!sourceConversation.exists) {
      return NextResponse.json({ error: 'Source conversation not found' }, { status: 404 });
    }

    const sourceData = sourceConversation.data();
    
    // Check if the source conversation is accessible (public or link-only)
    if (!sourceData?.isPublic) {
      return NextResponse.json({ error: 'Source conversation is not accessible' }, { status: 403 });
    }

    // For now, we'll create a new conversation without user authentication
    // In a real app, you'd get the user ID from the session
    const newConversationData = {
      title: title || 'Continued Conversation',
      messages: sourceData.messages || [],
      isPublic: false,
      privacyLevel: 'private',
      views: 0,
      likes: 0,
      dislikes: 0,
      accessLogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      sourceConversationId: sourceConversationId,
      isContinued: true
    };

    const newConversationRef = await db.collection('chatHistory').add(newConversationData);

    return NextResponse.json({ 
      id: newConversationRef.id,
      ...newConversationData
    });
  } catch (error) {
    console.error('Error continuing conversation:', error);
    return NextResponse.json({ error: 'Failed to continue conversation' }, { status: 500 });
  }
}
