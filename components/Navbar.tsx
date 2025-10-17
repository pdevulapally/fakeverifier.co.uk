'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const linkCls = (p: string) => `px-4 py-2 rounded-lg text-sm font-medium ${pathname === p ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`;
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">FakeVerifier</Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className={linkCls('/')}>Home</Link>
          <Link href="/verify" className={linkCls('/verify')}>Verify</Link>
          <Link href="/history" className={linkCls('/history')}>History</Link>
        </nav>
      </div>
    </header>
  );
}


