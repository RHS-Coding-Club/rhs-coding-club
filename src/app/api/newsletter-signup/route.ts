import { brevoService } from '@/lib/brevo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Add to Brevo
    const success = await brevoService.subscribeToNewsletter({ email });

    if (success) {
      // Send welcome email
      await brevoService.sendNewsletterWelcomeEmail(email);
      
      return NextResponse.json({ success: true, message: 'Successfully subscribed and welcome email sent!' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to add to email service' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
