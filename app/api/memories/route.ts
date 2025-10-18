import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get all memories for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Fetch memories for the user
    const memoriesRef = db.collection('memories');
    const snapshot = await memoriesRef
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const memories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

// Create a new memory
export async function POST(req: NextRequest) {
  try {
    const { uid, content, type, tags } = await req.json();
    
    if (!uid || !content) {
      return NextResponse.json({ error: 'User ID and content required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const memoryData = {
      uid,
      content: content.trim(),
      type: type || 'general',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const memoriesRef = db.collection('memories');
    const docRef = await memoriesRef.add(memoryData);
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...memoryData 
    });
  } catch (error) {
    console.error('Error creating memory:', error);
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}

// Update a memory
export async function PUT(req: NextRequest) {
  try {
    const { id, uid, content, type, tags, isActive } = await req.json();
    
    if (!id || !uid || !content) {
      return NextResponse.json({ error: 'Memory ID, user ID, and content required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Verify ownership
    const memoryRef = db.collection('memories').doc(id);
    const memory = await memoryRef.get();
    
    if (!memory.exists || memory.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Memory not found or access denied' }, { status: 404 });
    }

    const updateData = {
      content: content.trim(),
      type: type || 'general',
      tags: tags || [],
      updatedAt: new Date(),
      ...(isActive !== undefined && { isActive })
    };

    await memoryRef.update(updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating memory:', error);
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 });
  }
}

// Delete a memory
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const uid = searchParams.get('uid');
    
    if (!id || !uid) {
      return NextResponse.json({ error: 'Memory ID and user ID required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Verify ownership
    const memoryRef = db.collection('memories').doc(id);
    const memory = await memoryRef.get();
    
    if (!memory.exists || memory.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Memory not found or access denied' }, { status: 404 });
    }

    await memoryRef.delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }
}
