import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
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

    // Fetch user data from Firebase using Admin SDK
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({ 
      user: {
        uid,
        name: userData?.name || 'User',
        email: userData?.email || '',
        avatar: userData?.avatar || '',
        plan: userData?.plan || 'free'
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, name, email, avatar } = await req.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if db is properly initialized
    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Create or update user in Firebase using Admin SDK
    // IMPORTANT: Do not overwrite existing plan on login
    const userRef = db.collection('users').doc(uid);
    await userRef.set({
      uid,
      name: name || 'User',
      email: email || '',
      avatar: avatar || '',
      // plan: preserve existing; do not set here to avoid downgrading
      tokensDaily: 10,
      tokensMonthly: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    // Also create/update tokenUsage document to keep collections in sync
    const tokenUsageRef = db.collection('tokenUsage').doc(uid);
    const tokenUsageDoc = await tokenUsageRef.get();
    
    if (!tokenUsageDoc.exists) {
      // Create new tokenUsage document for the user
      await tokenUsageRef.set({
        uid: uid,
        plan: 'free',
        dailyUsed: 0,
        used: 0,
        total: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    } // If exists, leave plan untouched
    
    // Return minimal user; plan will be fetched via /api/user-plan
    return NextResponse.json({ 
      user: {
        uid,
        name: name || 'User',
        email: email || '',
        avatar: avatar || ''
      }
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
  }
}
