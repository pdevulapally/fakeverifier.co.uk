import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get all public reports with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const verdict = searchParams.get('verdict') || 'all';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Build query - only show conversations that are explicitly public
    let query = db.collection('chatHistory')
      .where('isPublic', '==', true)
      .where('privacyLevel', '==', 'public');

    // Apply verdict filter (if we have verdict data in chatHistory)
    if (verdict !== 'all') {
      const verdictMap: { [key: string]: string } = {
        'likely-real': 'Likely Real',
        'likely-fake': 'Likely Fake',
        'mixed': 'Mixed',
        'unverified': 'Unverified'
      };
      // Note: We'll need to add verdict data to chatHistory or create a separate mapping
      // For now, we'll skip verdict filtering for chatHistory conversations
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const totalReports = totalSnapshot.size;

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.orderBy('createdAt', 'desc');
        break;
      case 'oldest':
        query = query.orderBy('createdAt', 'asc');
        break;
      case 'most-viewed':
        query = query.orderBy('views', 'desc');
        break;
      case 'highest-confidence':
        query = query.orderBy('confidence', 'desc');
        break;
      default:
        query = query.orderBy('createdAt', 'desc');
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Conversation',
        content: data.messages?.[0]?.content || 'No content available',
        verdict: 'Unverified', // Default since we don't have verdict in chatHistory
        confidence: 0,
        author: data.author || 'Anonymous',
        views: data.views || 0,
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        tags: data.tags || [],
        sources: data.sources || [],
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
    });

    // Filter by search term (client-side for now, could be moved to server-side)
    const filteredReports = reports.filter(report => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        report.title?.toLowerCase().includes(searchLower) ||
        report.content?.toLowerCase().includes(searchLower) ||
        report.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
        report.author?.toLowerCase().includes(searchLower)
      );
    });

    return NextResponse.json({
      reports: filteredReports,
      pagination: {
        page,
        limit,
        total: totalReports,
        totalPages: Math.ceil(totalReports / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// Create a new public report
export async function POST(req: NextRequest) {
  try {
    const { 
      title, 
      content, 
      verdict, 
      confidence, 
      author, 
      tags, 
      sources, 
      userId 
    } = await req.json();

    if (!title || !content || !verdict || !author || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const reportData = {
      title: title.trim(),
      content: content.trim(),
      verdict,
      confidence: confidence || 0,
      author: author.trim(),
      tags: tags || [],
      sources: sources || [],
      views: 0,
      likes: 0,
      dislikes: 0,
      isPublic: true,
      isActive: true,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reportsRef = db.collection('publicReports');
    const docRef = await reportsRef.add(reportData);
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...reportData 
    });
  } catch (error) {
    console.error('Error creating public report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
