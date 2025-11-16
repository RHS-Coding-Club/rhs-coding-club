import { MetadataRoute } from 'next';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';


export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rhscoding.club';
  
  // Static routes with their priority and change frequency
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/challenges`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hall-of-fame`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch dynamic routes using Admin SDK
  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // Only fetch on server-side during build
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase-admin');

      // Fetch blog posts
      const blogSnapshot = await adminDb.collection('posts').get();
      const blogRoutes: MetadataRoute.Sitemap = blogSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          url: `${baseUrl}/blog/${doc.id}`,
          lastModified: data.createdAt?.toDate() || new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      });

      // Fetch challenges
      const challengesSnapshot = await adminDb.collection('challenges').get();
      const challengeRoutes: MetadataRoute.Sitemap = challengesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          url: `${baseUrl}/challenges/${doc.id}`,
          lastModified: data.createdAt?.toDate() || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });

      // Fetch events
      const eventsSnapshot = await adminDb.collection('events').get();
      const eventRoutes: MetadataRoute.Sitemap = eventsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          url: `${baseUrl}/events/${doc.id}`,
          lastModified: data.createdAt?.toDate() || new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      });

      dynamicRoutes = [...blogRoutes, ...challengeRoutes, ...eventRoutes];
    }
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error);
    // Continue with static routes only if dynamic fetch fails
  }

  return [...staticRoutes, ...dynamicRoutes];
}
