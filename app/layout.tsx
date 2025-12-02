'use client';

import './globals.css';
import CardNav from '@/components/CardNav';
import { Footer as UiFooter } from '@/components/ui/footer-section';
import '@/components/CardNav.css';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';

const items = [
  {
    label: 'Product',
    bgColor: 'var(--primary)',
    textColor: 'var(--primary-foreground)',
    links: [
      { label: 'Verify', ariaLabel: 'Open verification tool', href: '/verify' },
      { label: 'How it works', ariaLabel: 'How FakeVerifier works', href: '/#how-it-works' },
      { label: 'Plans', ariaLabel: 'View pricing plans', href: '/#plans' },
    ],
  },
  {
    label: 'Resources',
    bgColor: 'var(--secondary)',
    textColor: 'var(--secondary-foreground)',
    links: [
      { label: 'History', ariaLabel: 'View verification history', href: '/history' },
      { label: 'Public reports', ariaLabel: 'Browse public reports', href: '/public-reports' },
      { label: 'Status', ariaLabel: 'Check system status', href: '/status' },
    ],
  },
  {
    label: 'Company',
    bgColor: 'var(--accent)',
    textColor: 'var(--accent-foreground)',
    links: [
      { label: 'About', ariaLabel: 'About FakeVerifier', href: '/#about' },
      { label: 'Contact', ariaLabel: 'Contact us', href: '/contact' },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVerifyPage = pathname === '/verify';

  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            {!isVerifyPage && (
              <CardNav logo={'/Images/Fakeverifier-official-logo.png'} logoAlt="FakeVerifier Official Logo" items={items} baseColor={'var(--card)'} menuColor={'var(--foreground)'} buttonBgColor={'var(--primary)'} buttonTextColor={'var(--primary-foreground)'} ease="power3.out" />
            )}
            {children}
            {!isVerifyPage && <UiFooter />}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


