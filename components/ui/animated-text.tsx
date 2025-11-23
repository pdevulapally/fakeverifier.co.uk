"use client";

import { animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export function useAnimatedText(text: string, delimiter: string = "") {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const prevTextRef = useRef(text);
  const controlsRef = useRef<any>(null);

  // Handle text changes (including streaming updates)
  if (prevTextRef.current !== text) {
    const prevText = prevTextRef.current;
    // If new text is an extension of previous (streaming), continue from current cursor
    // Otherwise, reset to start
    if (text.startsWith(prevText) && cursor > 0) {
      // Streaming update - continue from where we were
      setStartingCursor(cursor);
    } else {
      // New message or significant change - reset
      setStartingCursor(0);
      setCursor(0);
    }
    prevTextRef.current = text;
  }

  useEffect(() => {
    // Stop any existing animation
    if (controlsRef.current) {
      controlsRef.current.stop();
    }

    if (!text) {
      setCursor(0);
      return;
    }

    const parts = text.split(delimiter);
    const totalParts = parts.length;
    
    // Calculate duration based on delimiter type and text length
    // For character animation (delimiter = ""), use faster speed for better UX
    const baseDuration = delimiter === "" ? Math.max(2, text.length * 0.01) : // Character: ~0.01s per char, min 2s
                    delimiter === " " ? Math.max(2, parts.length * 0.1) : // Word: ~0.1s per word, min 2s
                    Math.max(1, parts.length * 0.2); // Chunk: ~0.2s per chunk, min 1s
    
    const controls = animate(startingCursor, totalParts, {
      duration: baseDuration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    controlsRef.current = controls;

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, [startingCursor, text, delimiter]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}

