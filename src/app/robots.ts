import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/onboarding',
          '/practice-quiz',
          '/practice-quiz-free-response',
          '/lesson/',
          '/private',
          '/_next/',
          '/node_modules/',
          '*.json',
          '*.xml',
          '*.yml',
          '*.yaml',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/onboarding',
          '/practice-quiz',
          '/practice-quiz-free-response',
          '/lesson/',
          '/private',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/onboarding',
          '/practice-quiz',
          '/practice-quiz-free-response',
          '/lesson/',
          '/private',
        ],
      },
    ],
    sitemap: 'https://ap-ally.com/sitemap.xml',
    host: 'https://ap-ally.com',
  };
}