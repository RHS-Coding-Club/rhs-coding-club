import Script from 'next/script';
import { generateStructuredData } from '@/lib/metadata';

export function StructuredData() {
  const organizationData = generateStructuredData('Organization', {
    name: 'RHS Coding Club',
    alternateName: ['RHS Programming Club', 'Richmond High School Coding Club'],
    url: 'https://rhscodingclub.com',
    logo: 'https://rhscodingclub.com/icon.png',
    image: 'https://rhscodingclub.com/opengraph-image.png',
    description: 'Student-led coding club at Richmond High School focused on programming education, project development, and technology innovation.',
    foundingDate: '2020',
    email: 'contact@rhscodingclub.com',
    memberOf: {
      '@type': 'EducationalOrganization',
      name: 'Richmond High School',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Richmond High School Community',
    },
    audience: {
      '@type': 'Audience',
      name: 'High School Students',
    },
    knowsAbout: [
      'Programming',
      'Web Development',
      'Software Engineering',
      'Computer Science',
      'Technology Education',
      'Coding Challenges',
      'Project Development',
    ],
    offers: [
      {
        '@type': 'Service',
        name: 'Programming Education',
        description: 'Weekly workshops and tutorials on various programming languages and technologies',
      },
      {
        '@type': 'Service',
        name: 'Coding Challenges',
        description: 'Regular programming challenges to practice and improve coding skills',
      },
      {
        '@type': 'Service',
        name: 'Project Collaboration',
        description: 'Opportunities to work on real-world projects with fellow students',
      },
      {
        '@type': 'Event',
        name: 'Tech Talks',
        description: 'Guest speakers and presentations on technology and career topics',
      },
    ],
    event: {
      '@type': 'Event',
      name: 'Weekly Club Meetings',
      description: 'Regular club meetings featuring workshops, project showcases, and collaborative coding sessions',
      eventSchedule: {
        '@type': 'Schedule',
        repeatFrequency: 'P1W', // Weekly
        byDay: 'http://schema.org/Wednesday',
      },
      location: {
        '@type': 'Place',
        name: 'Richmond High School',
      },
    },
  });

  const websiteData = generateStructuredData('WebSite', {
    name: 'RHS Coding Club',
    url: 'https://rhscodingclub.com',
    description: 'Official website of the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers.',
    inLanguage: 'en-US',
    author: {
      '@type': 'Organization',
      name: 'RHS Coding Club',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RHS Coding Club',
      logo: 'https://rhscodingclub.com/icon.png',
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: 'https://rhscodingclub.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      {
        '@type': 'JoinAction',
        target: 'https://rhscodingclub.com/join',
        object: {
          '@type': 'Organization',
          name: 'RHS Coding Club',
        },
      },
    ],
  });

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rhscodingclub.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://rhscodingclub.com/about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Events',
        item: 'https://rhscodingclub.com/events',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Projects',
        item: 'https://rhscodingclub.com/projects',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Challenges',
        item: 'https://rhscodingclub.com/challenges',
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'Blog',
        item: 'https://rhscodingclub.com/blog',
      },
    ],
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who can join the RHS Coding Club?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Any Richmond High School student can join, regardless of their programming experience level. We welcome beginners and experienced coders alike.',
        },
      },
      {
        '@type': 'Question',
        name: 'When does the club meet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We meet every Wednesday after school from 3:30 PM to 5:00 PM in the computer lab.',
        },
      },
      {
        '@type': 'Question',
        name: 'What programming languages are taught?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We cover various programming languages including Python, JavaScript, Java, HTML/CSS, and more depending on member interests and project needs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to bring my own laptop?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'While bringing your own laptop is helpful, it\'s not required. The school provides computers for club activities.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there any membership fees?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, membership in the RHS Coding Club is completely free for all Richmond High School students.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <Script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData),
        }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData),
        }}
      />
    </>
  );
}
