"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Custom Paperclip SVG Component
const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    fill="currentColor" 
    className={className} 
    viewBox="0 0 16 16"
  >
    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
  </svg>
);

// Types
export interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  uploadProgress?: number;
  abortController?: AbortController;
  textContent?: string;
  downloadURL?: string;
}

export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  logo?: string;
}

interface ChatInputProps {
  onSendMessage?: (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[],
    modelId: string
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  models?: ModelOption[];
  defaultModel?: string;
  onModelChange?: (modelId: string) => void;
  variant?: "default" | "hero" | "glassmorphism";
}

// Constants
const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PASTE_THRESHOLD = 200; // characters threshold for showing as pasted content

// Expose models based on plan: Free -> classifier only; Pro/Enterprise -> classifier + Llama chat
const getAvailableModels = (userPlan: string): ModelOption[] => {
  if (userPlan === "pro" || userPlan === "enterprise") {
    return [
      {
        id: "fakeverifier-hf",
        name: "FakeVerifier (Classifier)",
        description: "Short factual verdicts with confidence",
        badge: "Fast",
      },
      {
        id: "llama-hf-router",
        name: "Llama 3.1 (Chat)",
        description: "Conversational multilingual reasoning with evidence",
        badge: userPlan === "enterprise" ? "Enterprise" : "Pro",
        logo: "/Images/Meta_Platforms_logo.svg",
      },
    ];
  }
  return [
    {
      id: "fakeverifier-hf",
      name: "FakeVerifier (Classifier)",
      description: "Short factual verdicts with confidence",
      badge: "Recommended",
    },
  ];
};

// File type helpers
const getFileIcon = (type: string) => {
  if (type.startsWith("image/"))
    return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
  if (type.startsWith("video/"))
    return <Video className="h-5 w-5 text-muted-foreground" />;
  if (type.startsWith("audio/"))
    return <Music className="h-5 w-5 text-muted-foreground" />;
  if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
    return <Archive className="h-5 w-5 text-muted-foreground" />;
  return <FileText className="h-5 w-5 text-muted-foreground" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const getFileTypeLabel = (type: string): string => {
  const parts = type.split("/");
  let label = parts[parts.length - 1].toUpperCase();
  if (label.length > 7 && label.includes("-")) {
    // e.g. VND.OPENXMLFORMATS-OFFICEDOCUMENT...
    label = label.substring(0, label.indexOf("-"));
  }
  if (label.length > 10) {
    label = label.substring(0, 10) + "...";
  }
  return label;
};

// Helper function to check if a file is textual
const isTextualFile = (file: File): boolean => {
  const textualTypes = [
    "text/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const textualExtensions = [
    "txt",
    "pdf",
    "doc",
    "docx",
    "html",
    "htm",
  ];

  // Check MIME type
  const isTextualMimeType = textualTypes.some((type) =>
    file.type.toLowerCase().startsWith(type)
  );

  // Check file extension
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isTextualExtension = textualExtensions.includes(extension);

  return isTextualMimeType || isTextualExtension;
};

// Helper function to read file content as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// Helper function to get file extension for badge
const getFileExtension = (filename: string): string => {
  const extension = filename.split(".").pop()?.toUpperCase() || "FILE";
  return extension.length > 8 ? extension.substring(0, 8) + "..." : extension;
};

// Input validation function
const validateInput = (text: string): { isValid: boolean; error: string } => {
  // Check for repeated characters (more than 5 in a row)
  const repeatedCharPattern = /(.)\1{5,}/;
  if (repeatedCharPattern.test(text)) {
    return { isValid: false, error: "Please avoid repeated characters. Try pasting valid content instead." };
  }

  // Check for SQL injection patterns (more comprehensive)
  const sqlPatterns = [
    // SQL keywords (case insensitive, word boundaries)
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|TRUNCATE|GRANT|REVOKE)\b/i,
    // SQL injection patterns
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/i,
    /(\b(OR|AND)\s+".*"\s*=\s*".*")/i,
    /(UNION\s+SELECT)/i,
    /(DROP\s+TABLE)/i,
    /(INSERT\s+INTO)/i,
    /(UPDATE\s+SET)/i,
    /(DELETE\s+FROM)/i,
    /(SELECT\s+\*)/i,
    /(FROM\s+\w+)/i,
    /(WHERE\s+.*=.*)/i,
    /(VALUES\s*\(.*\))/i,
    // SQL injection with quotes and semicolons
    /(';.*--)/i,
    /(";.*--)/i,
    /(OR\s+1\s*=\s*1)/i,
    /(AND\s+1\s*=\s*1)/i,
    // Multiple statements
    /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER))/i,
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: "Code detected in your input. Please paste only text content for fact-checking." };
    }
  }

  // Check for JavaScript/HTML code patterns
  const codePatterns = [
    /<script[^>]*>/i,
    /<\/script>/i,
    /<iframe[^>]*>/i,
    /<\/iframe>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /function\s+\w+\s*\(/i,
    /var\s+\w+\s*=/i,
    /let\s+\w+\s*=/i,
    /const\s+\w+\s*=/i,
    /console\.log/i,
    /document\./i,
    /window\./i,
    /alert\s*\(/i,
    /eval\s*\(/i,
  ];
  
  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: "Script code detected. Please paste only plain text content for verification." };
    }
  }

  // Check for Python code patterns
  const pythonPatterns = [
    /def\s+\w+\s*\(/i,
    /import\s+\w+/i,
    /from\s+\w+\s+import/i,
    /print\s*\(/i,
    /if\s+__name__\s*==\s*['"]__main__['"]/i,
    /class\s+\w+/i,
    /try:/i,
    /except:/i,
    /finally:/i,
    /lambda\s+/i,
    /yield\s+/i,
    /async\s+def/i,
    /await\s+/i,
  ];
  
  for (const pattern of pythonPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: "Python code detected. Please paste only text content for fact-checking." };
    }
  }

  // Check for PHP code patterns
  const phpPatterns = [
    /<\?php/i,
    /<\?=/i,
    /<\?/i,
    /\$_GET/i,
    /\$_POST/i,
    /\$_SESSION/i,
    /\$_COOKIE/i,
    /\$_SERVER/i,
    /\$_FILES/i,
    /echo\s+/i,
    /print\s+/i,
    /include\s+/i,
    /require\s+/i,
    /mysql_/i,
    /mysqli_/i,
    /pdo_/i,
  ];
  
  for (const pattern of phpPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: "PHP code detected. Please paste only text content for verification." };
    }
  }

  // Check for shell command patterns
  const shellPatterns = [
    /\b(rm|rmdir|del|delete)\s+/i,
    /\b(ls|dir|cat|type)\s+/i,
    /\b(cd|chdir)\s+/i,
    /\b(mkdir|md)\s+/i,
    /\b(cp|copy|mv|move)\s+/i,
    /\b(grep|find|search)\s+/i,
    /\b(sudo|su|runas)\s+/i,
    /\b(chmod|chown|attrib)\s+/i,
    /\b(net|ping|tracert|nslookup)\s+/i,
    /\b(wget|curl|powershell)\s+/i,
    /\b(exec|system|shell_exec)\s*\(/i,
    /\b(passthru|proc_open)\s*\(/i,
    /\b(\.\/|\.\.\/|\/etc\/|\/bin\/|\/usr\/)/i,
  ];
  
  for (const pattern of shellPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: "System commands detected. Please paste only text content for fact-checking." };
    }
  }

  return { isValid: true, error: "" };
};

