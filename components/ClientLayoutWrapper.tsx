'use client';

import { usePathname } from 'next/navigation';
import CardNav from '@/components/CardNav';
import { Footer as UiFooter } from '@/components/ui/footer-section';

const items = [
  {
    label: 'Product',
    bgColor: 'var(--primary)',
    textColor: 'var(--primary-foreground)',
    links: [
      { label: 'Verify', ariaLabel: 'Open verification tool', href: '/verify' },
      { label: 'How it works', ariaLabel: 'How FakeVerifier works', href: '/how-it-works' },
      { label: 'Plans', ariaLabel: 'View pricing plans', href: '/pricing' },
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
      { label: 'About', ariaLabel: 'About FakeVerifier', href: '/about' },
      { label: 'Contact', ariaLabel: 'Contact us', href: '/contact' },
    ],
  },
];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVerifyPage = pathname === '/verify';

  return (
    <>
      {!isVerifyPage && (
        <CardNav 
          logo={'/Images/Fakeverifier-official-logo.png'} 
          logoAlt="FakeVerifier Official Logo" 
          items={items} 
          baseColor={'var(--card)'} 
          menuColor={'var(--foreground)'} 
          buttonBgColor={'var(--primary)'} 
          buttonTextColor={'var(--primary-foreground)'} 
          ease="power3.out" 
        />
      )}
      {children}
      {!isVerifyPage && <UiFooter />}
    </>
  );
}

