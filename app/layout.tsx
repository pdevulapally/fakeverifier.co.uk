import type { Metadata } from 'next';
import './globals.css';
import '@/components/CardNav.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import BootstrapClient from '@/components/BootstrapClient';

// SEO Metadata Configuration
export const metadata: Metadata = {
  metadataBase: new URL('https://fakeverifier.co.uk'),
  title: {
    default: 'FakeVerifier - AI-Powered Fact-Checking & Verification Tool',
    template: '%s | FakeVerifier',
  },
  description: 'Verify claims, news articles, and information with AI-powered fact-checking. Get instant verification results with confidence scores, Preetham Devulapally, news, fake news, fake news detector, source citations, and evidence-based verdicts. Trusted by journalists, researchers, and fact-checkers worldwide.',
  keywords: [
    'fact checking',
    'fact checker',
    'AI verification',
    'fake news detector',
    'information verification',
    'news verification',
    'claim verification',
    'AI fact checker',
    'automated fact checking',
    'misinformation detection',
    'disinformation detection',
    'truth verification',
    'source verification',
    'evidence-based verification',
    'confidence scoring',
    'journalism tools',
    'research tools',
    'fact-checking tool',
    'verification service',
    'AI-powered verification',
    'real-time fact checking',
    'news authenticity',
    'content verification',
    'URL verification',
    'text verification',
    'claim analysis',
    'information credibility',
    'trust verification',
    'FakeVerifier',
    'fakeverifier.co.uk',
  ],
  authors: [{ name: 'FakeVerifier Team' }],
  creator: 'FakeVerifier',
  publisher: 'FakeVerifier',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://fakeverifier.co.uk',
    siteName: 'FakeVerifier',
    title: 'FakeVerifier - AI-Powered Fact-Checking & Verification Tool',
    description: 'Verify claims, news articles, and information with AI-powered fact-checking. Get instant verification results with confidence scores, source citations, and evidence-based verdicts.',
    images: [
      {
        url: '/Images/Fakeverifier-official-logo.png',
        width: 1200,
        height: 630,
        alt: 'FakeVerifier - AI-Powered Fact-Checking Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FakeVerifier - AI-Powered Fact-Checking & Verification Tool',
    description: 'Verify claims, news articles, and information with AI-powered fact-checking. Get instant verification results with confidence scores and source citations.',
    images: ['/Images/Fakeverifier-official-logo.png'],
    creator: '@fakeverifier',
  },
  alternates: {
    canonical: 'https://fakeverifier.co.uk',
  },
  category: 'Technology',
  classification: 'Fact-Checking Tool',
  other: {
    'application-name': 'FakeVerifier',
    'apple-mobile-web-app-title': 'FakeVerifier',
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
    'theme-color': '#3b82f6',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href="https://fakeverifier.co.uk" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'FakeVerifier',
              applicationCategory: 'Fact-Checking Tool',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'GBP',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250',
              },
              description: 'AI-powered fact-checking and verification tool that analyzes claims against multiple sources to provide accurate, evidence-based verdicts.',
              url: 'https://fakeverifier.co.uk',
              logo: 'https://fakeverifier.co.uk/Images/Fakeverifier-official-logo.png',
              sameAs: [
                'https://twitter.com/fakeverifier',
                'https://github.com/fakeverifier',
              ],
            }),
          }}
        />
        
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'FakeVerifier',
              url: 'https://fakeverifier.co.uk',
              description: 'AI-powered fact-checking and verification tool',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://fakeverifier.co.uk/verify?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'FakeVerifier',
              url: 'https://fakeverifier.co.uk',
              logo: 'https://fakeverifier.co.uk/Images/Fakeverifier-official-logo.png',
              description: 'AI-powered fact-checking and verification platform',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Support',
                url: 'https://fakeverifier.co.uk/contact',
              },
            }),
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </ToastProvider>
        </AuthProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}


