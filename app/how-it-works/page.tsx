"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Shield, 
  Zap, 
  FileText,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { AI_Prompt } from '@/components/ui/animated-ai-input';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { TimelineContent } from '@/components/ui/timeline-animation';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
}

const demoSteps: DemoStep[] = [
  {
    id: 'input',
    title: 'Enter Your Query',
    description: 'Type or paste the information you want to verify - news articles, claims, URLs, or any text.',
    icon: <Search className="h-6 w-6" />,
    duration: 2000,
  },
  {
    id: 'analyzing',
    title: 'AI Analysis',
    description: 'Our advanced AI models analyze your input, cross-referencing with multiple sources in real-time.',
    icon: <Sparkles className="h-6 w-6" />,
    duration: 3000,
  },
  {
    id: 'verification',
    title: 'Source Verification',
    description: 'The system searches the web, checks credibility, and gathers evidence from reliable sources.',
    icon: <Shield className="h-6 w-6" />,
    duration: 2500,
  },
  {
    id: 'result',
    title: 'Get Results',
    description: 'Receive a detailed verification report with confidence scores, sources, and evidence.',
    icon: <CheckCircle2 className="h-6 w-6" />,
    duration: 3000,
  },
];

interface DemoScenario {
  id: string;
  input: string;
  verdict: 'Real' | 'Fake' | 'Uncertain';
  confidence: number;
  emoji: string;
  description: string;
  sources: string[];
}

const demoScenarios: DemoScenario[] = [
  {
    id: 'scenario1',
    input: 'Breaking: Scientists discover new planet in our solar system',
    verdict: 'Real',
    confidence: 85,
    emoji: '🟩',
    description: 'This claim has been verified against multiple credible sources. The information appears to be accurate based on current evidence.',
    sources: ['NASA Official Website', 'Scientific Journal Publication', 'Verified News Outlet'],
  },
  {
    id: 'scenario2',
    input: 'Is it true that drinking 8 glasses of water daily is scientifically proven?',
    verdict: 'Uncertain',
    confidence: 65,
    emoji: '🟨',
    description: 'This claim has mixed evidence. While hydration is important, the specific "8 glasses" recommendation lacks strong scientific backing and varies by individual needs.',
    sources: ['Medical Research Journal', 'Health Organization Report', 'Nutrition Expert Analysis'],
  },
  {
    id: 'scenario3',
    input: 'Vaccines cause autism - this was proven by multiple studies',
    verdict: 'Fake',
    confidence: 95,
    emoji: '🟥',
    description: 'This claim has been thoroughly debunked by extensive scientific research. Multiple large-scale studies have found no link between vaccines and autism.',
    sources: ['CDC Official Statement', 'Peer-Reviewed Medical Studies', 'World Health Organization'],
  },
  {
    id: 'scenario4',
    input: 'The Earth is flat and NASA has been hiding this fact',
    verdict: 'Fake',
    confidence: 99,
    emoji: '🟥',
    description: 'This is a well-established conspiracy theory with no scientific basis. The Earth is demonstrably spherical, as proven by centuries of scientific evidence.',
    sources: ['NASA Official Documentation', 'Scientific Evidence Database', 'Astronomical Observations'],
  },
  {
    id: 'scenario5',
    input: 'What happened in the recent Southport attack?',
    verdict: 'Real',
    confidence: 90,
    emoji: '🟩',
    description: 'Verified information about the incident is available from official sources. The details have been confirmed by law enforcement and verified news outlets.',
    sources: ['Official Police Statement', 'Verified News Reports', 'Government Sources'],
  },
];

