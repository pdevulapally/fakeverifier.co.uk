'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share,
  RotateCcw,
  CheckCircle2,
  Settings,
  User,
  LogOut,
  ChevronUp,
  Crown,
  Flag,
  AlertTriangle,
  X,
  Lock,
  Globe,
  HelpCircle,
  Sparkles,
  Link2,
  Eye,
  Shield
} from 'lucide-react';
import { AI_Prompt } from '@/components/ui/animated-ai-input';
import { TimelineFeed, type TimelineEvent } from '@/components/TimelineFeed';
import ClassicLoader from '@/components/ui/classic-loader';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { MemoryManager } from '@/components/MemoryManager';
import { MemoryNotification } from '@/components/MemoryNotification';
import { useAuth } from '@/contexts/AuthContext';

function TokenCounters({ uid }: { uid?: string | null }) {
  const [data, setData] = useState<{ daily: number; monthly: number; plan: string } | null>(null);
  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    const load = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const r = await fetch(`/api/user-tokens?uid=${uid}&t=${Date.now()}&tz=${encodeURIComponent(tz)}`, { cache: 'no-store' });
        const j = await r.json();
        if (mounted && r.ok) setData({ daily: j.tokensDaily ?? 0, monthly: j.tokensMonthly ?? 0, plan: j.plan || 'free' });
      } catch {}
    };
    load();

    const onVisibility = () => { if (document.visibilityState === 'visible') load(); };
    const onFocus = () => load();
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => { mounted = false; };
  }, [uid]);
  if (!data) return null;

  const planTotals: Record<string, { daily: number; monthly: number; color: string }> = {
    free: { daily: 20, monthly: 100, color: '#9CA3AF' },
    pro: { daily: 200, monthly: 2000, color: 'var(--primary)' },
    enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER, color: '#8B5CF6' },
  };
  const totals = planTotals[data.plan] || planTotals.free;
  const dailyUsed = Math.max(0, totals.daily - (data.daily || 0));
  const monthlyUsed = Math.max(0, totals.monthly - (data.monthly || 0));
  const dailyPct = Math.min(100, Math.round((dailyUsed / Math.max(1, totals.daily)) * 100));
  const monthlyPct = Math.min(100, Math.round((monthlyUsed / Math.max(1, totals.monthly)) * 100));

  return (
    <div className="mt-2 rounded-lg border p-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Usage</span>
        <span className="text-[11px] rounded-full px-2 py-0.5" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} Plan</span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--muted-foreground)' }}>
          <span>Daily</span>
          <span>{totals.daily - dailyUsed}/{totals.daily}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
          <div className="h-2" style={{ width: `${dailyPct}%`, background: totals.color, transition: 'width 300ms ease' }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--muted-foreground)' }}>
          <span>Monthly</span>
          <span>{totals.monthly - monthlyUsed}/{totals.monthly}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
          <div className="h-2" style={{ width: `${monthlyPct}%`, background: totals.color, transition: 'width 300ms ease' }} />
        </div>
      </div>
      {data.plan !== 'enterprise' && (data.daily <= 0 || data.monthly <= 0) && (
        <button onClick={() => (window.location.href = '/pricing')} className="mt-3 w-full rounded-md px-2.5 py-1.5 text-[12px] font-medium shadow-sm" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          Upgrade plan
        </button>
      )}
    </div>
  );
}

function InlineCredits({ uid }: { uid?: string | null }) {
  const [data, setData] = useState<{ daily: number; monthly: number; plan: string } | null>(null);
  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    (async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const r = await fetch(`/api/user-tokens?uid=${uid}&tz=${encodeURIComponent(tz)}`);
        const j = await r.json();
        if (mounted && r.ok) setData({ daily: j.tokensDaily ?? 0, monthly: j.tokensMonthly ?? 0, plan: j.plan || 'free' });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [uid]);
  if (!data) return null;

  return (
    <div className="mt-3 rounded-xl border bg-white p-4">
      <div className="mb-3">
        <p className="text-[13px] font-medium text-gray-700">Credit Balance</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-gray-600">Daily credits</span>
          <span className="font-medium text-gray-900">{data.daily}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-gray-600">Monthly credits</span>
          <span className="font-medium text-gray-900">{data.monthly}</span>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-blue-50 p-3 text-[12px] text-blue-700">
        Upgrade your plan to buy more credits. <a href="/pricing" className="underline">Upgrade plan</a>
      </div>
    </div>
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [feedbackForMessageId, setFeedbackForMessageId] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [dynamicReasons, setDynamicReasons] = useState<string[]>([]);
  const [threeDotsDropdownOpen, setThreeDotsDropdownOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const { user, loading: authLoading, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{ id: string; title: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [showMemorySidebar, setShowMemorySidebar] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [memoryNotifications, setMemoryNotifications] = useState<any[]>([]);
  const [showMemoryNotification, setShowMemoryNotification] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<'private' | 'link' | 'public'>('private');
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [showAccessManagement, setShowAccessManagement] = useState(false);

  // Handle sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load memories
  useEffect(() => {
    if (!user?.uid) return;
    loadMemories();
  }, [user?.uid]);

  const loadMemories = async () => {
    if (!user?.uid) return;
    try {
      const response = await fetch(`/api/memories?uid=${user.uid}`);
      const data = await response.json();
      if (response.ok) {
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  };

  const processAutoMemories = async (userMessage: string, aiResponse: string) => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch('/api/memories/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          conversation: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
          userMessage,
          aiResponse
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.createdMemories.length > 0 || data.updatedMemories.length > 0) {
          // Show notification
          setMemoryNotifications([...data.createdMemories, ...data.updatedMemories]);
          setShowMemoryNotification(true);
          
          // Reload memories
          await loadMemories();
        }
      }
    } catch (error) {
      console.error('Failed to process auto memories:', error);
    }
  };

  const handlePrivacyToggle = async () => {
    setShowPrivacyModal(true);
    // Load access logs if conversation is public
    if (isPublic) {
      await loadAccessLogs();
    }
  };

  const confirmMakePublic = async () => {
    setShowPrivacyWarning(false);
    setIsPublic(true);
    
    // Generate public link
    const link = `${window.location.origin}/public-reports/${currentConversationId}`;
    setPublicLink(link);
    
    // Update conversation privacy in database
    await updateConversationPrivacy(true, 'public');
    
    // Reload conversation privacy to ensure UI is updated
    await loadConversationPrivacy();
  };

  const updateConversationPrivacy = async (makePublic: boolean, privacyLevel: 'private' | 'link' | 'public' = 'private') => {
    if (!currentConversationId || !user?.uid) return;
    
    try {
      await fetch(`/api/conversations/${currentConversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          isPublic: makePublic,
          privacyLevel: privacyLevel
        })
      });
    } catch (error) {
      console.error('Failed to update conversation privacy:', error);
    }
  };

  const loadAccessLogs = async () => {
    if (!currentConversationId || !user?.uid) return;
    
    try {
      const response = await fetch(`/api/conversations/${currentConversationId}/access-logs?uid=${user.uid}`);
      const data = await response.json();
      if (response.ok) {
        setAccessLogs(data.accessLogs || []);
      }
    } catch (error) {
      console.error('Failed to load access logs:', error);
    }
  };

  const loadConversationPrivacy = async () => {
    if (!currentConversationId || !user?.uid) return;
    
    try {
      const response = await fetch(`/api/conversations/${currentConversationId}?uid=${user.uid}`);
      const data = await response.json();
      if (response.ok && data) {
        const conv = data;
        setIsPublic(conv.isPublic || false);
        setPrivacyLevel(conv.privacyLevel || 'private');
        
        // Set public link if conversation is public or link-only
        if (conv.isPublic) {
          if (conv.privacyLevel === 'public') {
            setPublicLink(`${window.location.origin}/public-reports/${currentConversationId}`);
          } else if (conv.privacyLevel === 'link') {
            setPublicLink(`${window.location.origin}/shared/${currentConversationId}`);
          }
        } else {
          setPublicLink(null);
        }
      }
    } catch (error) {
      console.error('Failed to load conversation privacy:', error);
    }
  };

  const removeAccess = async (logId: string) => {
    if (!currentConversationId || !user?.uid) return;
    
    try {
      const response = await fetch(`/api/conversations/${currentConversationId}/access-logs/${logId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });

      if (response.ok) {
        // Remove from local state
        setAccessLogs(prev => prev.filter(log => log.id !== logId));
      } else {
        console.error('Failed to remove access');
      }
    } catch (error) {
      console.error('Error removing access:', error);
    }
  };

  const handlePrivacyChange = async (level: 'private' | 'link' | 'public') => {
    setPrivacyLevel(level);
    
    if (level === 'private') {
      setIsPublic(false);
      setPublicLink(null);
      await updateConversationPrivacy(false, 'private');
    } else if (level === 'link') {
      setIsPublic(true);
      const link = `${window.location.origin}/shared/${currentConversationId}`;
      setPublicLink(link);
      await updateConversationPrivacy(true, 'link');
    } else if (level === 'public') {
      setIsPublic(true);
      const link = `${window.location.origin}/public-reports/${currentConversationId}`;
      setPublicLink(link);
      await updateConversationPrivacy(true, 'public');
    }
    
    // Load access logs when making public
    if (level !== 'private') {
      await loadAccessLogs();
    }
    
    // Reload conversation privacy to ensure UI is updated
    await loadConversationPrivacy();
    
    // Close the privacy modal after selection
    setShowPrivacyModal(false);
  };

  // Minimal markdown renderer for assistant messages (links, bold, lists, newlines)
  function mdToHtml(md: string): string {
    if (!md) return '';
    let html = md;
    // escape basic HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // links [text](url)
    html = html.replace(/\[(.+?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>');
    // angle links <url>
    html = html.replace(/&lt;(https?:[^\s]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline">$1</a>');
    // simple lists starting with - 
    const lines = html.split(/\r?\n/);
    let inList = false;
    const out: string[] = [];
    for (const line of lines) {
      const m = line.match(/^\s*-\s+(.*)/);
      if (m) {
        if (!inList) { out.push('<ul class="list-disc pl-6">'); inList = true; }
        out.push(`<li>${m[1]}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
      }
    }
    if (inList) out.push('</ul>');
    // join with <br/>
    html = out.join('\n').replace(/\n/g, '<br/>');
    return html;
  }

  // Load conversations when user is authenticated
  useEffect(() => {
    if (user) {
      loadConversations();
      loadUserPlan();
    }
  }, [user]);

  // Load conversation privacy when conversation changes
  useEffect(() => {
    if (currentConversationId && user) {
      loadConversationPrivacy();
    }
  }, [currentConversationId, user]);

  // Handle deep-linking to a conversation via ?c=CONVERSATION_ID
  useEffect(() => {
    if (!user || authLoading) return;
    const c = searchParams.get('c');
    if (c && c !== currentConversationId) {
      loadMessages(c);
    }
  }, [searchParams, user, authLoading]);

  async function loadUserPlan() {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user-plan?uid=${user.uid}`);
      const data = await response.json();
      if (response.ok) {
        setUserPlan(data.plan || 'free');
      }
    } catch (error) {
      setUserPlan('free'); // Default to free plan on error
    }
  }

  // Check for pending verification from hero section
  useEffect(() => {
    if (user && !authLoading) {
      const pendingVerification = sessionStorage.getItem('pendingVerification');
        if (pendingVerification) {
          sessionStorage.removeItem('pendingVerification');
          try {
            const data = JSON.parse(pendingVerification);
            onVerify(data.input, data.model, data.imageFiles);
          } catch {
            // Fallback for old format
            onVerify(pendingVerification);
          }
        }
    }
  }, [user, authLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [authLoading, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userDropdownOpen && !target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
      if (threeDotsDropdownOpen && !target.closest('.three-dots-dropdown')) {
        setThreeDotsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen, threeDotsDropdownOpen]);

  async function loadConversations() {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/conversations?uid=${user.uid}`);
      const data = await response.json();
      if (response.ok) {
        setConversations(data.conversations);
      }
    } catch (error) {
      // Silent fail for conversation loading
    }
  }

  async function loadMessages(conversationId: string) {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages?uid=${user.uid}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
        setCurrentConversationId(conversationId);
        // Update URL to reflect current conversation without full reload
        router.replace(`/verify?c=${conversationId}`);
      }
    } catch (error) {
      // Silent fail for message loading
    }
  }

  async function createNewConversation(): Promise<string | null> {
    if (!user) return null;
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          title: 'New Conversation'
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentConversationId(data.id);
        setMessages([]);
        loadConversations(); // Refresh conversations list
        router.replace(`/verify?c=${data.id}`);
        return data.id as string;
      }
    } catch (error) {
      // Silent fail for conversation creation
    }
    return null;
  }

  async function deleteConversation(conversationId: string) {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/conversations?id=${conversationId}&uid=${user.uid}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
          setMessages([]);
        }
        loadConversations(); // Refresh conversations list
      }
    } catch (error) {
      // Silent fail for conversation deletion
    }
  }

  function requestDeleteConversation(conversationId: string, title: string) {
    setConversationToDelete({ id: conversationId, title });
    setConfirmDeleteOpen(true);
  }

  function closeDeleteDialog() {
    setConfirmDeleteOpen(false);
    setConversationToDelete(null);
  }

  async function confirmDeleteConversation() {
    if (!conversationToDelete) return;
    await deleteConversation(conversationToDelete.id);
    closeDeleteDialog();
  }

  function startEditingConversation(conversationId: string, currentTitle: string) {
    setEditingConversationId(conversationId);
    setEditingTitle(currentTitle || '');
  }

  async function saveConversationTitle(conversationId: string) {
    if (!user || !editingTitle.trim()) {
      setEditingConversationId(null);
      setEditingTitle('');
      return;
    }
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: conversationId, uid: user.uid, title: editingTitle.trim() })
      });
      if (response.ok) {
        await loadConversations();
        setEditingConversationId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  }

  function cancelEditing() {
    setEditingConversationId(null);
    setEditingTitle('');
  }

  async function onVerify(inputText: string, model?: string, imageFiles?: File[], regenerate?: boolean) {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setTimeline([]);
    setError(null);
    
    // Create new conversation if none exists
    let targetConversationId = currentConversationId;
    if (!targetConversationId) {
      targetConversationId = await createNewConversation();
    }
    
    // Add user message unless regenerating
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };
    if (!regenerate) {
      setMessages(prev => [...prev, userMessage]);
    }
    
    try {
      // Save user message to conversation unless regenerating
      if (!regenerate && targetConversationId && user) {
        await fetch(`/api/conversations/${targetConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            message: userMessage
          })
        });
      }

      // Build lightweight context from recent turns to help follow-ups
      const recent = messages.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

      // If user selected the Llama chat model, route to unified /api/chat
      if ((model || '').includes('llama')) {
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputText, userId: user?.uid || 'demo', history: [], model: model || 'llama-hf-router' }),
        });
        const chatJson = await chatRes.json();
        if (!chatRes.ok) throw new Error(chatJson?.error || 'Chat failed');

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: String(chatJson.result || ''),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        await processAutoMemories(inputText, assistantMessage.content);
        if (targetConversationId && user) {
          await fetch(`/api/conversations/${targetConversationId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, message: assistantMessage })
          });
        }
        setLoading(false);
        return;
      }

      // Convert images to base64 if provided
      let imageBase64Array: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          imageBase64Array.push(buffer.toString('base64'));
        }
      }

      // Start timeline SSE in parallel
      const sseUrl = `/api/verify/stream?q=${encodeURIComponent(inputText)}${user?.uid ? `&uid=${encodeURIComponent(user.uid)}` : ''}`;
      const evts = new EventSource(sseUrl);
      evts.onmessage = (ev) => {
        try {
          const obj = JSON.parse(ev.data);
          setTimeline((prev) => [...prev, obj]);
          if (obj.stage === 'verdict') evts.close();
        } catch {}
      };

      // Prepare memories context
      const memoriesContext = memories.length > 0 
        ? `\n\nRelevant memories about this user:\n${memories.map(m => `- ${m.content}`).join('\n')}`
        : '';

      // Ensure model is explicitly set to OpenAI Agent Builder if not provided
      const selectedModel = model || 'openai-agent-builder';
      console.log('Sending verification request with model:', selectedModel);
      
      const r = await fetch('/api/verify', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          uid: user?.uid || 'demo',
          input: { 
            type: inputText.startsWith('http') ? 'url' : 'text', 
            raw: inputText, 
            context: recent + memoriesContext 
          },
          nocache: true,
          model: selectedModel,
          imageBase64Array: imageBase64Array
        })
      });
      const j = await r.json();
      
      if (r.ok) {
        // find last assistant index for regenerate
        const lastAssistantIndex = [...messages].map((m, idx) => ({m, idx})).reverse().find(x => x.m.role === 'assistant')?.idx;
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: (j.messageMarkdown as string) || `**Verdict:** ${j.verdict}\n**Confidence:** ${j.confidence}%\n\n**Why:**\n${j.explanation}`,
          timestamp: new Date()
        };
        if (regenerate && lastAssistantIndex !== undefined) {
          setMessages(prev => prev.map((m, idx) => idx === lastAssistantIndex ? { ...assistantMessage, id: m.id } : m));
        } else {
          setMessages(prev => [...prev, assistantMessage]);
        }
        
        // Process auto-memories after AI response
        await processAutoMemories(inputText, assistantMessage.content);
        
        // Save assistant message to conversation
        if (targetConversationId && user) {
          if (regenerate && lastAssistantIndex !== undefined) {
            // Update last assistant message in DB
            const lastAssistant = [...messages][lastAssistantIndex];
            await fetch(`/api/conversations/${targetConversationId}/messages`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                messageId: lastAssistant.id,
                content: assistantMessage.content
              })
            });
          } else {
            await fetch(`/api/conversations/${targetConversationId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                message: assistantMessage
              })
            });
          }
          // Refresh conversations to pick up any auto-updated title
          await loadConversations();
        }
      
      // Clear timeline when verification completes
      setTimeline([]);
    } else {
        if (r.status === 402 && j?.error === 'quota') {
          setError(null);
          const div = document.createElement('div');
          div.className = 'fixed inset-0 z-50 flex items-center justify-center';
          div.innerHTML = `
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div class="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.05)_inset]" style="background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); border-color: color-mix(in oklab, var(--border) 50%, transparent); backdrop-filter: blur(16px) saturate(180%)">
              <div class="px-8 py-12 text-center text-white" style="background: linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)">
                <button id="quota-cancel" class="absolute right-4 top-4 text-white/80 transition-colors hover:text-white" aria-label="Close">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
                <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shadow-lg">
                  <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 class="mb-2 text-3xl font-bold">You've reached your limit</h3>
                <p class="text-lg text-white/90">Upgrade to continue</p>
              </div>
              <div class="px-8 py-8" style="background: #ffffff">
                <div class="mb-6 rounded-2xl border p-4 shadow-sm" style="background: #ffffff; border-color: var(--border)">
                  <p class="text-sm" style="color: var(--muted-foreground)">Your ${j?.remaining?.plan || 'free'} plan has reached its token limit. Daily tokens reset at 12:00 AM local time.</p>
                </div>
                <div class="flex flex-col gap-3 sm:flex-row">
                  <button id="quota-upgrade" class="flex-1 rounded-xl px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]" style="background: var(--primary)">Upgrade plan</button>
                  <button id="quota-cancel-2" class="rounded-xl border-2 px-6 py-4 font-semibold transition-all hover:scale-[1.02]" style="border-color: var(--border); color: var(--foreground)">Maybe later</button>
                </div>
              </div>
            </div>`;
          document.body.appendChild(div);
          const close = () => div.remove();
          div.querySelector('#quota-cancel')?.addEventListener('click', close);
          div.querySelector('#quota-cancel-2')?.addEventListener('click', close);
          div.querySelector('#quota-upgrade')?.addEventListener('click', () => { window.location.href = '/pricing'; });
        } else {
          setError(j.error || 'Verification failed');
        }
      }
    } catch {
      setError('Network error');
      // Clear timeline on error too
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  }

  // Actions for assistant messages
  async function onFeedback(messageId: string, type: 'up'|'down') {
    try {
      if (!user || !currentConversationId) return;
      if (type === 'down') {
        setFeedbackForMessageId(messageId);
        // Build short transcript context (last 8 turns)
        const recent = [...messages].slice(-8).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        try {
          const resp = await fetch('/api/feedback/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: recent }) });
          const j = await resp.json();
          if (resp.ok && Array.isArray(j?.reasons)) {
            setDynamicReasons(j.reasons.filter((s: any) => typeof s === 'string' && s.trim()));
          } else {
            setDynamicReasons(['Not clear enough', 'Missing context', 'Not factual', 'Too verbose']);
          }
        } catch {
          setDynamicReasons(['Not clear enough', 'Missing context', 'Not factual', 'Too verbose']);
        }
        return;
      }
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, conversationId: currentConversationId, messageId, type })
      });
    } catch (e) {
      // Silent fail for feedback
    }
  }

  async function onCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      // Reset the success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      // Silent fail for copy
    }
  }

  function onShare(text: string) {
    try {
      if (navigator.share) {
        navigator.share({ title: 'Verification Result', text });
      } else {
        navigator.clipboard.writeText(text);
      }
    } catch (e) {
      // Silent fail for share
    }
  }

  // Generate share link for current conversation
  function generateShareLink() {
    // This function should only be called when there's a conversation with messages
    if (currentConversationId && messages.length > 0) {
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/verify?c=${currentConversationId}`;
      setShareLink(shareUrl);
      setShareModalOpen(true);
    }
  }

  // Copy share link to clipboard
  async function copyShareLink() {
    try {
      const linkToCopy = publicLink || shareLink;
      await navigator.clipboard.writeText(linkToCopy);
      setCopySuccess(true);
      // Reset the success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      // Silent fail for copy errors
    }
  }

  // Report reasons options
  const reportReasons = [
    { id: 'inappropriate_content', label: 'Inappropriate Content', description: 'Contains offensive or inappropriate material' },
    { id: 'spam', label: 'Spam', description: 'Repetitive or unwanted content' },
    { id: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
    { id: 'harassment', label: 'Harassment', description: 'Bullying or threatening behavior' },
    { id: 'violence', label: 'Violence', description: 'Promotes or glorifies violence' },
    { id: 'other', label: 'Other', description: 'Other reason not listed above' }
  ];

  // Handle report conversation
  function openReportModal() {
    setReportModalOpen(true);
    setThreeDotsDropdownOpen(false);
  }

  // Submit report
  async function submitReport() {
    if (!currentConversationId || !user || !selectedReportReason) return;
    
    setReportSubmitting(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          conversationId: currentConversationId,
          reason: selectedReportReason,
          note: reportNote.trim()
        })
      });
      
      if (response.ok) {
        setReportModalOpen(false);
        setSelectedReportReason('');
        setReportNote('');
        // You could add a success toast here
      } else {
        // Silent fail for report submission
      }
    } catch (error) {
      // Silent fail for report errors
    } finally {
      setReportSubmitting(false);
    }
  }

  async function onRegenerate() {
    if (!messages.length) return;
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    await onVerify(lastUser.content, undefined, undefined, true);
  }

  // Edit message functions
  function startEditing(messageId: string, content: string) {
    setEditingMessageId(messageId);
    setEditingContent(content);
  }

  function cancelMessageEditing() {
    setEditingMessageId(null);
    setEditingContent('');
  }

  async function saveEdit() {
    if (!editingMessageId || !editingContent.trim()) return;
    
    // Update the message in the local state
    setMessages(prev => prev.map(m => 
      m.id === editingMessageId 
        ? { ...m, content: editingContent.trim() }
        : m
    ));

    // Update in the database if we have a conversation
    if (currentConversationId && user) {
      try {
        await fetch(`/api/conversations/${currentConversationId}/messages`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            messageId: editingMessageId,
            content: editingContent.trim()
          })
        });
      } catch (error) {
        console.error('Failed to update message:', error);
      }
    }

    // Regenerate response with the edited content (replace last assistant)
    await onVerify(editingContent.trim(), undefined, undefined, true);
    
    // Clear editing state
    cancelMessageEditing();
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    (conv.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <ClassicLoader />
          </div>
          <p className="opacity-70" style={{ color: 'var(--muted-foreground)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Delete Confirmation Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeDeleteDialog} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-xl"
               style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Delete conversation</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Are you sure you want to delete
              {conversationToDelete?.title ? ` "${conversationToDelete.title}"` : ''}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDeleteDialog}
                className="rounded-full px-4 py-2 text-sm"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                className="rounded-full px-4 py-2 text-sm"
                style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Layout */}
      <div className="lg:hidden h-full w-full bg-white overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        

        {/* Mobile Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-80 bg-gray-50 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-full flex-col p-6">
            {/* Brand row */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/Images/Fakeverifier-official-logo.png" alt="CHAT A.I+" className="h-10" />
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <img src="/Images/sidebar-toggle-nav-side-aside-svgrepo-com.svg" alt="Close Sidebar" className="h-5 w-5" />
              </button>
            </div>
          
            {/* Primary actions */}
            <div className="mb-4 flex items-center gap-3">
              {!isSearchActive ? (
                <button 
                  onClick={createNewConversation}
                  className="inline-flex w-56 items-center justify-center gap-2 self-start rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  New chat
          </button>
              ) : (
                <div className="flex w-56 items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-300">
                  <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text" 
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setIsSearchActive(false);
                      setSearchQuery('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <button 
                onClick={() => setIsSearchActive(!isSearchActive)}
                className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>
          </div>
          
            <div className="mb-3 border-t border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Your conversations</h3>
              <button 
                onClick={() => {
                  conversations.forEach(conv => deleteConversation(conv.id));
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
          </div>
          
            <div className="flex-1 space-y-1 overflow-y-auto">
              {filteredConversations.map((conv, i) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    loadMessages(conv.id);
                    setSidebarOpen(false); // Close sidebar on mobile when selecting conversation
                  }}
                  className={`group flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                    currentConversationId === conv.id
                      ? 'bg-[color:var(--muted)] ring-1 ring-[color:var(--border)]'
                      : 'hover:bg-[color:var(--muted)]'
                  }`}
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--muted)]">
                     <img src="/Images/message.png" alt="Message" className="h-4 w-4" />
                </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${currentConversationId === conv.id ? 'font-medium text-[color:var(--primary)]' : 'text-[color:var(--foreground)]'}`}>{conv.title}</p>
                </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteConversation(conv.id, conv.title);
                      }}
                      className="rounded p-1 hover:bg-gray-200"
                    >
                      <Trash2 className="h-3 w-3 text-gray-500" />
                  </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingConversation(conv.id, conv.title);
                      }}
                      className="rounded p-1 hover:bg-gray-200"
                    >
                      <Edit className="h-3 w-3 text-gray-500" />
                  </button>
                    {currentConversationId === conv.id && <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />}
                </div>
              </div>
            ))}
          </div>
          
            {/* Footer */}
          <div className="mt-auto pt-4">
            <button 
              onClick={() => setShowMemorySidebar(!showMemorySidebar)}
              className="mb-3 flex w-full items-center gap-3 rounded-full p-2 bg-white border border-gray-200 hover:bg-gray-50">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-100">
                <User className="h-4 w-4 text-gray-800" />
              </div>
              <span className="text-sm text-gray-800">Memories</span>
            </button>
            <button 
              onClick={() => { router.push('/settings'); }}
              className="mb-3 flex w-full items-center gap-3 rounded-full p-2 bg-white border border-gray-200 hover:bg-gray-50">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-100">
                <Settings className="h-4 w-4 text-gray-800" />
              </div>
              <span className="text-sm text-gray-800">Settings</span>
            </button>
              <div className="flex items-center gap-3 rounded-full p-2 bg-white border border-gray-200">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-xs">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || 'User'} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-600 font-medium">{(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.name || user?.email || 'User'}</p>
                  <p className="text-xs text-gray-500">{userPlan}</p>
                </div>
                <button 
                  onClick={logout}
                  className="ml-auto text-xs text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <img src="/Images/sidebar-toggle-nav-side-aside-svgrepo-com.svg" alt="Toggle Sidebar" className="h-5 w-5" />
            </button>
            <img src="/Images/Fakeverifier-official-logo.png" alt="FakeVerifier Official Logo" className="h-8" />
          </div>
          <div className="flex items-center gap-2">
            {/* Share Icon - Only show when there's a conversation with messages */}
            {currentConversationId && messages.length > 0 && (
              <button 
                onClick={generateShareLink}
                className="rounded-lg p-2 hover:bg-gray-100"
                title="Share conversation"
              >
                <Share className="h-5 w-5 text-gray-500" />
              </button>
            )}
            
            {/* Three Dots Dropdown */}
            <div className="relative three-dots-dropdown">
              <button 
                onClick={() => setThreeDotsDropdownOpen(!threeDotsDropdownOpen)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Dropdown Menu */}
              {threeDotsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button 
                      onClick={openReportModal}
                      className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (currentConversationId) {
                          requestDeleteConversation(currentConversationId, conversations.find(c => c.id === currentConversationId)?.title || 'Conversation');
                        }
                        setThreeDotsDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Main Content */}
        <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="grid h-full place-items-center">
                <div className="text-center max-w-full">
                  <h2 className="mb-2 text-xl font-bold text-gray-900">Start a verification</h2>
                  <p className="text-sm text-gray-600">Paste a URL or text to verify its authenticity</p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="flex w-full justify-center">
                  <div className="w-full max-w-3xl">
                    {m.role === 'assistant' ? (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <img src="/Images/Fakeverifier-official-logo.png" alt="FakeVerifier Official Logo" className="h-5 w-auto" />
                          <CheckCircle2 className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-900">
                          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(m.content) }} />
                        </div>
                        <div className="mt-3 flex items-center gap-1">
                          <button onClick={() => onFeedback(m.id, 'up')} className="rounded-lg p-2 hover:bg-gray-100"><ThumbsUp className="h-4 w-4 text-gray-500" /></button>
                          <button onClick={() => onFeedback(m.id, 'down')} className="rounded-lg p-2 hover:bg-gray-100"><ThumbsDown className="h-4 w-4 text-gray-500" /></button>
                          <button onClick={() => onCopy(m.content)} className="rounded-lg p-2 hover:bg-gray-100"><Copy className="h-4 w-4 text-gray-500" /></button>
                          <button onClick={() => onShare(m.content)} className="rounded-lg p-2 hover:bg-gray-100"><Share className="h-4 w-4 text-gray-500" /></button>
                          <button onClick={onRegenerate} className="rounded-lg p-2 hover:bg-gray-100"><RotateCcw className="h-4 w-4 text-gray-500" /></button>
                          <div className="ml-auto" />
                        </div>

                        {/* Feedback tray on mobile */}
                        {feedbackForMessageId === m.id && (
                          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <div className="mb-2 text-sm font-medium text-gray-700">Tell us more:</div>
                            <div className="flex flex-wrap gap-2">
                              {(dynamicReasons.length ? dynamicReasons : ['Not clear enough','Missing context','Not factual','Too verbose']).map((label) => (
                                <button
                                  key={label}
                                  disabled={feedbackSubmitting}
                                  onClick={async () => {
                                    if (!user || !currentConversationId) return;
                                    try {
                                      setFeedbackSubmitting(true);
                                      await fetch('/api/feedback', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ uid: user.uid, conversationId: currentConversationId, messageId: m.id, type: 'down', reason: label })
                                      });
                                    } catch (e) {
                                      // Silent fail for feedback
                                    } finally {
                                      setFeedbackSubmitting(false);
                                      setFeedbackForMessageId(null);
                                    }
                                  }}
                                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <input id={`note-${m.id}`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Optional note (max 120 chars)" maxLength={120} />
                              <button
                                disabled={feedbackSubmitting}
                                onClick={async () => {
                                  const inputEl = document.getElementById(`note-${m.id}`) as HTMLInputElement | null;
                                  const note = inputEl?.value || '';
                                  if (!user || !currentConversationId) return;
                                  try {
                                    setFeedbackSubmitting(true);
                                    await fetch('/api/feedback', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ uid: user.uid, conversationId: currentConversationId, messageId: m.id, type: 'down', reason: 'More...', note })
                                    });
                                  } catch (e) {
                                    // Silent fail for feedback
                                  } finally {
                                    setFeedbackSubmitting(false);
                                    setFeedbackForMessageId(null);
                                  }
                                }}
                                className="rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-60"
                                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                              >
                                Send
                              </button>
                              <button
                                disabled={feedbackSubmitting}
                                onClick={() => setFeedbackForMessageId(null)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">{m.content}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex w-full justify-center">
                <div className="w-full max-w-3xl">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <img src="/Images/Fakeverifier-official-logo.png" alt="FakeVerifier Official Logo" className="h-5 w-auto" />
                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <TextShimmer className='font-mono text-sm [--base-color:theme(colors.blue.600)] [--base-gradient-color:theme(colors.blue.300)]'>
                        Analyzing your input...
                      </TextShimmer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Composer */}
          <div className="border-t border-gray-200 px-4 py-4 overflow-hidden">
            <AI_Prompt 
              onSend={onVerify}
              placeholder="What's in your mind?..."
              className="w-full max-w-full"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-screen w-screen bg-gray-100 p-4">
        <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Left Sidebar */}
           <aside className={`${sidebarOpen ? 'w-[300px]' : 'w-0'} shrink-0 bg-gray-50 flex-col rounded-l-3xl rounded-r-3xl overflow-hidden transition-all duration-300`}>
          <div className="flex h-full flex-col p-6">
            {/* Brand row */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/Images/Fakeverifier-official-logo.png" alt="CHAT A.I+" className="h-10" />
              </div>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <img src="/Images/sidebar-toggle-nav-side-aside-svgrepo-com.svg" alt="Toggle Sidebar" className="h-5 w-5" />
              </button>
            </div>
          
            {/* Primary actions */}
            <div className="mb-4 flex items-center gap-3">
              {!isSearchActive ? (
                <button 
                  onClick={createNewConversation}
                  className="inline-flex w-56 items-center justify-center gap-2 self-start rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  New chat
          </button>
              ) : (
                <div className="flex w-56 items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-300">
                  <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text" 
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setIsSearchActive(false);
                      setSearchQuery('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <button 
                onClick={() => setIsSearchActive(!isSearchActive)}
                className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>
          </div>
          
            <div className="mb-3 border-t border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Your conversations</h3>
              <button 
                onClick={() => {
                  conversations.forEach(conv => deleteConversation(conv.id));
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
          </div>
          
            <div className="flex-1 space-y-1 overflow-y-auto">
              {filteredConversations.map((conv, i) => (
                <div
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`group flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                    currentConversationId === conv.id
                      ? 'bg-[color:var(--muted)] ring-1 ring-[color:var(--border)]'
                      : 'hover:bg-[color:var(--muted)]'
                  }`}
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--muted)]">
                     <img src="/Images/message.png" alt="Message" className="h-4 w-4" />
                </div>
                  <div className="min-w-0 flex-1">
                    {editingConversationId === conv.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveConversationTitle(conv.id);
                          } else if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                        onBlur={() => saveConversationTitle(conv.id)}
                        className="w-full text-sm bg-transparent border-none outline-none"
                        autoFocus
                      />
                    ) : (
                      <p className={`truncate text-sm ${currentConversationId === conv.id ? 'font-medium text-[color:var(--primary)]' : 'text-[color:var(--foreground)]'}`}>{conv.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteConversation(conv.id, conv.title);
                      }}
                      className="rounded p-1 hover:bg-gray-200"
                    >
                      <Trash2 className="h-3 w-3 text-gray-500" />
                  </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingConversation(conv.id, conv.title);
                      }}
                      className="rounded p-1 hover:bg-gray-200"
                    >
                      <Edit className="h-3 w-3 text-gray-500" />
                  </button>
                    {currentConversationId === conv.id && <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />}
                  </div>
                </div>
              ))}
            </div>
          
          
            {/* Footer */}
          <div className="mt-auto pt-4 relative">
            <button 
              onClick={() => setShowMemorySidebar(!showMemorySidebar)}
              className="mb-3 flex w-full items-center gap-3 rounded-full p-2 bg-white border border-gray-200 hover:bg-gray-50">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-100">
                <User className="h-4 w-4 text-gray-800" />
              </div>
              <span className="text-sm text-gray-800">Memories</span>
            </button>
            <button 
              onClick={() => { router.push('/settings'); }}
              className="mb-3 flex w-full items-center gap-3 rounded-full p-2 bg-white border border-gray-200 hover:bg-gray-50">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-100">
                <Settings className="h-4 w-4 text-gray-800" />
              </div>
              <span className="text-sm text-gray-800">Settings</span>
            </button>
            
            {/* User Profile with Dropdown */}
            <div className="relative user-dropdown">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex w-full items-center gap-3 rounded-full p-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-xs">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || 'User'} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-600 font-medium">{(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">{user?.name || user?.email || 'User'}</p>
                  <p className="text-xs text-gray-500">{userPlan}</p>
                </div>
                <ChevronUp className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-sm">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user?.name || 'User'} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-gray-600 font-medium">{(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}</span>
                        )}
                      </div>
                      <div className="relative">
                        <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || ''}</p>
                        <p className="mt-1 text-xs text-purple-600 font-medium">{userPlan} Plan</p>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      {/* Credit Balance block above Upgrade */}
                      <InlineCredits uid={user?.uid} />
                      <button 
                        onClick={() => router.push('/pricing')}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md">
                        <Crown className="h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </button>
                      <button 
                        onClick={() => router.push('/settings')}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </aside>

           {/* Main */}
           <main className={`relative flex min-w-0 flex-1 flex-col bg-white ${sidebarOpen ? 'border-l border-gray-200' : ''} overflow-hidden transition-all duration-300`}>
            {/* Chat header (title row) */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <img src="/Images/sidebar-toggle-nav-side-aside-svgrepo-com.svg" alt="Toggle Sidebar" className="h-5 w-5" />
                  </button>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-600">
                    {currentConversationId 
                      ? conversations.find(c => c.id === currentConversationId)?.title || 'New Conversation'
                      : 'Start a new conversation'
                    }
                  </p>
        </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Share Icon - Only show when there's a conversation with messages */}
                {currentConversationId && messages.length > 0 && (
                  <button 
                    onClick={generateShareLink}
                    className="rounded-lg p-2 hover:bg-gray-100"
                    title="Share conversation"
                  >
                    <Share className="h-5 w-5 text-gray-500" />
                  </button>
                )}
                
                {/* Three Dots Dropdown */}
                <div className="relative three-dots-dropdown">
                  <button 
                    onClick={() => setThreeDotsDropdownOpen(!threeDotsDropdownOpen)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {threeDotsDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <button 
                          onClick={openReportModal}
                          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (currentConversationId) {
                              requestDeleteConversation(currentConversationId, conversations.find(c => c.id === currentConversationId)?.title || 'Conversation');
                            }
                            setThreeDotsDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
      </div>
      
            {/* Messages */}
            <div className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          {messages.length === 0 ? (
                <div className="grid h-full place-items-center">
              <div className="text-center px-4">
                    <h2 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">Start a verification</h2>
                    <p className="text-sm sm:text-base text-gray-600">Paste a URL or text to verify its authenticity</p>
              </div>
            </div>
          ) : (
                messages.map((m) => (
                  <div key={m.id} className="flex w-full justify-center">
                    <div className="w-full max-w-3xl">
                      {m.role === 'assistant' ? (
                        <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5 shadow-sm">
                          <div className="mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
                            <img src="/Images/Fakeverifier-official-logo.png" alt="FakeVerifier Official Logo" className="h-5 w-auto sm:h-6" />
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                          </div>
                          <div className="prose prose-sm max-w-none text-gray-900 break-words overflow-wrap-anywhere">
                            <div className="prose prose-sm max-w-none break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: mdToHtml(m.content) }} />
                    </div>
                          {/* actions row */}
                          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1 sm:gap-2">
                            <button onClick={() => onFeedback(m.id, 'up')} className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"><ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" /></button>
                            <button onClick={() => onFeedback(m.id, 'down')} className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"><ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" /></button>
                            <button onClick={() => onCopy(m.content)} className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"><Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" /></button>
                            <button onClick={() => onShare(m.content)} className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"><Share className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" /></button>
                            <button onClick={onRegenerate} className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"><RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" /></button>
                            <div className="ml-auto" />
                            <button className="inline-flex items-center gap-2 rounded-lg sm:rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 touch-manipulation">
                              Regenerate
                          </button>
                        </div>

                          {/* Feedback tray when thumbs down */}
                          {feedbackForMessageId === m.id && (
                            <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 p-3">
                              <div className="mb-2 text-xs sm:text-sm font-medium text-gray-700">Tell us more:</div>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {(dynamicReasons.length ? dynamicReasons : ['Not clear enough','Missing context','Not factual','Too verbose']).map((label) => (
                                  <button
                                    key={label}
                                    disabled={feedbackSubmitting}
                                    onClick={async () => {
                                      if (!user || !currentConversationId) return;
                                      try {
                                        setFeedbackSubmitting(true);
                                        await fetch('/api/feedback', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ uid: user.uid, conversationId: currentConversationId, messageId: m.id, type: 'down', reason: label })
                                        });
                                      } catch (e) {
                                        // Silent fail for feedback
                                      } finally {
                                        setFeedbackSubmitting(false);
                                        setFeedbackForMessageId(null);
                                      }
                                    }}
                                    className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <input id={`note-${m.id}`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Optional note (max 120 chars)" maxLength={120} />
                                <button
                                  disabled={feedbackSubmitting}
                                  onClick={async () => {
                                    const inputEl = document.getElementById(`note-${m.id}`) as HTMLInputElement | null;
                                    const note = inputEl?.value || '';
                                    if (!user || !currentConversationId) return;
                                    try {
                                      setFeedbackSubmitting(true);
                                      await fetch('/api/feedback', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ uid: user.uid, conversationId: currentConversationId, messageId: m.id, type: 'down', reason: 'More...', note })
                                      });
                                    } catch (e) {
                                      // Silent fail for feedback
                                    } finally {
                                      setFeedbackSubmitting(false);
                                      setFeedbackForMessageId(null);
                                    }
                                  }}
                                  className="rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-60"
                                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                >
                                  Send
                                </button>
                                <button
                                  disabled={feedbackSubmitting}
                                  onClick={() => setFeedbackForMessageId(null)}
                                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                    </div>
                       ) : (
                        // User message
                        <div className="group relative">
                          <div className="rounded-2xl bg-gray-100 p-4 shadow-sm">
                            {editingMessageId === m.id ? (
                              // Edit mode
                              <div className="space-y-3">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                                  rows={3}
                                  placeholder="Edit your message..."
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={saveEdit}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                  >
                                    Save & Regenerate
                                  </button>
                                  <button
                                    onClick={cancelMessageEditing}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Display mode
                              <div className="relative">
                                <div className="text-sm text-gray-900">{m.content}</div>
                                {/* Hover actions */}
                                <div className="absolute -bottom-2 -right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <div className="flex items-center gap-1 rounded-lg bg-white border border-gray-200 p-1 shadow-lg">
                                    <button
                                      onClick={() => startEditing(m.id, m.content)}
                                      className="rounded p-1.5 hover:bg-gray-100"
                                      title="Edit message"
                                    >
                                      <Edit className="h-3.5 w-3.5 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={() => onCopy(m.content)}
                                      className="rounded p-1.5 hover:bg-gray-100"
                                      title="Copy message"
                                    >
                                      <Copy className="h-3.5 w-3.5 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                       )}
                  </div>
                </div>
                ))
          )}

          {/* Live analysis timeline */}
          {timeline.length > 0 && (
            <div className="flex w-full justify-center">
              <div className="w-full max-w-3xl">
                <TimelineFeed events={timeline} />
              </div>
            </div>
          )}
          
          {/* Loading state for AI response */}
          {loading && (
            <div className="flex w-full justify-center">
              <div className="w-full max-w-3xl">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <img src="/Images/Fakeverifier-official-logo.png" alt="FakeVerifier Official Logo" className="h-6 w-auto" />
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <TextShimmer className='font-mono text-sm [--base-color:theme(colors.blue.600)] [--base-gradient-color:theme(colors.blue.300)]'>
                      Analyzing your input...
                    </TextShimmer>
                    </div>
                  </div>
                </div>
            </div>
          )}
        </div>
        
            {/* Composer */}
            <div className="px-6 py-5">
          {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
              )}
              

              <div className="flex justify-center">
                <div className="w-full max-w-3xl border-t border-gray-200 pt-5">
                  <AI_Prompt 
                    onSend={onVerify}
                    placeholder="What's in your mind?..."
                    className="w-full"
                  />
          </div>
        </div>
      </div>
          </main>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShareModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Share Conversation
            </h3>
            
            {/* People with access section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">People with access</h4>
              
              {/* Owner */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0] || 'User'} (you)
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded flex items-center gap-1">
                  Owner <ChevronUp className="h-3 w-3" />
                </button>
              </div>

              {/* Access Logs */}
              {accessLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium">Recent access:</div>
                    <button
                      onClick={() => setShowAccessManagement(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Manage Access
                    </button>
                  </div>
                  {accessLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                        {log.userAgent?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-900">
                          {log.ipAddress || 'Anonymous'} • {log.location || 'Unknown location'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.accessedAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAccess(log.id)}
                        className="text-xs text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        title="Remove access"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {accessLogs.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{accessLogs.length - 3} more accesses
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visibility section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Visibility</h4>
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrivacyToggle}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {privacyLevel === 'private' ? (
                    <>
                      <Lock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Private</span>
                    </>
                  ) : privacyLevel === 'link' ? (
                    <>
                      <Share className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Anyone with link</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Public</span>
                    </>
                  )}
                  <ChevronUp className="h-3 w-3 text-gray-500" />
                </button>
                
                <button
                  onClick={copyShareLink}
                  disabled={!isPublic || !publicLink}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isPublic && publicLink
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>

            {/* Link display when public */}
            {isPublic && publicLink && (
              <div className="mb-4">
                <input 
                  type="text" 
                  value={publicLink}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                />
              </div>
            )}

            {/* Info link */}
            <div className="mb-4">
              <Link
                href="/sharing-guide"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors duration-200 hover:gap-2 group"
              >
                <HelpCircle className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">How does sharing chats work?</span>
              </Link>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReportModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Report Conversation
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Please select a reason for reporting this conversation:
            </p>
            
            <div className="mb-4 space-y-2">
              {reportReasons.map((reason) => (
                <label key={reason.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReportReason === reason.id}
                    onChange={(e) => setSelectedReportReason(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{reason.label}</div>
                    <div className="text-xs text-gray-500">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Please provide any additional context..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reportNote.length}/500 characters
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setSelectedReportReason('');
                  setReportNote('');
                }}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                disabled={reportSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!selectedReportReason || reportSubmitting}
                className="rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
              >
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Copied to clipboard!</span>
        </div>
      )}

      {/* Memory Notification */}
      {showMemoryNotification && memoryNotifications.length > 0 && (
        <MemoryNotification
          memories={memoryNotifications}
          onClose={() => {
            setShowMemoryNotification(false);
            setMemoryNotifications([]);
          }}
        />
      )}

      {/* Memory Modal */}
      {showMemorySidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col mx-2 sm:mx-0">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Memories</h2>
              <button 
                onClick={() => setShowMemorySidebar(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <MemoryManager uid={user?.uid || null} />
            </div>
          </div>
        </div>
      )}

      {/* Privacy Warning Modal */}
      {showPrivacyWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrivacyWarning(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Make Conversation Public?
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to make this conversation public? This will:
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Make this conversation visible to anyone with the link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Allow others to view your fact-checking results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Generate a shareable public link</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPrivacyWarning(false)}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmMakePublic}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Make Public
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Management Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrivacyModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Privacy Settings
            </h3>
            
            {/* Current Status */}
            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {privacyLevel === 'private' ? (
                  <>
                    <Lock className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Private Conversation</div>
                      <div className="text-xs text-gray-500">Only you can view this conversation</div>
                    </div>
                  </>
                ) : privacyLevel === 'link' ? (
                  <>
                    <Share className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Anyone with the link</div>
                      <div className="text-xs text-gray-500">Only people with the direct link can view this conversation</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Globe className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Public Conversation</div>
                      <div className="text-xs text-gray-500">Visible in public reports and discoverable by anyone</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Privacy Options */}
            <div className="mb-6 space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={privacyLevel === 'private'}
                  onChange={() => handlePrivacyChange('private')}
                  className="text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Private</div>
                    <div className="text-xs text-gray-500">Only you can access this conversation</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="link"
                  checked={privacyLevel === 'link'}
                  onChange={() => handlePrivacyChange('link')}
                  className="text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <Share className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Anyone with the link</div>
                    <div className="text-xs text-gray-500">Only people with the direct link can view this conversation</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={privacyLevel === 'public'}
                  onChange={() => {
                    setShowPrivacyWarning(true);
                    setShowPrivacyModal(false);
                  }}
                  className="text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Public</div>
                    <div className="text-xs text-gray-500">Visible in public reports and discoverable by anyone</div>
                  </div>
                </div>
              </label>
            </div>

            {/* Public Link Display */}
            {isPublic && publicLink && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Link
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={publicLink}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="mb-4">
              <div className="text-xs text-gray-500">
                <strong>Note:</strong> Public conversations will be visible in the public reports section and can be shared with anyone who has the link.
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="rounded-lg px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Management Modal */}
      {showAccessManagement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAccessManagement(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Access
              </h3>
              <button
                onClick={() => setShowAccessManagement(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Manage who has access to this conversation. You can remove access for specific users.
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {accessLogs.map((log, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    {log.userAgent?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {log.ipAddress || 'Anonymous'} • {log.location || 'Unknown location'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.accessedAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.userAgent || 'Unknown device'}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAccess(log.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Remove Access
                  </button>
                </div>
              ))}
              
              {accessLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-sm">No access logs found</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAccessManagement(false)}
                className="flex-1 rounded-lg px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyPage />
    </Suspense>
  );
}
