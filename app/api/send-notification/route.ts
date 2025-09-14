import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getDocs, query, where, collection } from 'firebase-admin/firestore';

// Firebase Admin SDK for sending notifications
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: {
    url?: string;
    category?: string;
    source?: string;
    articleId?: string;
    [key: string]: any;
  };
}

interface SendNotificationRequest {
  title: string;
  body: string;
  imageUrl?: string;
  category?: string;
  source?: string;
  articleId?: string;
  url?: string;
  targetUsers?: string[]; // Specific user IDs to send to
  targetCategory?: string; // Send to users subscribed to this category
  breakingNews?: boolean; // Send to users who want breaking news
}

// Send notification to specific FCM tokens
async function sendToTokens(tokens: string[], payload: NotificationPayload) {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.imageUrl,
      },
      data: {
        ...payload.data,
        timestamp: Date.now().toString(),
      },
      tokens: tokens,
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/Images/FakeVerifierlogoicon.png',
          badge: '/Images/FakeVerifierlogoicon.png',
          image: payload.imageUrl,
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Read Now',
              icon: '/Images/FakeVerifierlogoicon.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/Images/FakeVerifierlogoicon.png'
            }
          ],
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: payload.data?.url || 'https://www.fakeverifier.co.uk/live-news'
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Get FCM tokens for users based on criteria
async function getTokensForUsers(criteria: {
  targetUsers?: string[];
  targetCategory?: string;
  breakingNews?: boolean;
}): Promise<string[]> {
  try {
    const tokens: string[] = [];
    
    // Get all active FCM tokens
    const tokensQuery = query(
      adminDb.collection('fcmTokens'),
      where('active', '==', true)
    );
    
    const tokensSnapshot = await tokensQuery.get();
    const allTokens: { userId: string; token: string }[] = [];
    
    tokensSnapshot.forEach((doc) => {
      const data = doc.data();
      allTokens.push({
        userId: data.userId,
        token: data.token
      });
    });

    // If specific users are targeted
    if (criteria.targetUsers && criteria.targetUsers.length > 0) {
      const userTokens = allTokens
        .filter(t => criteria.targetUsers!.includes(t.userId))
        .map(t => t.token);
      tokens.push(...userTokens);
    } else {
      // Get tokens based on notification preferences
      const preferencesQuery = query(
        adminDb.collection('notificationPreferences'),
        where('enabled', '==', true)
      );
      
      const preferencesSnapshot = await preferencesQuery.get();
      const userIds: string[] = [];
      
      preferencesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Check if user wants breaking news
        if (criteria.breakingNews && data.breakingNews) {
          userIds.push(data.userId);
        }
        
        // Check if user is subscribed to the category
        if (criteria.targetCategory && data.categoryAlerts?.includes(criteria.targetCategory)) {
          userIds.push(data.userId);
        }
      });

      // Get tokens for matching users
      const matchingTokens = allTokens
        .filter(t => userIds.includes(t.userId))
        .map(t => t.token);
      
      tokens.push(...matchingTokens);
    }

    // Remove duplicates
    return [...new Set(tokens)];
  } catch (error) {
    console.error('Error getting tokens for users:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendNotificationRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Get FCM tokens based on criteria
    const tokens = await getTokensForUsers({
      targetUsers: body.targetUsers,
      targetCategory: body.targetCategory,
      breakingNews: body.breakingNews
    });

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'No eligible users found for notification' },
        { status: 404 }
      );
    }

    // Prepare notification payload
    const payload: NotificationPayload = {
      title: body.title,
      body: body.body,
      imageUrl: body.imageUrl,
      data: {
        url: body.url,
        category: body.category,
        source: body.source,
        articleId: body.articleId,
        type: 'news_update'
      }
    };

    // Send notifications in batches (FCM limit is 500 tokens per request)
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      batches.push(batch);
    }

    const results = [];
    for (const batch of batches) {
      const result = await sendToTokens(batch, payload);
      results.push(result);
    }

    // Calculate totals
    const totalSuccess = results.reduce((sum, r) => sum + r.successCount, 0);
    const totalFailure = results.reduce((sum, r) => sum + r.failureCount, 0);

    // Log notification sent
    await adminDb.collection('notificationLogs').add({
      title: body.title,
      body: body.body,
      category: body.category,
      source: body.source,
      tokensSent: tokens.length,
      successCount: totalSuccess,
      failureCount: totalFailure,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      criteria: {
        targetUsers: body.targetUsers,
        targetCategory: body.targetCategory,
        breakingNews: body.breakingNews
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications sent successfully',
      stats: {
        totalTokens: tokens.length,
        successCount: totalSuccess,
        failureCount: totalFailure,
        batches: batches.length
      }
    });

  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check notification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's FCM tokens
    const tokensQuery = query(
      adminDb.collection('fcmTokens'),
      where('userId', '==', userId),
      where('active', '==', true)
    );
    
    const tokensSnapshot = await tokensQuery.get();
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    // Get user's notification preferences
    const preferencesQuery = query(
      adminDb.collection('notificationPreferences'),
      where('userId', '==', userId)
    );
    
    const preferencesSnapshot = await preferencesQuery.get();
    const preferences = preferencesSnapshot.empty ? null : preferencesSnapshot.docs[0].data();

    return NextResponse.json({
      success: true,
      data: {
        hasTokens: tokens.length > 0,
        tokenCount: tokens.length,
        preferences: preferences
      }
    });

  } catch (error: any) {
    console.error('Error checking notification status:', error);
    return NextResponse.json(
      { error: 'Failed to check notification status', details: error.message },
      { status: 500 }
    );
  }
}
