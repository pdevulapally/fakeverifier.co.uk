import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if db is properly initialized
    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Fetch conversations from chatHistory collection using Admin SDK
    const conversationsRef = db.collection('chatHistory');
    const snapshot = await conversationsRef
      .where('uid', '==', uid)
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();

    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, title, firstMessage } = await req.json();
    
    if (!uid || !title) {
      return NextResponse.json({ error: 'User ID and title required' }, { status: 400 });
    }

    // Check if db is properly initialized
    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Create new conversation
    const conversationData = {
      uid,
      title,
      messages: firstMessage ? [firstMessage] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const conversationsRef = db.collection('chatHistory');
    const docRef = await conversationsRef.add(conversationData);
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...conversationData 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('id');
    const uid = searchParams.get('uid');
    
    if (!conversationId || !uid) {
      return NextResponse.json({ error: 'Conversation ID and User ID required' }, { status: 400 });
    }

    // Check if db is properly initialized
    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Verify ownership before deleting using Admin SDK
    const conversationRef = db.collection('chatHistory').doc(conversationId);
    const conversation = await conversationRef.get();
    
    if (!conversation.exists || conversation.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    await conversationRef.delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, uid, title } = body || {};

    if (!id || !uid || !title) {
      return NextResponse.json({ error: 'Conversation ID, User ID and title required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const conversationRef = db.collection('chatHistory').doc(id);
    const conversation = await conversationRef.get();

    if (!conversation.exists || conversation.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    await conversationRef.update({ title, updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating conversation title:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}