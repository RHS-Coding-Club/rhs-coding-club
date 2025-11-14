import { brevoService } from '@/lib/brevo';
import { NextRequest, NextResponse } from 'next/server';
import { addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { newsletterSubscribersCollection } from '@/lib/firebase-collections';

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if email already exists in Firestore
    const q = query(newsletterSubscribersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Only add to Firestore if not already subscribed
      await addDoc(newsletterSubscribersCollection, {
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        subscribedAt: serverTimestamp(),
      });
    }

    // Add to Brevo (will update if already exists)
    const success = await brevoService.subscribeToNewsletter({ 
      email,
      firstName,
      lastName 
    });

    if (success) {
      // Send welcome email
      await brevoService.sendNewsletterWelcomeEmail(email);
      
      return NextResponse.json({ success: true, message: 'Successfully subscribed and welcome email sent!' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to add to email service' }, { status: 500 });
    }
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
