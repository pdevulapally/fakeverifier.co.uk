"use client";

import { ArrowRight, Bot, Check, ChevronDown, Paperclip } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }
            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

const OPENAI_ICON = (
    <>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 256 260"
            aria-label="OpenAI Icon"
            className="w-4 h-4 dark:hidden block"
        >
      <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Z" />
        </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 256 260"
            aria-label="OpenAI Icon"
            className="w-4 h-4 hidden dark:block"
        >
            <path
                fill="#fff"
        d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Z"
            />
        </svg>
    </>
);

interface AI_PromptProps {
    onSend?: (inputText: string, model?: string, imageFiles?: File[]) => void;
    placeholder?: string;
    className?: string;
}

export function AI_Prompt({
  onSend,
  placeholder = "What can I do for you?",
  className,
}: AI_PromptProps) {
    const [value, setValue] = useState("");
    const [selectedModel, setSelectedModel] = useState("gpt-4o");
    const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const { user } = useAuth();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 72, maxHeight: 300 });

  // Fetch user plan dynamically
  useEffect(() => {
    let active = true;
    const load = () => {
      if (!user?.uid) return;
      fetch(`/api/user-tokens?uid=${user.uid}&t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => {
          if (active) setUserPlan(j.plan || "free");
        })
        .catch(() => {
          if (active) setUserPlan("free");
        });
    };
    load();
    const onFocus = () => load();
    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onVisibility);
    };
    }, [user?.uid]);

  // Dynamic AI models per plan
    const getAvailableModels = () => {
        switch (userPlan) {
      case "pro":
      case "enterprise":
        return ["fakeverifier-agent", "claude-3-5-sonnet-latest"];
      case "free":
            default:
        return ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];
        }
    };

    const AI_MODELS = getAvailableModels();

  // Only auto-set model if not manually changed
  useEffect(() => {
    setSelectedModel((prev) => {
      if (prev) return prev;
      if (userPlan === "pro" || userPlan === "enterprise") return "fakeverifier-agent";
      return "gpt-4o";
    });
  }, [userPlan]);

  // Save selection persistently (client-side only)
  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedModel", model);
    }
  };

    const handleSend = async () => {
        if (!value.trim() || loading) return;
        setLoading(true);
        try {
      if (onSend) await onSend(value.trim(), selectedModel, imageFiles);
            setValue("");
            setUploadedImages([]);
            setImageFiles([]);
            adjustHeight(true);
        } catch (error) {
      console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && value.trim() && !loading) {
            e.preventDefault();
            handleSend();
        }
    };

  const MODEL_NAMES: Record<string, string> = {
    "fakeverifier-agent": "FakeVerifier Agent Builder",
    "claude-3-5-sonnet-latest": "Claude 3.5 Sonnet",
    "gpt-4o": "ChatGPT 4o",
    "gpt-4-turbo": "GPT-4 Turbo",
    "gpt-3.5-turbo": "GPT-3.5 Turbo",
    };

  const MODEL_ICONS: Record<string, React.ReactNode> = {
    "fakeverifier-agent": <Bot className="w-5 h-5 opacity-50" />,
    "claude-3-5-sonnet-latest": <img src="/Images/Claude_AI_logo.svg" alt="Claude" className="w-5 h-5" />,
    "gpt-4o": OPENAI_ICON,
    "gpt-4-turbo": OPENAI_ICON,
    "gpt-3.5-turbo": OPENAI_ICON,
    };

    return (
    <div className={`w-full max-w-4xl py-2 sm:py-4 ${className || ""}`}>
            <div className="bg-white dark:bg-white/5 rounded-2xl p-1 sm:p-1.5 border border-gray-200 dark:border-white/10">
                <div className="relative">
                    <div className="relative flex flex-col">
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                            <Textarea
                id="ai-input"
                                value={value}
                                placeholder={placeholder}
                                className={cn(
                                    "w-full rounded-xl rounded-b-none px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[60px] sm:min-h-[72px] text-sm sm:text-base"
                                )}
                                ref={textareaRef}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                            />
                        </div>

                        <div className="h-12 sm:h-14 bg-white dark:bg-white/5 rounded-b-xl flex items-center border-t border-gray-200 dark:border-white/10">
                            <div className="absolute left-2 sm:left-3 right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center justify-between w-[calc(100%-16px)] sm:w-[calc(100%-24px)]">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex items-center gap-1 h-7 sm:h-8 pl-1 pr-1 sm:pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedModel}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                                                        className="flex items-center gap-1"
                                                    >
                            {MODEL_ICONS[selectedModel] || OPENAI_ICON}
                            <span className="truncate max-w-[80px] sm:max-w-[120px]">
                              {MODEL_NAMES[selectedModel] || selectedModel}
                            </span>
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            className={cn(
                                                "w-72 sm:w-80 p-3 sm:p-4",
                                                "border-black/10 dark:border-white/10",
                                                "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                                            )}
                                        >
                                            <div className="space-y-3">
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                    Choose AI Model
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {AI_MODELS.map((model) => (
                                                        <DropdownMenuItem
                                                            key={model}
                              onSelect={() => handleSelectModel(model)}
                                                            className={cn(
                                                                "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all",
                                                                "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
                                                                selectedModel === model 
                                                                    ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800" 
                                                                    : "border border-transparent"
                                                            )}
                                                        >
                                                            <div className="flex-shrink-0">
                                                                    {MODEL_ICONS[model] || <Bot className="w-5 h-5 opacity-50" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {MODEL_NAMES[model] || model}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    {model}
                                                                </div>
                                                            </div>
                                                            {selectedModel === model && (
                                                                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="h-3 sm:h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                    <label
                                        className={cn(
                                            "rounded-lg p-1.5 sm:p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                                        )}
                                        aria-label="Upload image"
                                    >
                    <input type="file" accept="image/*" multiple className="hidden" />
                                        <Paperclip className="w-3.5 sm:w-4 h-3.5 sm:h-4 transition-colors" />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded-lg p-1.5 sm:p-2 bg-black/5 dark:bg-white/5",
                                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                        loading && "opacity-50 cursor-not-allowed"
                                    )}
                                    aria-label="Send message"
                                    disabled={!value.trim() || loading}
                                    onClick={handleSend}
                                >
                                    {loading ? (
                                        <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ArrowRight
                                            className={cn(
                                                "w-3.5 sm:w-4 h-3.5 sm:h-4 dark:text-white transition-opacity duration-200",
                        value.trim() ? "opacity-100" : "opacity-30"
                                            )}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-2 sm:mt-3 text-center px-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    FakeVerifier can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
}
