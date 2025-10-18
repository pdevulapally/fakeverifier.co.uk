import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get a specific public report by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const reportRef = db.collection('publicReports').doc(id);
    const report = await reportRef.get();

    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const reportData = report.data();
    
    // Check if the conversation is public and has the right privacy level
    if (!reportData?.isPublic || reportData?.privacyLevel !== 'public') {
      return NextResponse.json({ 
        error: 'Access denied - This conversation is private and can only be accessed by the owner' 
      }, { status: 403 });
    }

    const responseData = {
      id: report.id,
      title: reportData.title || 'Untitled Conversation',
      content: reportData.messages?.[0]?.content || 'No content available',
      verdict: 'Unverified', // Default since we don't have verdict in chatHistory
      confidence: 0,
      author: reportData.author || 'Anonymous',
      views: reportData.views || 0,
      likes: reportData.likes || 0,
      dislikes: reportData.dislikes || 0,
      tags: reportData.tags || [],
      sources: reportData.sources || [],
      createdAt: reportData?.createdAt?.toDate?.() || new Date(),
      updatedAt: reportData?.updatedAt?.toDate?.() || new Date()
    };

    // Increment view count
    await reportRef.update({
      views: (reportData?.views || 0) + 1,
      updatedAt: new Date()
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

// Update a public report
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { 
      title, 
      content, 
      verdict, 
      confidence, 
      tags, 
      sources,
      userId 
    } = await req.json();

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const reportRef = db.collection('publicReports').doc(id);
    const report = await reportRef.get();

    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user owns the report
    if (report.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (verdict) updateData.verdict = verdict;
    if (confidence !== undefined) updateData.confidence = confidence;
    if (tags) updateData.tags = tags;
    if (sources) updateData.sources = sources;

    await reportRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

// Delete a public report
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const reportRef = db.collection('publicReports').doc(id);
    const report = await reportRef.get();

    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user owns the report
    if (report.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await reportRef.update({
      isActive: false,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
