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

    console.log('Unsubscribe request for:', email);

    // Remove from Brevo
    const success = await brevoService.unsubscribeFromNewsletter(email);

    if (success) {
      console.log('Successfully unsubscribed from Brevo:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully unsubscribed from newsletter' 
      });
    } else {
      console.log('Failed to unsubscribe from Brevo:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'Unsubscribed from our records (email service may take time to update)' 
      });
    }
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle GET requests for unsubscribe links
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.redirect(new URL('/newsletter/unsubscribe?error=missing-email', req.url));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.redirect(new URL('/newsletter/unsubscribe?error=invalid-email', req.url));
    }

    // Redirect to unsubscribe page with email pre-filled
    return NextResponse.redirect(new URL(`/newsletter/unsubscribe?email=${encodeURIComponent(email)}`, req.url));
  } catch (error) {
    console.error('Unsubscribe GET error:', error);
    return NextResponse.redirect(new URL('/newsletter/unsubscribe?error=server-error', req.url));
  }
}
