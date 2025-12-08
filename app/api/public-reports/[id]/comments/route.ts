import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get comments for a report
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reportId = id;

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const commentsRef = db.collection('reportComments')
      .where('reportId', '==', reportId)
      .where('parentId', '==', null) // Only top-level comments
      .orderBy('createdAt', 'desc');

    const commentsSnapshot = await commentsRef.get();
    const comments = await Promise.all(commentsSnapshot.docs.map(async (doc) => {
      const commentData = doc.data();
      
      // Get replies for this comment
      const repliesRef = db.collection('reportComments')
        .where('parentId', '==', doc.id)
        .orderBy('createdAt', 'asc');
      const repliesSnapshot = await repliesRef.get();
      const replies = repliesSnapshot.docs.map(replyDoc => ({
        id: replyDoc.id,
        ...replyDoc.data(),
        createdAt: replyDoc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));

      return {
        id: doc.id,
        ...commentData,
        replies,
        createdAt: commentData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }));

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// Add a comment or reply
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reportId = id;
    const { content, author, parentId, userId } = await req.json();

    if (!content || !author) {
      return NextResponse.json({ error: 'Content and author are required' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Verify report exists and is public
    const reportRef = db.collection('chatHistory').doc(reportId);
    const report = await reportRef.get();
    
    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const reportData = report.data();
    if (!reportData?.isPublic && reportData?.privacyLevel !== 'public') {
      return NextResponse.json({ error: 'Report is not public' }, { status: 403 });
    }

    const commentData: any = {
      reportId,
      content: content.trim(),
      author: author.trim(),
      parentId: parentId || null,
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (userId) {
      commentData.userId = userId;
    }

    const commentsRef = db.collection('reportComments');
    const docRef = await commentsRef.add(commentData);

    return NextResponse.json({
      id: docRef.id,
      ...commentData,
      createdAt: commentData.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

