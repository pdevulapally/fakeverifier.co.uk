import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Handle likes/dislikes for comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const { commentId } = await params;
    const { action } = await req.json();

    if (!action || !['like', 'dislike', 'unlike', 'undislike'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const commentRef = db.collection('reportComments').doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const commentData = comment.data();
    const currentLikes = commentData?.likes || 0;
    const currentDislikes = commentData?.dislikes || 0;

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
    }

    await commentRef.update(updateData);

    return NextResponse.json({
      success: true,
      likes: updateData.likes,
      dislikes: updateData.dislikes,
    });
  } catch (error) {
    console.error('Error updating comment interaction:', error);
    return NextResponse.json({ error: 'Failed to update interaction' }, { status: 500 });
  }
}

