import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get a specific conversation
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

    const conversationData = conversation.data();
    
    // Check if user owns the conversation or if it's accessible (public or link-only)
    if (uid && conversationData?.uid !== uid && !conversationData?.isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // For anonymous users, only allow access to public or link-only conversations
    if (!uid && !conversationData?.isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      id: conversation.id,
      ...conversationData,
      createdAt: conversationData?.createdAt?.toDate?.() || new Date(),
      updatedAt: conversationData?.updatedAt?.toDate?.() || new Date()
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// Update a conversation (privacy settings, etc.)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { uid, isPublic, privacyLevel, title } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
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

    // Check if user owns the conversation
    if (conversation.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (typeof isPublic === 'boolean') {
      updateData.isPublic = isPublic;
    }

    if (privacyLevel) {
      updateData.privacyLevel = privacyLevel;
    }

    if (title) {
      updateData.title = title.trim();
    }

    await conversationRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

// Delete a conversation
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
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

    // Check if user owns the conversation
    if (conversation.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await conversationRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
