'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    } else {
      const preferences = JSON.parse(cookieConsent);
      setCookiePreferences(preferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    setCookiePreferences(onlyEssential);
    localStorage.setItem('cookieConsent', JSON.stringify(onlyEssential));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(cookiePreferences));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
      <div 
        className="max-w-6xl mx-auto rounded-2xl shadow-2xl border-2 backdrop-blur-xl"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        {!showSettings ? (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg" style={{ color: 'var(--foreground)' }}>
                    Cookie Preferences
                  </h3>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm sm:text-base mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies.{' '}
                  <Link 
                    href="/cookie" 
                    className="underline font-medium hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--primary)' }}
                  >
                    Learn more
                  </Link>
                </p>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-opacity-10 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleCustomize}
                className="px-4 py-2 rounded-lg border font-medium transition-all hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  background: 'transparent',
                }}
              >
                <Settings className="w-4 h-4 inline-block mr-2" />
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 rounded-lg border font-medium transition-all hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  background: 'transparent',
                }}
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 shadow-lg"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg sm:text-xl" style={{ color: 'var(--foreground)' }}>
                Cookie Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-opacity-10 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--foreground)' }}>Essential Cookies</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Required for the website to function properly
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-opacity-20" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                    Always Active
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold" style={{ color: 'var(--foreground)' }}>Analytics Cookies</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Help us understand how visitors interact with our website
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={cookiePreferences.analytics}
                      onChange={(e) => setCookiePreferences({ ...cookiePreferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div 
                      className="w-11 h-6 rounded-full peer transition-colors duration-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        background: cookiePreferences.analytics ? 'var(--primary)' : 'var(--muted)',
                      }}
                    ></div>
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold" style={{ color: 'var(--foreground)' }}>Marketing Cookies</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Used to deliver personalized advertisements and track campaign performance
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={cookiePreferences.marketing}
                      onChange={(e) => setCookiePreferences({ ...cookiePreferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div 
                      className="w-11 h-6 rounded-full peer transition-colors duration-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        background: cookiePreferences.marketing ? 'var(--primary)' : 'var(--muted)',
                      }}
                    ></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg border font-medium transition-all hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  background: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 shadow-lg flex-1 sm:flex-initial"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

