"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AI_Prompt } from "@/components/ui/animated-ai-input"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamically import shader components with SSR disabled
const MeshGradient = dynamic(() => import("@paper-design/shaders-react").then(mod => ({ default: mod.MeshGradient })), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-800 to-slate-900" />
})

const PulsingBorder = dynamic(() => import("@paper-design/shaders-react").then(mod => ({ default: mod.PulsingBorder })), { 
  ssr: false 
})

export default function ShaderHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)
  const router = useRouter()

  const handleVerify = (inputText: string, model?: string, imageFiles?: File[]) => {
    if (!inputText.trim()) return;
    
    // Store the input, model, and image files in sessionStorage to pass it to the verify page
    sessionStorage.setItem('pendingVerification', JSON.stringify({
      input: inputText,
      model: model || 'GPT-4-1 Mini',
      imageFiles: imageFiles ? Array.from(imageFiles).map(file => file.name) : []
    }));
    
    // Navigate to the verify page
    router.push('/verify');
  };

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: 'var(--background)' }}>
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#ffffff", "#3b82f6", "#1e40af", "#1e293b", "#0f172a", "#3b82f6", "#ffffff"]}
        speed={0.3}
      />

      <div className="relative z-10 container mx-auto px-4 py-32 sm:px-6 lg:px-8 lg:py-40 mt-16">
        <div className="mx-auto max-w-5xl">

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sans text-center text-4xl tracking-tighter text-balance sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              color: 'white'
            }}
          >
            Verify claims with AI, evidence and confidence
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sans mx-auto mt-6 max-w-2xl text-center text-lg"
            style={{ 
              color: 'white'
            }}
          >
            Paste a URL or text and get a clear verdict with citations and a shareable report.
            Our AI-powered verification system analyzes content against multiple sources to provide
            accurate, evidence-based results.
          </motion.p>

          {/* AI Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10"
          >
            <AI_Prompt onSend={handleVerify} className="mx-auto" />
          </motion.div>

          {/* Additional spacing at bottom */}
          <div className="mt-16"></div>
        </div>
      </div>

    </div>
  )
}
