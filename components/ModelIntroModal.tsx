import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, Zap, ArrowRight, ChevronRight } from 'lucide-react';

interface ModelIntroModalProps {
  storageKey?: string;
}

const ModelIntroModal: React.FC<ModelIntroModalProps> = ({ storageKey = 'fv_model_intro_seen' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    try {
      const seen = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : '1';
      if (!seen) setIsOpen(true);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    try { window.localStorage.setItem(storageKey, '1'); } catch {}
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleLearnMore = () => {
    window.location.href = '/docs/fakeverifier-model';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop with blur effect */}
      <div
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden transition-all duration-500 ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Solid Border Wrapper (keeps accent border but no see-through content) */}
        <div className="relative rounded-2xl border border-border shadow-2xl">
          <div className="relative rounded-2xl overflow-hidden bg-white text-gray-900 dark:bg-neutral-900 dark:text-white">

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/80 hover:bg-muted transition-all duration-200 hover:scale-110 active:scale-95 group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            {/* Content */}
            <div className="relative px-6 py-8 sm:px-10 sm:py-12 md:px-14 md:py-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
              {/* Header Section */}
              <div className="text-center mb-8 sm:mb-10">
                {/* Brand Logo */}
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 mb-6 shadow-sm border border-border overflow-hidden">
                  <img
                    src="/Images/Fakeverifier-official-logo.png"
                    alt="FakeVerifier Official Logo"
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  />
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight text-foreground">
                  Introducing FakeVerifier
                </h2>

                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Next-generation AI model for detecting misinformation with unparalleled accuracy
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {/* Feature 1 */}
                <div className="group relative overflow-hidden rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-neutral-900">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">99.7% Accuracy</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Industry-leading precision in identifying fake content across multiple formats
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group relative overflow-hidden rounded-xl p-6 border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-neutral-900">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Real-time Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Instant verification powered by advanced neural networks and ML algorithms
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group relative overflow-hidden rounded-xl p-6 border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 sm:col-span-3 md:col-span-1 bg-white dark:bg-neutral-900">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Text-First Verification</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Optimized for short claims, headlines, and social posts with clear verdict and confidence
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Section removed per request */}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  onClick={handleLearnMore}
                  className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-chart-3 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  Learn More
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-semibold text-base transition-all duration-300 hover:scale-105 active:scale-95 border border-border/50 hover:border-border"
                >
                  Get Started
                </button>
              </div>

              {/* Footer Note */}
              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Trusted by researchers, journalists, and organizations worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelIntroModal;