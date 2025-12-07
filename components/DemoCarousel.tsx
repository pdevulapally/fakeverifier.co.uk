'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Upload, Globe, Gavel, CheckCircle, Search, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Scenario {
  id: number;
  icon: string;
  category: string;
  title: string;
  input: string;
  verdict: 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNVERIFIED';
  confidence: number;
  summary: string;
  sources: number;
}

const scenarios: Scenario[] = [
  {
    id: 1,
    icon: '🌍',
    category: 'Science',
    title: 'Climate Claim',
    input: 'Global temperatures increased by 1.5°C since 1850',
    verdict: 'TRUE',
    confidence: 95,
    summary: 'Confirmed by NASA, NOAA, and multiple peer-reviewed climate studies',
    sources: 12,
  },
  {
    id: 2,
    icon: '💉',
    category: 'Health',
    title: 'Medical Fact',
    input: 'Vaccines contain microchips for tracking',
    verdict: 'FALSE',
    confidence: 99,
    summary: 'No evidence supports this claim. Thoroughly debunked by CDC and WHO',
    sources: 8,
  },
  {
    id: 3,
    icon: '💰',
    category: 'Economics',
    title: 'Financial Statement',
    input: 'U.S. unemployment rate dropped to 3.7% in Q4 2023',
    verdict: 'TRUE',
    confidence: 98,
    summary: 'Confirmed by Bureau of Labor Statistics official reports',
    sources: 6,
  },
  {
    id: 4,
    icon: '🚀',
    category: 'Technology',
    title: 'Tech News',
    input: 'SpaceX plans Mars colony by 2026',
    verdict: 'MISLEADING',
    confidence: 87,
    summary: 'SpaceX has ambitions for Mars, but 2026 timeline is not officially confirmed',
    sources: 15,
  },
];

const steps = [
  {
    icon: Upload,
    title: 'Ingest',
    description: 'Normalize input, expand URLs and extract top claims from your content',
    tag: 'Smart parsing',
  },
  {
    icon: Globe,
    title: 'Retrieve',
    description: 'Search web and news sources to extract clean text from top sources',
    tag: 'Multi-source research',
  },
  {
    icon: Gavel,
    title: 'Judge',
    description: 'Cross-check, weigh evidence, and output verdict with confidence score',
    tag: 'AI-powered analysis',
  },
];

const verdictColors = {
  TRUE: 'bg-green-500/20 text-green-600 border-green-500/30',
  FALSE: 'bg-red-500/20 text-red-600 border-red-500/30',
  MISLEADING: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  UNVERIFIED: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
};

export default function DemoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentScenario = scenarios[currentIndex];

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % scenarios.length);
  }, [isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + scenarios.length) % scenarios.length);
  }, [isAnimating]);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrev();

    setTouchStart(0);
    setTouchEnd(0);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="relative py-20 z-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="relative mx-auto max-w-3xl text-center mb-16">
          <h3 
            className="font-sans text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" 
            style={{ color: 'var(--foreground)' }}
          >
            See it in action
          </h3>
          <p 
            className="font-sans mt-3 text-lg" 
            style={{ color: 'var(--muted-foreground)' }}
          >
            Experience our AI verification process with real-world examples
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            disabled={isAnimating}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-12 w-12 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed lg:-translate-x-20"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--primary)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Previous scenario"
          >
            <ChevronLeft className="h-6 w-6 mx-auto" />
          </button>

          <button
            onClick={goToNext}
            disabled={isAnimating}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-12 w-12 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed lg:translate-x-20"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--primary)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Next scenario"
          >
            <ChevronRight className="h-6 w-6 mx-auto" />
          </button>

          {/* Carousel Slides */}
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="wait"
              onExitComplete={() => setIsAnimating(false)}
            >
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                onAnimationStart={() => setIsAnimating(true)}
                className="w-full"
              >
                {/* Scenario Card */}
                <div
                  className="relative mx-auto max-w-4xl rounded-3xl p-8 md:p-12 backdrop-blur-md"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 20px 80px -20px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Category Badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">{currentScenario.icon}</span>
                    <Badge
                      variant="outline"
                      className="font-sans text-sm px-3 py-1"
                      style={{
                        background: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {currentScenario.category}
                    </Badge>
                  </div>

                  {/* Input Field */}
                  <div className="mb-8">
                    <label
                      className="font-sans text-sm font-medium mb-3 block"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Claim to verify
                    </label>
                    <div
                      className="rounded-xl p-4 font-sans text-lg"
                      style={{
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    >
                      {currentScenario.input}
                    </div>
                  </div>

                  {/* Result Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="rounded-xl p-6 mb-8"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`font-sans text-2xl font-bold px-4 py-1.5 rounded-lg border ${
                              verdictColors[currentScenario.verdict]
                            }`}
                          >
                            {currentScenario.verdict}
                          </span>
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                            <span
                              className="font-sans text-sm font-medium"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              {currentScenario.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p
                      className="font-sans text-base mb-4"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {currentScenario.summary}
                    </p>

                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span
                        className="font-sans text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Analyzed {currentScenario.sources} sources
                      </span>
                    </div>
                  </motion.div>

                  {/* Step Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {steps.map((step, idx) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.5 + idx * 0.1,
                          duration: 0.5,
                          type: 'spring',
                          stiffness: 100,
                        }}
                        className="rounded-xl p-4 backdrop-blur-sm"
                        style={{
                          background: 'var(--background)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                          }}
                        >
                          <step.icon className="h-5 w-5" />
                        </div>
                        <h4
                          className="font-sans text-sm font-semibold mb-2"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {idx + 1}. {step.title}
                        </h4>
                        <p
                          className="font-sans text-xs mb-3"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {step.description}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                          <span
                            className="font-sans text-xs"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {step.tag}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {scenarios.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                disabled={isAnimating}
                className="h-2.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed"
                style={{
                  width: idx === currentIndex ? '32px' : '10px',
                  background: idx === currentIndex ? 'var(--primary)' : 'var(--border)',
                  opacity: idx === currentIndex ? 1 : 0.5,
                }}
                aria-label={`Go to scenario ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
