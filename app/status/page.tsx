'use client';

import { useEffect, useState } from 'react';

export default function StatusPage() {
  const [iframeHeight, setIframeHeight] = useState('100vh');

  useEffect(() => {
    // Adjust iframe height based on viewport
    const updateHeight = () => {
      const vh = window.innerHeight;
      setIframeHeight(`${vh}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="w-full h-screen">
        <iframe
          src="https://statuspage.incident.io/fakeverifier"
          title="FakeVerifier System Status"
          className="w-full h-full border-0"
          style={{ 
            minHeight: iframeHeight,
            display: 'block'
          }}
          allow="fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
}
