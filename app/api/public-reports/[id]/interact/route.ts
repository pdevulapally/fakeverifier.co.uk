import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Handle likes, dislikes, and other interactions for public reports
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, userId } = await req.json();

    if (!action || !['like', 'dislike', 'unlike', 'undislike'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Try chatHistory first (conversations made public)
    let reportRef = db.collection('chatHistory').doc(id);
    let report = await reportRef.get();
    let reportData = report.data();

    // If not found in chatHistory, try publicReports collection
    if (!report.exists) {
      reportRef = db.collection('publicReports').doc(id);
      report = await reportRef.get();
      reportData = report.data();
    }

    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if report is public
    if (!reportData?.isPublic && reportData?.privacyLevel !== 'public') {
      return NextResponse.json({ error: 'Report is not public' }, { status: 403 });
    }

    const currentLikes = reportData?.likes || 0;
    const currentDislikes = reportData?.dislikes || 0;

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

    await reportRef.update(updateData);

    return NextResponse.json({ 
      success: true,
      likes: updateData.likes,
      dislikes: updateData.dislikes
    });
  } catch (error) {
    console.error('Error updating report interaction:', error);
    return NextResponse.json({ error: 'Failed to update interaction' }, { status: 500 });
  }
}
