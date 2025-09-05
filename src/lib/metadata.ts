import { Metadata } from 'next';

const baseUrl = 'https://rhscodingclub.com';
const defaultImage = `${baseUrl}/opengraph-image.png`;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'RHS Coding Club - Learn Programming & Build Projects',
    template: '%s | RHS Coding Club',
  },
  description:
    'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers. Open to all skill levels.',
  keywords: [
    'coding club',
    'programming',
    'RHS',
    'students',
    'technology',
    'development',
    'computer science',
    'software engineering',
    'web development',
    'coding challenges',
    'programming contests',
    'tech community',
    'student organization',
  ],
  authors: [{ name: 'RHS Coding Club', url: baseUrl }],
  creator: 'RHS Coding Club',
  publisher: 'RHS Coding Club',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Education',
  classification: 'Educational Organization',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'RHS Coding Club',
    title: 'RHS Coding Club - Learn Programming & Build Projects',
    description:
      'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers. Open to all skill levels.',
    images: [
      {
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: 'RHS Coding Club',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rhscodingclub',
    creator: '@rhscodingclub',
    title: 'RHS Coding Club - Learn Programming & Build Projects',
    description:
      'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers.',
    images: [defaultImage],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    // Add other verification codes as needed
  },
  alternates: {
    canonical: baseUrl,
  },
  other: {
    'theme-color': '#667eea',
    'color-scheme': 'light dark',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'RHS Coding Club',
    'application-name': 'RHS Coding Club',
    'msapplication-TileColor': '#667eea',
    'msapplication-config': '/browserconfig.xml',
  },
};

interface PageMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  image = defaultImage,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
}: PageMetadataProps = {}): Metadata {
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullTitle = title ? `${title} | RHS Coding Club` : 'RHS Coding Club - Learn Programming & Build Projects';
  const metaDescription = description || 'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers. Open to all skill levels.';

  return {
    title,
    description: metaDescription,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: fullTitle,
      description: metaDescription,
      url: fullUrl,
      type: type as 'website' | 'article',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || 'RHS Coding Club',
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        author,
        section,
        tags,
      }),
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: fullTitle,
      description: metaDescription,
      images: [image],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : defaultMetadata.robots,
  };
}

export function generateStructuredData(type: 'Organization' | 'WebSite' | 'Article', data: Record<string, unknown>) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseStructuredData,
        '@type': 'Organization',
        name: 'RHS Coding Club',
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        description: defaultMetadata.description,
        sameAs: [
          // Add social media links here
        ],
        ...data,
      };

    case 'WebSite':
      return {
        ...baseStructuredData,
        '@type': 'WebSite',
        name: 'RHS Coding Club',
        url: baseUrl,
        description: defaultMetadata.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };

    case 'Article':
      return {
        ...baseStructuredData,
        '@type': 'Article',
        publisher: {
          '@type': 'Organization',
          name: 'RHS Coding Club',
          logo: `${baseUrl}/icon.png`,
        },
        ...data,
      };

    default:
      return baseStructuredData;
  }
}
