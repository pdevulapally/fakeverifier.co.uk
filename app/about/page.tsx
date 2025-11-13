"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle, GraduationCap, Lightbulb, Shield, Target, Users, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import Link from "next/link";

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ background: "var(--background)", color: "var(--foreground)" }}
      ref={pageRef}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{ 
            background: "radial-gradient(circle, var(--primary), transparent)",
          }}
        />
        <SparklesComp
          density={1000}
          speed={0.5}
          color="var(--primary)"
          className="absolute inset-0 opacity-30"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-40 pb-20">
        {/* Hero Section with Creator Image */}
        <TimelineContent
          animationNum={0}
          timelineRef={pageRef}
          customVariants={revealVariants}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-50"
                style={{ background: "var(--primary)" }}
              />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/407336793_6833926710054844_1424313180351365942_n.jpg-rQyDcOudtZtxVEZqeJi8Mc7L8a1owU.jpeg"
                alt="Preetham Devulapally"
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 mx-auto"
                style={{ borderColor: "var(--primary)" }}
              />
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.1}
              staggerFrom="first"
              containerClassName="justify-center"
            >
              About FakeVerifier
            </VerticalCutReveal>
          </h1>
          
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Our mission to combat misinformation and build a more informed world
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-2" style={{ color: "var(--muted-foreground)" }}>
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm">Created by <a href="https://preetham-devulapally.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline transition-all" style={{ color: "var(--primary)" }}>Preetham Devulapally</a> | University of Westminster</span>
          </div>
        </TimelineContent>

        {/* Main Story Sections */}
        <div className="space-y-8">
          {/* Understanding Fake News */}
          <TimelineContent
            animationNum={1}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <Card 
              className="p-8 md:p-10 group hover:shadow-2xl transition-all duration-500"
              style={{ 
                background: "linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)",
                borderColor: "var(--border)",
              }}
            >
              <motion.div 
                className="flex flex-col md:flex-row items-start gap-6"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  className="p-4 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    background: "linear-gradient(135deg, var(--primary), var(--primary))",
                    boxShadow: "0 10px 40px -10px var(--primary)",
                  }}
                >
                  <AlertTriangle className="h-8 w-8" style={{ color: "var(--primary-foreground)" }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">Understanding Fake News</h2>
                  <p className="text-lg leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>
                    Fake news has become a critical challenge in today's digital age, spreading rapidly through social media and online platforms. 
                    The consequences are far-reaching, affecting public opinion, social cohesion, and even public safety.
                  </p>
                  <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    Following tragic events like the Southport attack, the need for reliable, automated verification systems has never been more urgent.
                  </p>
                </div>
              </motion.div>
            </Card>
          </TimelineContent>

          {/* The Journey Begins */}
          <TimelineContent
            animationNum={2}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <Card 
              className="p-8 md:p-10 group hover:shadow-2xl transition-all duration-500"
              style={{ 
                background: "linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)",
                borderColor: "var(--border)",
              }}
            >
              <motion.div 
                className="flex flex-col md:flex-row items-start gap-6"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  className="p-4 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    background: "linear-gradient(135deg, var(--primary), var(--primary))",
                    boxShadow: "0 10px 40px -10px var(--primary)",
                  }}
                >
                  <GraduationCap className="h-8 w-8" style={{ color: "var(--primary-foreground)" }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">The Journey Begins</h2>
                  <p className="text-lg leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>
                    The journey of FakeVerifier started as a final year project at the University of Westminster, created by 
                    <a href="https://preetham-devulapally.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline transition-all ml-1" style={{ color: "var(--primary)" }}>Preetham Devulapally</a>. 
                    What began as an academic endeavor quickly evolved into something much more significant—a tool designed to address 
                    real-world problems with real-world consequences.
                  </p>
                  <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    As a student project, FakeVerifier represented the intersection of academic learning and practical application, 
                    demonstrating how technology can be harnessed to serve the greater good and protect communities from the harmful 
                    effects of misinformation.
                  </p>
                </div>
              </motion.div>
            </Card>
          </TimelineContent>

          {/* The Inspiration */}
          <TimelineContent
            animationNum={3}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <Card 
              className="p-8 md:p-10 group hover:shadow-2xl transition-all duration-500"
              style={{ 
                background: "linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)",
                borderColor: "var(--border)",
              }}
            >
              <motion.div 
                className="flex flex-col md:flex-row items-start gap-6"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  className="p-4 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    background: "linear-gradient(135deg, var(--primary), var(--primary))",
                    boxShadow: "0 10px 40px -10px var(--primary)",
                  }}
                >
                  <Lightbulb className="h-8 w-8" style={{ color: "var(--primary-foreground)" }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">The Real-World Inspiration</h2>
                  <p className="text-lg leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>
                    The inspiration for FakeVerifier came from a real-world scenario in the UK that highlighted the devastating impact 
                    of misinformation. Following the tragic Southport attack, false information spread rapidly across social media, 
                    falsely claiming that the attacker was a black immigrant. This misinformation led to national riots, causing 
                    significant social unrest and harm to communities.
                  </p>
                  <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    This incident served as a stark reminder of how quickly false information can spread and the real-world consequences 
                    it can have. It became clear that automated systems were needed to help verify information before it could cause 
                    widespread harm and division.
                  </p>
                </div>
              </motion.div>
            </Card>
          </TimelineContent>

          {/* The Mission */}
          <TimelineContent
            animationNum={4}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <Card 
              className="p-8 md:p-10 group hover:shadow-2xl transition-all duration-500"
              style={{ 
                background: "linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)",
                borderColor: "var(--border)",
              }}
            >
              <motion.div 
                className="flex flex-col md:flex-row items-start gap-6"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  className="p-4 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    background: "linear-gradient(135deg, var(--primary), var(--primary))",
                    boxShadow: "0 10px 40px -10px var(--primary)",
                  }}
                >
                  <Target className="h-8 w-8" style={{ color: "var(--primary-foreground)" }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    FakeVerifier was created with a clear mission: to prevent misinformation from spreading and causing harm. 
                    By providing automated fact-checking capabilities powered by advanced AI models, we aim to help individuals, 
                    organizations, and communities verify information quickly and accurately before sharing it.
                  </p>
                </div>
              </motion.div>
            </Card>
          </TimelineContent>

          {/* Values */}
          <TimelineContent
            animationNum={5}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <div className="mt-16">
              <h2 className="text-4xl font-bold mb-12 text-center">
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={0.1}
                  staggerFrom="first"
                  containerClassName="justify-center"
                >
                  Our Core Values
                </VerticalCutReveal>
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Shield className="h-6 w-6" />,
                    title: "Accuracy",
                    description: "We prioritize accuracy and reliability in our verification process, using multiple AI models and real-time evidence to ensure the highest quality results.",
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: "Community Impact",
                    description: "We believe in protecting communities from the harmful effects of misinformation, helping to prevent social unrest and division caused by false information.",
                  },
                  {
                    icon: <Target className="h-6 w-6" />,
                    title: "Accessibility",
                    description: "We make fact-checking accessible to everyone, from individuals to enterprises, with free and affordable plans that ensure information verification is available to all.",
                  },
                ].map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <Card 
                      className="p-6 h-full group hover:shadow-xl transition-all duration-300"
                      style={{ 
                        background: "var(--card)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div 
                        className="p-3 rounded-xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300"
                        style={{ 
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                      <p className="text-base leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        {value.description}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TimelineContent>

          {/* Call to Action */}
          <TimelineContent
            animationNum={6}
            timelineRef={pageRef}
            customVariants={revealVariants}
          >
            <motion.div
              className="mt-20"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us in the Fight Against Misinformation</h2>
                  <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
                    Together, we can build a more informed and connected world. Start verifying information today and help prevent 
                    the spread of false news.
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
            </motion.div>
          </TimelineContent>
        </div>

        {/* Footer Note */}
        <TimelineContent
          animationNum={7}
          timelineRef={pageRef}
          customVariants={revealVariants}
        >
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full" style={{ background: "var(--muted)" }}>
              <GraduationCap className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Created by <a href="https://preetham-devulapally.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline transition-all" style={{ color: "var(--primary)" }}>Preetham Devulapally</a> | University of Westminster Final Year Project
              </p>
            </div>
          </div>
        </TimelineContent>
      </div>
    </div>
  );
}
