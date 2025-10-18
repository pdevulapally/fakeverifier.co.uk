"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";

export type TimelineEvent = {
  id: string;
  stage: "search" | "reading" | "analyzing" | "verdict";
  message: string;
  timestamp: number;
};

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  const [lottieData, setLottieData] = useState(null);

  useEffect(() => {
    // Skip loading Lottie animation for now due to corrupted file
    // TODO: Replace with proper Lottie JSON file
    console.log('Lottie animation disabled - file is corrupted (ZIP format)');
  }, []);

  return (
    <div className="mt-3 space-y-2">
      <AnimatePresence initial={false}>
        {events.map((e) => (
          <motion.div
            key={e.id + e.timestamp}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
          >
            <span className="mr-2 flex items-center">
              {e.stage === 'search' && (
                <img 
                  src="/Images/world-wide-web.png" 
                  alt="Searching" 
                  className="w-5 h-5 animate-bounce"
                />
              )}
              {e.stage === 'reading' && (
                <img 
                  src="/Images/search.png" 
                  alt="Reading sources" 
                  className="w-5 h-5 animate-pulse"
                />
              )}
              {e.stage === 'analyzing' && (
                <div className="w-5 h-5 flex items-center justify-center">
                  {lottieData ? (
                    <Lottie 
                      animationData={lottieData}
                      loop={true}
                      autoplay={true}
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              )}
              {e.stage === 'verdict' && '✅'}
            </span>
            <span>{e.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


