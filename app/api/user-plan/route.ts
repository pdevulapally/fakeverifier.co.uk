import { db } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'User ID (uid) is required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized', plan: 'free' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    const tokenUsageRef = db.collection('tokenUsage').doc(uid);
    const tokenUsageDoc = await tokenUsageRef.get();

    if (tokenUsageDoc.exists) {
      const docData = tokenUsageDoc.data() as any;
      return NextResponse.json({ plan: docData?.plan || 'free' }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ plan: 'free' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user plan', plan: 'free' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
