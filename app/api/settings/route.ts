import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    const userDoc = await db.collection('users').doc(uid).get();
    const u = userDoc.data() || {};
    // Enrich with Auth record for verified status/phone/member since
    let emailVerified = false;
    let phoneNumber = '' as string | null;
    let memberSinceIso = '' as string | null;
    try {
      const authUser = await admin.auth().getUser(uid);
      emailVerified = !!authUser.emailVerified;
      phoneNumber = (authUser.phoneNumber as string) || '';
      memberSinceIso = (authUser.metadata?.creationTime as string) || '';
    } catch {}
    const settings = {
      name: u.name || 'User',
      email: u.email || '',
      avatar: u.avatar || '',
      plan: u.plan || 'free',
      privacy: {
        shareAnonymousData: !!u.privacy?.shareAnonymousData,
        personalizedModels: !!u.privacy?.personalizedModels,
        showPublicReports: !!u.privacy?.showPublicReports,
      },
      data: {
        retainHistoryDays: typeof u.data?.retainHistoryDays === 'number' ? u.data.retainHistoryDays : 90,
        exportRequestedAt: u.data?.exportRequestedAt || null,
      },
      meta: {
        emailVerified,
        phoneNumber: phoneNumber || '',
        memberSinceIso: memberSinceIso || null,
      },
    };
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, settings } = body || {};
    if (!uid || !settings) return NextResponse.json({ error: 'uid and settings required' }, { status: 400 });
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    await db.collection('users').doc(uid).set({
      name: settings.name,
      avatar: settings.avatar,
      privacy: settings.privacy,
      data: settings.data,
    }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}


