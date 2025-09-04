import { NextResponse } from 'next/server';
import { Feed } from 'feed';
import { getPublishedPosts } from '@/lib/services/posts';

export async function GET() {
  try {
    const { posts } = await getPublishedPosts(50); // Get latest 50 posts for RSS

    const feed = new Feed({
      title: 'RHS Coding Club Blog',
      description: 'Latest blog posts and announcements from the RHS Coding Club',
      id: process.env.NEXT_PUBLIC_SITE_URL || 'https://rhs-coding-club.com',
      link: process.env.NEXT_PUBLIC_SITE_URL || 'https://rhs-coding-club.com',
      language: 'en',
      image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rhs-coding-club.com'}/logo.png`,
      favicon: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rhs-coding-club.com'}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, RHS Coding Club`,
      updated: posts.length > 0 ? posts[0].createdAt.toDate() : new Date(),
      generator: 'Next.js',
      feedLinks: {
        rss2: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rhs-coding-club.com'}/api/rss`,
      },
      author: {
        name: 'RHS Coding Club',
        email: process.env.CONTACT_EMAIL || 'contact@rhs-coding-club.com',
        link: process.env.NEXT_PUBLIC_SITE_URL || 'https://rhs-coding-club.com',
      },
    });

    posts.forEach((post) => {
      const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rhs-coding-club.com'}/blog/${post.slug || post.id}`;
      
      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.summary,
        content: post.content,
        author: [
          {
            name: post.author,
          },
        ],
        date: post.createdAt.toDate(),
        category: post.tags?.map(tag => ({ name: tag })) || [],
      });
    });

    const rssXml = feed.rss2();

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, must-revalidate', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
