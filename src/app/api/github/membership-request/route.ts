import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/services/github';

export async function POST(req: NextRequest) {
  try {
    const { githubUsername, note, userId, userEmail } = await req.json();

    // Basic validation
    if (!githubUsername || !userId || !userEmail) {
      return NextResponse.json({ 
        error: 'GitHub username, user ID, and email are required' 
      }, { status: 400 });
    }

    // Validate GitHub username format
    const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    if (!usernameRegex.test(githubUsername)) {
      return NextResponse.json({ 
        error: 'Invalid GitHub username format' 
      }, { status: 400 });
    }

    // Verify GitHub user exists
    const githubUser = await githubService.getUserByUsername(githubUsername);
    if (!githubUser) {
      return NextResponse.json({ 
        error: 'GitHub user not found' 
      }, { status: 404 });
    }

    // Check if user is already a member or invited
    const [isMember, isInvited] = await Promise.all([
      githubService.isUserInOrganization(githubUsername),
      githubService.isUserInvitedToOrganization(githubUsername)
    ]);

    let status = 'pending';
    let message = 'Request submitted successfully! Admins will review your request soon.';

    if (isMember) {
      status = 'already-member';
      message = 'You are already a member of the organization!';
    } else if (isInvited) {
      status = 'already-invited';
      message = 'You already have a pending invitation to the organization!';
    }

    // Return the data to be saved by the client
    const requestData = {
      userId,
      userEmail,
      githubUsername: githubUser.login, // Use the canonical username from GitHub
      githubId: githubUser.id,
      githubEmail: githubUser.email,
      note: note || '',
      status,
    };

    return NextResponse.json({ 
      success: true, 
      requestData,
      status,
      message
    });

  } catch (error) {
    console.error('Error processing GitHub membership request:', error);
    return NextResponse.json({ 
      error: 'Failed to process membership request' 
    }, { status: 500 });
  }
}