import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

    // Delete conversations, messages, feedback, and user doc
    const batch = db.batch();

    const convs = await db.collection('conversations').where('uid', '==', uid).get();
    convs.forEach(c => batch.delete(c.ref));

    const msgs = await db.collectionGroup('messages').where('uid', '==', uid).get();
    msgs.forEach(m => batch.delete(m.ref));

    const fbs = await db.collection('feedback').where('uid', '==', uid).get();
    fbs.forEach(f => batch.delete(f.ref));

    const userRef = db.collection('users').doc(uid);
    batch.delete(userRef);

    await batch.commit();

    try {
      await admin.auth().deleteUser(uid);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}


