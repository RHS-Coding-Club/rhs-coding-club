import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/services/github';

// This endpoint checks the live membership status for a given GitHub username.
// It returns:
// - joined: user is currently in the org
// - invite-sent: there is an outstanding invitation (still pending acceptance)
// - not-invited: neither a member nor invited (can be used to re-trigger invite logic if needed)
// Optionally echo back original request status to help client decide transitions.
export async function POST(req: NextRequest) {
  try {
    const { githubUsername } = await req.json();

    if (!githubUsername) {
      return NextResponse.json({ error: 'githubUsername is required' }, { status: 400 });
    }

    // Detailed membership state (active, pending, none, etc.)
    const membership = await githubService.getMembershipState(githubUsername);

    // Fallback checks for invitation listing (in case state returns 'none' but invitation exists)
    const isInvited = await githubService.isUserInvitedToOrganization(githubUsername);

    let status: 'joined' | 'invite-sent' | 'not-invited';
    if (membership.state === 'active') {
      status = 'joined';
    } else if (membership.state === 'pending' || isInvited) {
      status = 'invite-sent';
    } else {
      status = 'not-invited';
    }

    return NextResponse.json({ 
      success: true, 
      status,
      membershipState: membership.state,
      role: membership.role || null,
      invited: isInvited,
    });
  } catch (error) {
    console.error('Error checking GitHub membership status:', error);
    return NextResponse.json({ error: 'Failed to check membership status' }, { status: 500 });
  }
}
