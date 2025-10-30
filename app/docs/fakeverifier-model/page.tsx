"use client";
import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Zap, Code, CheckCircle2, Info, Copy, Check, ArrowRight, Lightbulb } from 'lucide-react';

export default function FakeVerifierDocs() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Dynamic examples tailored to a text-first classification model
  const promptCategories: Record<string, string[]> = {
    Headlines: [
      '"NASA just confirmed water on Venus."',
      '"Scientists discover a new room-temperature superconductor."',
      '"The Moon will appear twice as big next week."'
    ],
    Health: [
      '"Drinking hot water cures COVID overnight."',
      '"A daily spoon of honey is better than vaccines."',
      '"5G towers cause headaches and fatigue."'
    ],
    Finance: [
      '"New law eliminates income tax starting next month."',
      '"This penny stock will 10x by Friday."',
      '"All student loans are forgiven immediately."'
    ],
    Elections: [
      '"Polling stations will close 2 hours early today."',
      '"Paper ballots have been banned in our state."',
      '"International observers found massive fraud yesterday."'
    ],
  };
  const categoryNames = Object.keys(promptCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryNames[0]);
  const examplePrompts = promptCategories[selectedCategory] || [];

  const features = [
    {
      icon: Shield,
      color: 'from-primary to-chart-3',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      title: 'Multi-Label Classification',
      description: 'Classifies input into Likely Real, Likely Fake, or Unverified with nuanced analysis'
    },
    {
      icon: Zap,
      color: 'from-chart-3 to-chart-4',
      bgColor: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
      title: 'Lightning Fast',
      description: 'Provides instant verification results optimized for real-time fact-checking'
    },
    {
      icon: CheckCircle2,
      color: 'from-chart-4 to-chart-5',
      bgColor: 'bg-chart-4/10',
      iconColor: 'text-chart-4',
      title: 'Confidence Scoring',
      description: 'Transparent confidence metrics to help you understand the reliability of results'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Open Verify Screen',
      description: 'Navigate to the verification interface and prepare your claim or text for analysis'
    },
    {
      number: '02',
      title: 'Input Your Claim',
      description: 'Paste a headline, quote, social post, or any short text you want to verify'
    },
    {
      number: '03',
      title: 'Get Results',
      description: 'Receive instant verdict with confidence score and detailed analysis'
    }
  ];

  const apiRequestCode = `POST https://api-inference.huggingface.co/models/<your-model>
Authorization: Bearer hf_xxx
Content-Type: application/json

{ "inputs": "Claim text here" }`;

  const apiResponseCode = `[
  { "label": "REAL", "score": 0.92 },
  { "label": "FAKE", "score": 0.06 }
]`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-chart-3/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-chart-5/5 rounded-full blur-3xl animate-pulse delay-500" />

      <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-chart-3 mb-6 sm:mb-8 shadow-2xl shadow-primary/30 animate-pulse">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-chart-3 to-chart-5 bg-clip-text text-transparent leading-tight">
            Introducing the FakeVerifier Model
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-foreground max-w-4xl mx-auto leading-relaxed">
            A cutting-edge Hugging Face-powered classification model that assesses claims, headlines, and social posts with unprecedented accuracy and speed.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 sm:mb-16 lg:mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 sm:p-8 border-2 border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <feature.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What it does Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border p-6 sm:p-8 lg:p-10 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center shadow-lg">
                  <Info className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">What It Does</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  'Classifies input into Likely Real, Likely Fake, or Unverified',
                  'Provides a confidence score for transparency',
                  'Designed for quick, everyday fact-checking'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors duration-300">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-base sm:text-lg text-foreground/90 leading-relaxed pt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How to Use</h2>
            <p className="text-base sm:text-lg text-foreground/80 max-w-2xl mx-auto">
              Get started with FakeVerifier in three simple steps
            </p>
          </div>

          {/* Category selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {categoryNames.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedCategory(name)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedCategory === name ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-muted'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border p-6 sm:p-8 h-full transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-br from-primary to-chart-3 bg-clip-text text-transparent mb-4 opacity-20">
                      {step.number}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Example Prompts Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Example Prompts</h2>
            <p className="text-base sm:text-lg text-foreground/80 max-w-2xl mx-auto">
              Try these sample claims to see FakeVerifier in action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {examplePrompts.map((prompt, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border p-6 transition-all duration-300 hover:border-chart-3/50 hover:shadow-xl hover:shadow-chart-3/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Code className="w-5 h-5 text-chart-3 flex-shrink-0 mt-1" />
                    <button
                      onClick={() => copyToClipboard(prompt, index)}
                      className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:scale-110 active:scale-95"
                      aria-label="Copy prompt"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-foreground/60" />
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-sm sm:text-base text-foreground/90 leading-relaxed break-words">
                    {prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Template Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border p-6 sm:p-8 lg:p-10 shadow-xl">
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Prompt Template</h2>
              <p className="text-base sm:text-lg text-foreground/90 mb-4 leading-relaxed">
                Use this layout when prompting the model. Replace bracketed sections with your content.
              </p>
              <div className="relative rounded-xl bg-muted/50 border border-border p-4 sm:p-6 overflow-x-auto custom-scrollbar">
                <pre className="text-xs sm:text-sm text-foreground/90 font-mono leading-relaxed whitespace-pre-wrap">
{`Claim:
[Paste the exact claim, headline, or short post]

Context (optional):
[Any brief background that helps interpret the claim]

Link (optional):
[URL to the source post/article]

Output style:
- Return a verdict: Likely Real / Likely Fake / Unverified
- Include a confidence percentage (0–100%)
- Keep it concise`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* API Usage Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border p-6 sm:p-8 lg:p-10 shadow-xl">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-chart-5/10 to-transparent rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-5 to-primary flex items-center justify-center shadow-lg">
                  <Code className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">API Usage</h2>
              </div>

              <p className="text-base sm:text-lg text-foreground/90 mb-2 leading-relaxed">
                Public API: coming soon
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                We’ll publish full integration instructions, SDK helpers, and rate-limit details here. In the meantime, the website already uses the model server-side.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-chart-3/20 to-chart-5/20 border-2 border-primary/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Lightbulb className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Coming Soon</h3>
              <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                A multi-evidence model with richer reasoning and source suggestions for even more comprehensive verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}