import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Store contact form submission in Firestore
    const contactRef = db.collection('contacts').doc();
    await contactRef.set({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // In a real application, you would also:
    // 1. Send an email notification to your team
    // 2. Send an auto-reply to the user
    // 3. Integrate with your CRM system
    
    /* Contact form submitted data intentionally not logged */

    return NextResponse.json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      id: contactRef.id
    });

  } catch (error) {
    
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