export default function HowItWorksPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on mount
  const [demoInput, setDemoInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<DemoScenario | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoPlayed = useRef(false);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: 30,
      opacity: 0,
    },
  };

  // Auto-start animation on mount with a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAutoPlayed.current) {
        hasAutoPlayed.current = true;
        setIsPlaying(true);
      }
    }, 500); // Small delay to ensure page is rendered

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPlaying && currentStep < demoSteps.length) {
      intervalRef.current = setTimeout(() => {
        const scenario = demoScenarios[currentScenario];
        
        if (currentStep === 0) {
          // Show input
          setDemoInput(scenario.input);
          setIsAnalyzing(false);
          setShowResult(false);
        } else if (currentStep === 1) {
          // Start analyzing
          setIsAnalyzing(true);
          setShowResult(false);
        } else if (currentStep === 2) {
          // Continue analyzing
          setIsAnalyzing(true);
          setShowResult(false);
        } else if (currentStep === 3) {
          // Show result
          setIsAnalyzing(false);
          setShowResult(true);
          setCurrentResult(scenario);
        }
        
        if (currentStep < demoSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Move to next scenario after showing result
          setTimeout(() => {
            const nextScenario = (currentScenario + 1) % demoScenarios.length;
            setCurrentScenario(nextScenario);
            setCurrentStep(0);
            setDemoInput('');
            setShowResult(false);
            setIsAnalyzing(false);
            setCurrentResult(null);
            setIsPlaying(true);
          }, 4000); // Show result for 4 seconds before next scenario
        }
      }, demoSteps[currentStep].duration);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, currentScenario]);

  const handlePlay = () => {
    if (currentStep === demoSteps.length - 1 && !isPlaying) {
      // Reset to first scenario
      setCurrentScenario(0);
      setCurrentStep(0);
      setDemoInput('');
      setShowResult(false);
      setIsAnalyzing(false);
      setCurrentResult(null);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentScenario(0);
    setCurrentStep(0);
    setDemoInput('');
    setShowResult(false);
    setIsAnalyzing(false);
    setCurrentResult(null);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ background: "var(--background)", color: "var(--foreground)" }}
      ref={pageRef}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl"
          style={{ 
            background: "radial-gradient(circle, var(--primary), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-20">
        {/* Header */}
        <TimelineContent
          animationNum={0}
          timelineRef={pageRef}
          customVariants={revealVariants}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">How It Works</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            See how FakeVerifier uses AI to verify information in seconds
          </p>
        </TimelineContent>

        {/* Interactive Demo Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Left: Demo Steps */}
          <TimelineContent
            animationNum={1}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <Card 
              className="p-8"
              style={{ 
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Step-by-Step Process</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Showing scenario {currentScenario + 1} of {demoScenarios.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePlay}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ 
                      background: isPlaying ? "var(--muted)" : "var(--primary)",
                      color: isPlaying ? "var(--foreground)" : "var(--primary-foreground)",
                    }}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ 
                      background: "var(--muted)",
                      color: "var(--foreground)",
                    }}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {demoSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      index === currentStep 
                        ? 'shadow-lg scale-105' 
                        : index < currentStep 
                          ? 'opacity-60' 
                          : 'opacity-40'
                    }`}
                    style={{
                      background: index === currentStep 
                        ? "linear-gradient(135deg, var(--primary), var(--primary))"
                        : "var(--muted)",
                      color: index === currentStep 
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                      borderColor: index === currentStep ? "var(--primary)" : "var(--border)",
                    }}
                    animate={{
                      scale: index === currentStep ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ 
                        background: index === currentStep 
                          ? "rgba(255,255,255,0.2)" 
                          : "var(--card)",
                      }}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold opacity-70">Step {index + 1}</span>
                          {index === currentStep && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full"
                              style={{ background: "var(--primary-foreground)" }}
                            />
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{step.title}</h3>
                        <p className="text-sm opacity-90">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TimelineContent>

          {/* Right: Interactive Demo */}
          <TimelineContent
            animationNum={2}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <Card 
              className="p-8"
              style={{ 
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Try It Live</h2>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Watch the verification process in action
                </p>
              </div>

              {/* Demo Input Area */}
              <div className="space-y-4">
                <div className="rounded-2xl border p-5" style={{ 
                  background: "var(--background)",
                  borderColor: "var(--border)",
                }}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <img 
                      src="/Images/Fakeverifier-official-logo.png" 
                      alt="FakeVerifier" 
                      className="h-5 w-auto" 
                    />
                    <span>Input</span>
                  </div>
                  <div className="min-h-[60px] p-3 rounded-lg" style={{ background: "var(--muted)" }}>
                    {demoInput ? (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm"
                      >
                        {demoInput}
                      </motion.p>
                    ) : (
                      <p className="text-sm opacity-50">Enter your query to see verification...</p>
                    )}
                  </div>
                </div>

                {/* Analyzing State */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl border p-5 overflow-hidden"
                      style={{ 
                        background: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <img 
                          src="/Images/Fakeverifier-official-logo.png" 
                          alt="FakeVerifier" 
                          className="h-5 w-auto" 
                        />
                        <CheckCircle2 className="h-4 w-4" style={{ color: "var(--primary)" }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <TextShimmer className='font-mono text-sm [--base-color:theme(colors.blue.600)] [--base-gradient-color:theme(colors.blue.300)]'>
                          Analyzing your input...
                        </TextShimmer>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result State */}
                <AnimatePresence mode="wait">
                  {showResult && currentResult && (
                    <motion.div
                      key={currentResult.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="rounded-2xl border p-5"
                      style={{ 
                        background: "var(--background)",
                        borderColor: currentResult.verdict === 'Real' 
                          ? "var(--primary)" 
                          : currentResult.verdict === 'Fake' 
                            ? "var(--destructive)" 
                            : "var(--muted-foreground)",
                      }}
                    >
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <img 
                          src="/Images/Fakeverifier-official-logo.png" 
                          alt="FakeVerifier" 
                          className="h-5 w-auto" 
                        />
                        <CheckCircle2 className="h-4 w-4" style={{ color: "var(--primary)" }} />
                        <span>Verification Complete</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="px-3 py-1 rounded-full text-xs font-semibold" 
                            style={{ 
                              background: currentResult.verdict === 'Real' 
                                ? "var(--primary)" 
                                : currentResult.verdict === 'Fake' 
                                  ? "var(--destructive)" 
                                  : "var(--muted-foreground)",
                              color: "var(--primary-foreground)",
                            }}
                          >
                            {currentResult.emoji} {currentResult.verdict}
                          </div>
                          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            Confidence: {currentResult.confidence}%
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                          {currentResult.description}
                        </p>
                        <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Sources:</p>
                          <div className="space-y-1">
                            {currentResult.sources.map((source, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-xs flex items-center gap-2"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                <FileText className="h-3 w-3" />
                                {source}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </TimelineContent>
        </div>

        {/* Features Section */}
        <TimelineContent
          animationNum={3}
          timelineRef={pageRef}
          customVariants={revealVariants}
        >
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Lightning Fast",
                  description: "Get verification results in seconds with our optimized AI pipeline.",
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "Multiple AI Models",
                  description: "Powered by FakeVerifier, Llama 3.3 70B, and GPT-OSS-20B for accurate results.",
                },
                {
                  icon: <FileText className="h-6 w-6" />,
                  title: "Source Citations",
                  description: "Every verification includes credible sources and evidence links.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card 
                    className="p-6 h-full"
                    style={{ 
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div 
                      className="p-3 rounded-xl mb-4 w-fit"
                      style={{ 
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TimelineContent>

        {/* CTA Section */}
        <TimelineContent
          animationNum={4}
          timelineRef={pageRef}
          customVariants={revealVariants}
        >
          <Card 
            className="p-10 md:p-12 text-center relative overflow-hidden"
            style={{ 
              background: "linear-gradient(135deg, var(--card) 0%, var(--muted) 50%, var(--card) 100%)",
              borderColor: "var(--primary)",
              borderWidth: "2px",
            }}
          >
            <div 
              className="absolute inset-0 opacity-10"
              style={{ 
                background: "radial-gradient(circle at center, var(--primary), transparent)",
              }}
            />
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div 
                  className="p-4 rounded-full"
                  style={{ 
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <Sparkles className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Verify Information?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
                Start using FakeVerifier today to verify news, claims, and information with AI-powered accuracy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/verify"
                  className="group px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  style={{ 
                    background: "var(--primary)", 
                    color: "var(--primary-foreground)",
                    boxShadow: "0 10px 40px -10px var(--primary)",
                  }}
                >
                  Start Verifying
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 border-2 hover:scale-105"
                  style={{ 
                    borderColor: "var(--border)", 
                    color: "var(--foreground)",
                    background: "var(--card)",
                  }}
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </Card>
        </TimelineContent>
      </div>
    </div>
  );
}

