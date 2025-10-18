import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Handle likes, dislikes, and other interactions for shared conversations
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, userId } = await req.json();

    if (!action || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
    const conversationData = conversation.data();
    if (!conversationData?.isPublic) {
      return NextResponse.json({ error: 'Conversation is not accessible' }, { status: 403 });
    }

    const currentLikes = conversationData?.likes || 0;
    const currentDislikes = conversationData?.dislikes || 0;

    let updateData: any = { updatedAt: new Date() };

    switch (action) {
      case 'like':
        updateData.likes = currentLikes + 1;
        break;
      case 'dislike':
        updateData.dislikes = currentDislikes + 1;
        break;
      case 'unlike':
        updateData.likes = Math.max(0, currentLikes - 1);
        break;
      case 'undislike':
        updateData.dislikes = Math.max(0, currentDislikes - 1);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await conversationRef.update(updateData);

    return NextResponse.json({ 
      success: true,
      likes: updateData.likes || currentLikes,
      dislikes: updateData.dislikes || currentDislikes
    });
  } catch (error) {
    console.error('Error updating conversation interaction:', error);
    return NextResponse.json({ error: 'Failed to update interaction' }, { status: 500 });
  }
}
