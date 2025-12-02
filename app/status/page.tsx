'use client';

import { useEffect } from 'react';

export default function StatusPage() {
  useEffect(() => {
    // Redirect to the status page since it cannot be embedded due to CSP
    window.location.href = 'https://statuspage.incident.io/fakeverifier';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Redirecting to Status Page...
        </h1>
        <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
          If you are not redirected automatically, please click the link below.
        </p>
        <a
          href="https://statuspage.incident.io/fakeverifier"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          Open Status Page
        </a>
      </div>
    </div>
  );
}
