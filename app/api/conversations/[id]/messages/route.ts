import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const conversationId = id;
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

    // Fetch conversation and verify ownership using Admin SDK
    const conversationRef = db.collection('chatHistory').doc(conversationId);
    const conversation = await conversationRef.get();
    
    if (!conversation.exists || conversation.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    const messages = conversation.data()?.messages || [];
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const conversationId = id;
    const { uid, message } = await req.json();
    
    if (!uid || !message) {
      return NextResponse.json({ error: 'User ID and message required' }, { status: 400 });
    }

    // Check if db is properly initialized
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

    // Add message to conversation
    const currentMessages = conversation.data()?.messages || [];
    const newMessage = {
      id: Date.now().toString(),
      role: message.role,
      content: message.content,
      timestamp: new Date()
    };

    // Derive a title if needed
    let titleUpdate: string | undefined;
    const currentTitle: string | undefined = conversation.data()?.title;
    const isDefaultTitle = !currentTitle || currentTitle === 'New Conversation';

    if (isDefaultTitle) {
      if (newMessage.role === 'assistant') {
        const content: string = newMessage.content || '';
        const verdictMatch = content.match(/\*\*Verdict:\*\*\s*([^\n]+)/i);
        const confidenceMatch = content.match(/\*\*Confidence:\*\*\s*([0-9]+(?:\.[0-9]+)?)%?/i);
        if (verdictMatch) {
          const verdict = verdictMatch[1].trim();
          const confidence = confidenceMatch ? `${confidenceMatch[1]}%` : undefined;
          titleUpdate = confidence ? `${verdict} (${confidence})` : verdict;
        } else {
          titleUpdate = content.slice(0, 60).trim();
        }
      } else if (newMessage.role === 'user') {
        const firstWords = (newMessage.content || '')
          .replace(/\s+/g, ' ')
          .trim()
          .split(' ')
          .slice(0, 12)
          .join(' ');
        titleUpdate = firstWords || 'New Conversation';
      }
    }

    const updatePayload: any = {
      messages: [...currentMessages, newMessage],
      updatedAt: new Date()
    };
    if (titleUpdate) {
      updatePayload.title = titleUpdate;
    }

    await conversationRef.update(updatePayload);
    
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const conversationId = id;
    const { uid, messageId, content } = await req.json();
    
    if (!uid || !messageId || !content) {
      return NextResponse.json({ error: 'User ID, message ID, and content required' }, { status: 400 });
    }

    // Check if db is properly initialized
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

    // Update the specific message
    const currentMessages = conversation.data()?.messages || [];
    const updatedMessages = currentMessages.map((msg: any) => 
      msg.id === messageId 
        ? { ...msg, content: content.trim() }
        : msg
    );

    await conversationRef.update({
      messages: updatedMessages,
      updatedAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}