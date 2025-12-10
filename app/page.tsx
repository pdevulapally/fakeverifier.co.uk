'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, ExternalLink, Github, Shield, Search, CheckCircle, Zap, FileText, Users, Upload, Globe, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ShaderHero from '@/components/ui/hero';

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'AI-Powered Verification',
    desc: 'Advanced AI algorithms analyze claims against multiple sources to provide accurate, evidence-based verdicts.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Comprehensive Research',
    desc: 'Automatically searches web and news sources to cross-reference information and identify reliable evidence.',
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: 'Confidence Scoring',
    desc: 'Get clear confidence levels and detailed explanations for every verification decision we make.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightning Fast',
    desc: 'Get verification results in seconds, not hours. Our optimized system delivers quick and reliable analysis.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Detailed Reports',
    desc: 'Receive comprehensive reports with citations, sources, and shareable verification results.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Trusted by Professionals',
    desc: 'Used by journalists, researchers, and fact-checkers worldwide to verify information quickly and accurately.',
  },
];


export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <ShaderHero />
      <main className="mx-auto max-w-6xl px-4 pt-4 pb-16 relative">
        {/* Apply hero background to main content */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'radial-gradient(ellipse at center, var(--background) 0%, var(--background) 50%, var(--background) 100%)',
              opacity: 1
            }}
          ></div>
        </div>
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: 'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        ></div>

        <section id="features" className="relative py-14 relative z-10">
          <div className="mx-auto max-w-screen-xl px-4 md:px-8">
            <div className="relative mx-auto max-w-2xl sm:text-center">
              <div className="relative z-10">
                <h3 className="font-sans mt-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" style={{ color: 'var(--foreground)' }}>
                  Verify claims with confidence
                </h3>
                <p className="font-sans mt-3" style={{ color: 'var(--muted-foreground)' }}>
                  Our AI-powered verification system provides accurate, evidence-based results 
                  to help you distinguish fact from fiction in today's information landscape.
                </p>
              </div>
            </div>
            <hr className="mx-auto mt-5 h-px w-1/2" style={{ background: 'var(--border)' }} />
            <div className="relative mt-12">
              <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((item, idx) => (
                  <li
                    key={idx}
                    className="transform-gpu space-y-3 rounded-xl border backdrop-blur-sm p-4"
                    style={{ 
                      background: 'var(--card)', 
                      border: '1px solid var(--border)',
                      boxShadow: '0_-20px_80px_-20px_#ff7aa42f_inset'
                    }}
                  >
                    <div 
                      className="w-fit transform-gpu rounded-full border p-4"
                      style={{ 
                        color: 'var(--primary)',
                        border: '1px solid var(--border)',
                        boxShadow: '0_-20px_80px_-20px_#ff7aa43f_inset'
                      }}
                    >
                      {item.icon}
                    </div>
                    <h4 className="font-sans text-lg font-bold tracking-tighter" style={{ color: 'var(--foreground)' }}>
                      {item.title}
                    </h4>
                    <p className="font-sans" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section id="how-it-works" className="relative py-14 relative z-10">
          <div className="mx-auto max-w-screen-xl px-4 md:px-8">
            <div className="relative mx-auto max-w-2xl sm:text-center mb-12">
              <h3 className="font-sans mt-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" style={{ color: 'var(--foreground)' }}>
                How it works
              </h3>
              <p className="font-sans mt-3" style={{ color: 'var(--muted-foreground)' }}>
                Our three-step verification process ensures accurate, evidence-based results every time.
              </p>
            </div>
            
            <div className="mx-auto my-8 grid w-full max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-3">
              <div className="scale-in group visible cursor-pointer" style={{ transform: 'translateY(0px) scale(1)' }}>
                <div
                  className="relative transform overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl backdrop-blur-sm"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-sans text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                      Step 1: Ingest
                    </h3>
                    <p className="mb-4 font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Normalize input, expand URLs and extract top claims from your content.
                    </p>
                    <div className="flex items-center" style={{ color: 'var(--muted-foreground)' }}>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span className="font-sans text-xs">Smart content parsing</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="scale-in group visible cursor-pointer" style={{ transform: 'translateY(0px) scale(1)' }}>
                <div
                  className="relative transform overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl backdrop-blur-sm"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      <Globe className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-sans text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                      Step 2: Retrieve
                    </h3>
                    <p className="mb-4 font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Search web and news sources to extract clean text from top sources.
                    </p>
                    <div className="flex items-center" style={{ color: 'var(--muted-foreground)' }}>
                      <Search className="mr-1 h-4 w-4" />
                      <span className="font-sans text-xs">Multi-source research</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="scale-in group visible cursor-pointer" style={{ transform: 'translateY(0px) scale(1)' }}>
                <div
                  className="relative transform overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl backdrop-blur-sm"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      <Gavel className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-sans text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                      Step 3: Judge
                    </h3>
                    <p className="mb-4 font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Cross-check, weigh evidence, and output verdict with confidence score.
                    </p>
                    <div className="flex items-center" style={{ color: 'var(--muted-foreground)' }}>
                      <Shield className="mr-1 h-4 w-4" />
                      <span className="font-sans text-xs">AI-powered analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Premium CTA Section - Outside main container for full width */}
      <section className="relative py-20 w-full" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
        <div className="w-full px-4 md:px-8">
          <div className="relative text-center">
            <div className="relative z-10">
              <h2 className="font-sans text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl" style={{ color: 'white' }}>
                Ready to verify with confidence?
              </h2>
              <p className="font-sans mt-6 text-xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Join thousands of professionals who trust our AI-powered verification system
              </p>
              
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/verify">
                  <Button
                    size="lg"
                    className="font-sans group relative overflow-hidden rounded-full px-8 py-4 text-lg font-semibold shadow-2xl transition-all duration-500 hover:scale-105"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <span className="relative z-10 flex items-center">
                      Start Verifying Now
                      <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span 
                      className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)'
                      }}
                    ></span>
                  </Button>
                </Link>

                <a href="#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-sans group flex items-center gap-3 rounded-full px-8 py-4 text-lg font-medium backdrop-blur-md transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <ExternalLink className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    Learn More
                  </Button>
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                {[
                  { number: "99.7%", label: "Accuracy Rate" },
                  { number: "2.3s", label: "Average Response" },
                  { number: "50M+", label: "Sources Analyzed" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-sans text-3xl font-bold mb-2" style={{ color: 'white' }}>
                      {stat.number}
                    </div>
                    <div className="font-sans text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


