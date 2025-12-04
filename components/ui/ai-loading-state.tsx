"use client";

/**
 * @description: AI Loading State for FakeVerifier
 * @version: 1.0.0
 */

import { useEffect, useState, useRef } from "react";

const TASK_SEQUENCES = [
  {
    status: "Searching the web",
    lines: [
      "Initializing web search...",
      "Scanning web pages...",
      "Visiting trusted sources...",
      "Analyzing content...",
      "Gathering evidence...",
      "Cross-referencing information...",
      "Verifying sources...",
      "Compiling findings...",
    ],
  },
  {
    status: "Analyzing results",
    lines: [
      "Analyzing search results...",
      "Checking factuality...",
      "Identifying claims...",
      "Evaluating credibility...",
      "Comparing with known facts...",
      "Detecting misinformation...",
      "Assessing source reliability...",
      "Generating verification report...",
    ],
  },
  {
    status: "Verifying authenticity",
    lines: [
      "Cross-checking information...",
      "Validating claims...",
      "Reviewing evidence...",
      "Assessing accuracy...",
      "Checking for contradictions...",
      "Evaluating source quality...",
      "Finalizing verification...",
      "Preparing response...",
    ],
  },
];

const LoadingAnimation = ({ progress }: { progress: number }) => (
  <div className="relative w-6 h-6">
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label={`Loading progress: ${Math.round(progress)}%`}
    >
      <title>Loading Progress Indicator</title>

      <defs>
        <mask id="progress-mask">
          <rect width="240" height="240" fill="black" />
          <circle
            r="120"
            cx="120"
            cy="120"
            fill="white"
            strokeDasharray={`${(progress / 100) * 754}, 754`}
            transform="rotate(-90 120 120)"
          />
        </mask>
      </defs>

      <style>
        {`
          @keyframes rotate-cw {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes rotate-ccw {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .g-spin circle {
            transform-origin: 120px 120px;
          }
          .g-spin circle:nth-child(1) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(2) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(3) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(4) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(5) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(6) { animation: rotate-ccw 8s linear infinite; }

          .g-spin circle:nth-child(2n) { animation-delay: 0.2s; }
          .g-spin circle:nth-child(3n) { animation-delay: 0.3s; }
        `}
      </style>

      <g
        className="g-spin"
        strokeWidth="16"
        strokeDasharray="18% 40%"
        mask="url(#progress-mask)"
      >
        <circle
          r="150"
          cx="120"
          cy="120"
          stroke="currentColor"
          opacity="0.95"
          style={{ color: 'var(--primary)' }}
        />
        <circle
          r="130"
          cx="120"
          cy="120"
          stroke="currentColor"
          opacity="0.85"
          style={{ color: 'var(--primary)' }}
        />
        <circle
          r="110"
          cx="120"
          cy="120"
          stroke="currentColor"
          opacity="0.75"
          style={{ color: 'var(--primary)' }}
        />
        <circle
          r="90"
          cx="120"
          cy="120"
          stroke="currentColor"
          opacity="0.65"
          style={{ color: 'var(--primary)' }}
        />
        <circle
          r="70"
          cx="120"
          cy="120"
          stroke="currentColor"
          opacity="0.55"
          style={{ color: 'var(--primary)' }}
        />
        <circle
          r="50"
          cx="120"
          cy="120"
          stroke="currentColor"
          opacity="0.45"
          style={{ color: 'var(--primary)' }}
        />
      </g>
    </svg>
  </div>
);

export default function AILoadingState() {
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState<
    Array<{ text: string; number: number }>
  >([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const lineHeight = 28;

  const currentSequence = TASK_SEQUENCES[sequenceIndex];
  const totalLines = currentSequence.lines.length;

  useEffect(() => {
    const initialLines = [];
    for (let i = 0; i < Math.min(5, totalLines); i++) {
      initialLines.push({
        text: currentSequence.lines[i],
        number: i + 1,
      });
    }
    setVisibleLines(initialLines);
    setScrollPosition(0);
  }, [sequenceIndex, currentSequence.lines, totalLines]);

  // Handle line advancement
  useEffect(() => {
    const advanceTimer = setInterval(() => {
      // Get the current first visible line index
      const firstVisibleLineIndex = Math.floor(
        scrollPosition / lineHeight
      );
      const nextLineIndex = (firstVisibleLineIndex + 3) % totalLines;

      // If we're about to wrap around, move to next sequence
      if (nextLineIndex < firstVisibleLineIndex && nextLineIndex !== 0) {
        setSequenceIndex(
          (prevIndex) => (prevIndex + 1) % TASK_SEQUENCES.length
        );
        return;
      }

      // Add the next line if needed
      if (
        nextLineIndex >= visibleLines.length &&
        nextLineIndex < totalLines
      ) {
        setVisibleLines((prevLines) => [
          ...prevLines,
          {
            text: currentSequence.lines[nextLineIndex],
            number: nextLineIndex + 1,
          },
        ]);
      }

      // Scroll to the next line
      setScrollPosition((prevPosition) => prevPosition + lineHeight);
    }, 2000);

    return () => clearInterval(advanceTimer);
  }, [
    scrollPosition,
    visibleLines,
    totalLines,
    sequenceIndex,
    currentSequence.lines,
    lineHeight,
  ]);

  // Apply scroll position
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className="flex items-start w-full">
      <div className="space-y-3 w-full">
        <div className="flex items-center space-x-2 text-gray-600 font-medium">
          <LoadingAnimation
            progress={(sequenceIndex / TASK_SEQUENCES.length) * 100}
          />
          <span className="text-sm">{currentSequence.status}...</span>
        </div>

        <div className="relative">
          <div
            ref={codeContainerRef}
            className="font-mono text-xs overflow-hidden w-full h-[84px] relative rounded-lg"
            style={{ scrollBehavior: "smooth" }}
          >
            <div>
              {visibleLines.map((line, index) => (
                <div
                  key={`${line.number}-${line.text}`}
                  className="flex h-[28px] items-center px-2"
                >
                  <div className="text-gray-400 pr-3 select-none w-6 text-right">
                    {line.number}
                  </div>

                  <div className="text-gray-800 flex-1 ml-1">
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none rounded-lg"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 30%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