// File Preview Component
const FilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/");
  const isTextual = isTextualFile(file.file);

  // If it's a textual file, use the TextualFilePreviewCard
  if (isTextual) {
    return <TextualFilePreviewCard file={file} onRemove={onRemove} />;
  }

  return (
    <div
      className={cn(
        "relative group bg-card border w-fit border-border rounded-lg p-2 sm:p-3 size-[100px] sm:size-[125px] shadow-md flex-shrink-0 overflow-hidden",
        isImage ? "p-0" : "p-2 sm:p-3"
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3 size-[100px] sm:size-[125px] overflow-hidden">
        {isImage && file.preview ? (
          <div className="relative size-full rounded-md overflow-hidden bg-muted">
            <img
              src={file.preview || "/placeholder.svg"}
              alt={file.file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <></>
        )}
        {!isImage && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-card/80 from-transparent overflow-hidden">
                <p className="absolute bottom-2 left-2 capitalize text-card-foreground text-xs bg-primary text-primary-foreground border border-border px-2 py-1 rounded-md">
                  {getFileTypeLabel(file.type)}
                </p>
              </div>
              {file.uploadStatus === "uploading" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              )}
              {file.uploadStatus === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              )}
            </div>

            <p
              className="max-w-[90%] text-xs font-medium text-card-foreground truncate"
              title={file.file.name}
            >
              {file.file.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatFileSize(file.file.size)}
            </p>
          </div>
        )}
      </div>
      <Button
        size="icon"
        variant="outline"
        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Pasted Content Preview Component
const PastedContentCard: React.FC<{
  content: PastedContent;
  onRemove: (id: string) => void;
}> = ({ content, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewText = content.content.slice(0, 150);
  const needsTruncation = content.content.length > 150;

  return (
    <div className="bg-card border border-border relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-card-foreground whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {isExpanded || !needsTruncation ? content.content : previewText}
        {!isExpanded && needsTruncation && "..."}
      </div>
      {/* OVERLAY */}
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-card/80 from-transparent overflow-hidden">
        <p className="capitalize text-card-foreground text-xs bg-primary text-primary-foreground border border-border px-2 py-1 rounded-md">
          PASTED
        </p>
        {/* Actions */}
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => navigator.clipboard.writeText(content.content)}
            title="Copy content"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => onRemove(content.id)}
            title="Remove content"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Model Selector Component
const ModelSelectorDropdown: React.FC<{
  models: ModelOption[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}> = ({ models, selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModelData =
    models.find((m) => m.id === selectedModel) || models[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 sm:h-9 px-2 sm:px-2.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1.5 truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
          {selectedModelData.logo && (
            <img src={selectedModelData.logo} alt="model logo" className="h-4 w-4 object-contain" />
          )}
          <span className="truncate">{selectedModelData.name}</span>
        </span>
        <ChevronDown
          className={cn(
            "ml-1 h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 sm:w-72 bg-popover border border-border rounded-lg shadow-xl z-20 p-2">
          {models.map((model) => (
            <button
              key={model.id}
              className={cn(
                "w-full text-left p-2.5 rounded-md hover:bg-accent transition-colors flex items-center justify-between",
                model.id === selectedModel && "bg-accent"
              )}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  {model.logo && (
                    <img src={model.logo} alt="model logo" className="h-4 w-4 object-contain" />
                  )}
                  <span className="font-medium text-popover-foreground">
                    {model.name}
                  </span>
                  {model.badge && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                      {model.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {model.description}
                </p>
              </div>
              {model.id === selectedModel && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Textual File Preview Component
const TextualFilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewText = file.textContent?.slice(0, 150) || "";
  const needsTruncation = (file.textContent?.length || 0) > 150;
  const fileExtension = getFileExtension(file.file.name);

  return (
    <div className="bg-card border border-border relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-card-foreground whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {file.textContent ? (
          <>
            {isExpanded || !needsTruncation ? file.textContent : previewText}
            {!isExpanded && needsTruncation && "..."}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      {/* OVERLAY */}
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-card/80 from-transparent overflow-hidden">
        <p className="capitalize text-card-foreground text-xs bg-primary text-primary-foreground border border-border px-2 py-1 rounded-md">
          {fileExtension}
        </p>
        {/* Upload status indicator */}
        {file.uploadStatus === "uploading" && (
          <div className="absolute top-2 left-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          </div>
        )}
        {file.uploadStatus === "error" && (
          <div className="absolute top-2 left-2">
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          </div>
        )}
        {/* Actions */}
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          {file.textContent && (
            <Button
              size="icon"
              variant="outline"
              className="size-6"
              onClick={() =>
                navigator.clipboard.writeText(file.textContent || "")
              }
              title="Copy content"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => onRemove(file.id)}
            title="Remove file"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main ChatInput Component
const ClaudeChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "What can I help you verify today?",
  maxFiles = MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  acceptedFileTypes,
  models,
  defaultModel,
  onModelChange,
  variant = "default",
}) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const { user } = useAuth();

  // Get available models based on user plan
  const availableModels = models || getAvailableModels(userPlan);
  const [selectedModel, setSelectedModel] = useState(
    defaultModel || availableModels[0]?.id || ""
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user plan
  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/user-tokens?uid=${user.uid}&t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setUserPlan(j.plan || "free");
      })
      .catch(() => {
        setUserPlan("free");
      });
  }, [user?.uid]);

  // Update selected model when user plan changes
  useEffect(() => {
    const newModels = getAvailableModels(userPlan);
    const preferred = (userPlan === "pro" || userPlan === "enterprise")
      ? "llama-hf-router"
      : "fakeverifier-hf";
    const fallback = newModels[0]?.id || "fakeverifier-hf";
    const nextId = newModels.find(m => m.id === preferred)?.id || fallback;
    if (newModels.length > 0 && !newModels.find(m => m.id === selectedModel)) {
      setSelectedModel(nextId);
    }
  }, [userPlan, selectedModel]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight =
        Number.parseInt(getComputedStyle(textareaRef.current).maxHeight, 10) ||
        120;
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [message]);

  // Firebase storage upload function
  const uploadFileToFirebase = async (file: File): Promise<string> => {
    if (!user?.uid) throw new Error("User not authenticated");
    
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `uploads/${user.uid}/${fileId}-${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const currentFileCount = files.length;
      if (currentFileCount >= maxFiles) {
        alert(
          `Maximum ${maxFiles} files allowed. Please remove some files to add new ones.`
        );
        return;
      }

      const availableSlots = maxFiles - currentFileCount;
      const filesToAdd = Array.from(selectedFiles).slice(0, availableSlots);

      if (selectedFiles.length > availableSlots) {
        alert(
          `You can only add ${availableSlots} more file(s). ${
            selectedFiles.length - availableSlots
          } file(s) were not added.`
        );
      }

      const newFiles = filesToAdd
        .filter((file) => {
          if (file.size > maxFileSize) {
            alert(
              `File ${file.name} (${formatFileSize(
                file.size
              )}) exceeds size limit of ${formatFileSize(maxFileSize)}.`
            );
            return false;
          }
          if (
            acceptedFileTypes &&
            !acceptedFileTypes.some(
              (type) =>
                file.type.includes(type) || type === file.name.split(".").pop()
            )
          ) {
            alert(
              `File type for ${
                file.name
              } not supported. Accepted types: ${acceptedFileTypes.join(", ")}`
            );
            return false;
          }
          return true;
        })
        .map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          type: file.type || "application/octet-stream",
          uploadStatus: "pending" as const,
          uploadProgress: 0,
        }));

      setFiles((prev) => [...prev, ...newFiles]);
      setUploading(true);

      // Process each file
      for (const fileToUpload of newFiles) {
        try {
          // Read text content for textual files
          if (isTextualFile(fileToUpload.file)) {
            const textContent = await readFileAsText(fileToUpload.file);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileToUpload.id ? { ...f, textContent } : f
              )
            );
          }

          // Upload to Firebase Storage
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileToUpload.id ? { ...f, uploadStatus: "uploading" } : f
            )
          );

          const downloadURL = await uploadFileToFirebase(fileToUpload.file);
          
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileToUpload.id
                ? { ...f, uploadStatus: "complete", uploadProgress: 100, downloadURL }
                : f
            )
          );
        } catch (error) {
          console.error("Error uploading file:", error);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileToUpload.id
                ? { ...f, uploadStatus: "error" }
                : f
            )
          );
        }
      }

      setUploading(false);
    },
    [files.length, maxFiles, maxFileSize, acceptedFileTypes, user?.uid]
  );

  const removeFile = useCallback(async (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (!fileToRemove) return;

    try {
      // Delete from Firebase Storage if it has a downloadURL
      if (fileToRemove.downloadURL) {
        // Extract the file path from the downloadURL
        const url = new URL(fileToRemove.downloadURL);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        if (pathMatch) {
          const filePath = decodeURIComponent(pathMatch[1]);
          const storageRef = ref(storage, filePath);
          await deleteObject(storageRef);
        }
      }
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }

    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, [files]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const clipboardData = e.clipboardData;
      const items = clipboardData.items;

      const fileItems = Array.from(items).filter(
        (item) => item.kind === "file"
      );
      if (fileItems.length > 0 && files.length < maxFiles) {
        e.preventDefault();
        const pastedFiles = fileItems
          .map((item) => item.getAsFile())
          .filter(Boolean) as File[];
        const dataTransfer = new DataTransfer();
        pastedFiles.forEach((file) => dataTransfer.items.add(file));
        handleFileSelect(dataTransfer.files);
        return;
      }

      const textData = clipboardData.getData("text");
      if (textData) {
        // Validate pasted content first
        const validation = validateInput(textData);
        if (!validation.isValid) {
          e.preventDefault();
          setValidationError(validation.error);
          // Show error for 3 seconds then clear
          setTimeout(() => setValidationError(""), 3000);
          return;
        }
        
        if (
          textData.length > PASTE_THRESHOLD &&
          pastedContent.length < 5
        ) {
          // Limit pasted content items
          e.preventDefault();
          setMessage(message + textData.slice(0, PASTE_THRESHOLD) + "..."); // Add a portion to textarea

          const pastedItem: PastedContent = {
            id: Math.random().toString(36).substr(2, 9),
            content: textData,
            timestamp: new Date(),
            wordCount: textData.split(/\s+/).filter(Boolean).length,
          };

          setPastedContent((prev) => [...prev, pastedItem]);
        }
      }
    },
    [handleFileSelect, files.length, maxFiles, pastedContent.length, message]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  const handleSend = useCallback(() => {
    if (
      disabled ||
      (!message.trim() && files.length === 0 && pastedContent.length === 0)
    )
      return;
    if (files.some((f) => f.uploadStatus === "uploading")) {
      alert("Please wait for all files to finish uploading.");
      return;
    }

    // Final validation before sending
    const finalValidation = validateInput(message);
    if (!finalValidation.isValid) {
      setValidationError(finalValidation.error);
      return;
    }

    // Clear any existing validation errors
    setValidationError("");

    onSendMessage?.(message, files, pastedContent, selectedModel);

    setMessage("");
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    setPastedContent([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, files, pastedContent, disabled, onSendMessage]);

  const handleModelChangeInternal = useCallback(
    (modelId: string) => {
      setSelectedModel(modelId);
      onModelChange?.(modelId);
    },
    [onModelChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const hasContent =
    message.trim() || files.length > 0 || pastedContent.length > 0;
  const canSend =
    hasContent &&
    !disabled &&
    !files.some((f) => f.uploadStatus === "uploading") &&
    !uploading;

  // Debug logging
  useEffect(() => {
    console.log('Debug - canSend:', canSend, 'hasContent:', hasContent, 'message:', message.trim(), 'disabled:', disabled, 'uploading:', uploading);
  }, [canSend, hasContent, message, disabled, uploading]);

  return (
    <div
      className="relative w-full max-w-2xl mx-auto px-2 sm:px-0"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-primary flex items-center gap-2">
            <ImageIcon className="size-4 opacity-50" />
            Drop files here to add to chat
          </p>
        </div>
      )}

      <div className={cn(
        "rounded-xl shadow-lg items-end gap-2 min-h-[120px] sm:min-h-[150px] flex flex-col",
        variant === "hero" || variant === "glassmorphism" 
          ? "bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl" 
          : "bg-card border border-border"
      )}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            const validation = validateInput(e.target.value);
            if (validation.isValid) {
              setMessage(e.target.value);
              setValidationError("");
            } else {
              // Block the input completely - don't update the message
              setValidationError(validation.error);
              // Reset to previous valid state
              e.target.value = message;
            }
          }}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 min-h-[80px] sm:min-h-[100px] w-full p-3 sm:p-4 focus-within:border-none focus:outline-none focus:border-none border-none outline-none focus-within:ring-0 focus-within:ring-offset-0 focus-within:outline-none max-h-[100px] sm:max-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm sm:text-base custom-scrollbar",
            variant === "hero" || variant === "glassmorphism"
              ? "text-gray-900 placeholder:text-gray-500"
              : "text-foreground placeholder:text-muted-foreground"
          )}
          rows={1}
        />
        {validationError && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-700 bg-red-50 border-l-4 border-red-400 shadow-sm">
            <div className="flex items-start sm:items-center">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-red-500 mt-0.5 sm:mt-0 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium">Invalid Content:</span>
                <span className="sm:ml-1 text-xs sm:text-sm">{validationError}</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1 sm:gap-2 justify-between w-full px-2 sm:px-3 pb-1.5">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0",
                variant === "hero" || variant === "glassmorphism"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= maxFiles}
              title={
                files.length >= maxFiles
                  ? `Max ${maxFiles} files reached`
                  : "Attach files"
              }
            >
              <PaperclipIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {availableModels && availableModels.length > 0 && (
              <ModelSelectorDropdown
                models={availableModels}
                selectedModel={selectedModel}
                onModelChange={handleModelChangeInternal}
              />
            )}

            <Button
              size="icon"
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0 rounded-md transition-all duration-200",
                canSend
                  ? variant === "hero" || variant === "glassmorphism"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                  : variant === "hero" || variant === "glassmorphism"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              )}
              style={canSend && (variant === "hero" || variant === "glassmorphism") ? {} : canSend ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : {}}
              onClick={handleSend}
              disabled={!canSend}
              title="Send message"
            >
              <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
        {(files.length > 0 || pastedContent.length > 0) && (
          <div className={cn(
            "overflow-x-auto border-t-[1px] p-2 sm:p-3 w-full hide-scroll-bar",
            variant === "hero" || variant === "glassmorphism"
              ? "border-white/20 bg-white/20"
              : "border-border bg-muted/30"
          )}>
            <div className="flex gap-2 sm:gap-3">
              {pastedContent.map((content) => (
                <PastedContentCard
                  key={content.id}
                  content={content}
                  onRemove={(id) =>
                    setPastedContent((prev) => prev.filter((c) => c.id !== id))
                  }
                />
              ))}
              {files.map((file) => (
                <FilePreviewCard
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={acceptedFileTypes?.join(",")}
        onChange={(e) => {
          handleFileSelect(e.target.files);
          if (e.target) e.target.value = ""; // Reset file input
        }}
      />
    </div>
  );
};

// Legacy AI_Prompt component for backward compatibility
export function AI_Prompt({
  onSend,
  placeholder = "What can I help you verify today?",
  className,
  variant = "default",
}: {
  onSend?: (inputText: string, model?: string, imageFiles?: File[]) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "hero" | "glassmorphism";
}) {
  const [userPlan, setUserPlan] = useState<string>("free");
  const { user } = useAuth();

  // Load user plan
  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/user-tokens?uid=${user.uid}&t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setUserPlan(j.plan || "free");
      })
      .catch(() => {
        setUserPlan("free");
      });
  }, [user?.uid]);

  const handleSendMessage = (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[],
    modelId: string
  ) => {
    // Convert files to the old format for backward compatibility
    const imageFiles = files
      .filter(f => f.file.type.startsWith('image/'))
      .map(f => f.file);
    
    // Call the original onSend function with the chosen model
    onSend?.(message, modelId || "fakeverifier-hf", imageFiles);
  };

  return (
    <div className={className}>
      <ClaudeChatInput
        onSendMessage={handleSendMessage}
        placeholder={placeholder}
        maxFiles={10}
        maxFileSize={50 * 1024 * 1024} // 50MB
        models={getAvailableModels(userPlan)}
        variant={variant}
      />
    </div>
  );
}

export default ClaudeChatInput;