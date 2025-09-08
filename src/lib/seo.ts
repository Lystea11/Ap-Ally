import { Metadata } from 'next';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export const DEFAULT_SEO = {
  title: 'AP Ally - Free AI-Powered AP Test Prep & Study Guide',
  description: 'Master AP exams with AI-powered study plans, interactive lessons, and progress tracking. Free AP test prep for all subjects.',
  keywords: [
    'AP test prep',
    'AP exam preparation',
    'AP study guide',
    'free AP prep',
    'AI tutoring',
    'AP practice tests',
    'AP study plan',
    'college board prep',
    'AP calculus',
    'AP biology',
    'AP chemistry',
    'AP physics',
    'AP english',
    'AP history',
  ],
  ogImage: '/og-image.jpg',
  canonicalUrl: 'https://ap-ally.com',
};

export const AP_SUBJECTS = [
  'AP Biology',
  'AP Chemistry',
  'AP Physics 1',
  'AP Physics 2',
  'AP Physics C',
  'AP Calculus AB',
  'AP Calculus BC',
  'AP Statistics',
  'AP Computer Science A',
  'AP Computer Science Principles',
  'AP English Language',
  'AP English Literature',
  'AP US History',
  'AP World History',
  'AP European History',
  'AP Government',
  'AP Economics',
  'AP Psychology',
  'AP Human Geography',
  'AP Environmental Science',
];

export function createSEOMetadata(props: SEOProps = {}): Metadata {
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    canonicalUrl = DEFAULT_SEO.canonicalUrl,
    ogImage = DEFAULT_SEO.ogImage,
    ogType = 'website',
    publishedTime,
    modifiedTime,
    author = 'AP Ally',
    noIndex = false,
    noFollow = false,
  } = props;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: 'AP Ally',
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      type: ogType,
      title,
      description,
      url: canonicalUrl,
      siteName: 'AP Ally',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@ap_ally',
      site: '@ap_ally',
    },
    other: {
      'application-name': 'AP Ally',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'AP Ally',
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'theme-color': '#4f46e5',
      'msapplication-TileColor': '#4f46e5',
    },
  };

  if (publishedTime && metadata.other) {
    metadata.other['article:published_time'] = publishedTime;
  }

  if (modifiedTime && metadata.other) {
    metadata.other['article:modified_time'] = modifiedTime;
  }

  return metadata;
}

export function generateStructuredData(type: 'website' | 'course' | 'faq' | 'organization', data: any = {}) {
  const baseUrl = 'https://ap-ally.com';
  
  switch (type) {
    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'AP Ally',
        alternateName: 'AP Ally - Free AP Test Prep',
        url: baseUrl,
        description: 'Free AI-powered AP test preparation platform with personalized study plans and interactive lessons.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        sameAs: [
          'https://twitter.com/ap_ally',
          'https://facebook.com/ap_ally',
          'https://instagram.com/ap_ally',
        ],
      };

    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AP Ally',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Free AI-powered AP test preparation platform helping students achieve their target scores.',
        foundingDate: '2024',
        sameAs: [
          'https://twitter.com/ap_ally',
          'https://facebook.com/ap_ally',
          'https://instagram.com/ap_ally',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@ap-ally.com',
          contactType: 'Customer Support',
        },
      };

    case 'course':
      return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: data.name || 'AP Test Preparation Course',
        description: data.description || 'Comprehensive AP test preparation with personalized AI tutoring.',
        provider: {
          '@type': 'Organization',
          name: 'AP Ally',
          url: baseUrl,
        },
        educationalLevel: 'High School',
        courseMode: 'online',
        isAccessibleForFree: true,
        inLanguage: 'en',
        teaches: data.subjects || AP_SUBJECTS,
        totalTime: data.duration || 'P3M',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      };

    case 'faq':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions?.map((q: any) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })) || [],
      };

    default:
      return null;
  }
}

export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `https://ap-ally.com${item.href}`,
    })),
  };
}

export function getSubjectSEOData(subject: string) {
  const subjectLower = subject.toLowerCase();
  
  return {
    title: `Free ${subject} Test Prep & Study Guide - AP Ally`,
    description: `Master ${subject} with our free AI-powered study plan. Get personalized lessons, practice tests, and expert guidance to ace your ${subject} exam.`,
    keywords: [
      `${subject.toLowerCase()} test prep`,
      `${subject.toLowerCase()} study guide`,
      `free ${subject.toLowerCase()} prep`,
      `${subject.toLowerCase()} practice test`,
      `${subject.toLowerCase()} exam prep`,
      `${subject.toLowerCase()} study plan`,
      `${subject.toLowerCase()} tutoring`,
      `${subject.toLowerCase()} review`,
      'ap test prep',
      'college board prep',
    ],
    canonicalUrl: `https://ap-ally.com/subjects/${subjectLower.replace(/\s+/g, '-')}`,
  };
}

export function generatePageTitle(title: string, includeAppName: boolean = true): string {
  if (includeAppName) {
    return `${title} - AP Ally`;
  }
  return title;
}

export function truncateDescription(description: string, maxLength: number = 155): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + '...';
}