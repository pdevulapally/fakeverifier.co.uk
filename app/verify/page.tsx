'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
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
import AILoadingState from '@/components/ui/ai-loading-state';
import { MemoryManager } from '@/components/MemoryManager';
import { MemoryNotification } from '@/components/MemoryNotification';
import { SettingsModal } from '@/components/SettingsModal';
import { useAuth } from '@/contexts/AuthContext';

function TokenCounters({ uid, refreshKey }: { uid?: string | null; refreshKey?: number }) {
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
  }, [uid, refreshKey]);
  if (!data) return null;

  const planTotals: Record<string, { daily: number; monthly: number; color: string }> = {
    free: { daily: 20, monthly: 100, color: '#9CA3AF' },
    pro: { daily: 200, monthly: 2000, color: 'var(--primary)' },
    enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER, color: '#8B5CF6' },
  };
  const totals = planTotals[data.plan] || planTotals.free;
  const isUnlimited = totals.daily === Number.MAX_SAFE_INTEGER || totals.monthly === Number.MAX_SAFE_INTEGER;
  const dailyUsed = isUnlimited ? 0 : Math.max(0, totals.daily - (data.daily || 0));
  const monthlyUsed = isUnlimited ? 0 : Math.max(0, totals.monthly - (data.monthly || 0));
  const dailyPct = isUnlimited ? 100 : Math.min(100, Math.round((dailyUsed / Math.max(1, totals.daily)) * 100));
  const monthlyPct = isUnlimited ? 100 : Math.min(100, Math.round((monthlyUsed / Math.max(1, totals.monthly)) * 100));

  return (
    <div className="mt-2 rounded-lg border p-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Usage</span>
        <span className="text-[11px] rounded-full px-2 py-0.5" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} Plan</span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--muted-foreground)' }}>
          <span>Daily</span>
          <span>{isUnlimited ? 'Unlimited' : `${totals.daily - dailyUsed}/${totals.daily}`}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
          <div className="h-2" style={{ width: `${dailyPct}%`, background: totals.color, transition: 'width 300ms ease' }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--muted-foreground)' }}>
          <span>Monthly</span>
          <span>{isUnlimited ? 'Unlimited' : `${totals.monthly - monthlyUsed}/${totals.monthly}`}</span>
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

function InlineCredits({ uid, refreshKey }: { uid?: string | null; refreshKey?: number }) {
  const [data, setData] = useState<{ daily: number; monthly: number; plan: string } | null>(null);
  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    (async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const r = await fetch(`/api/user-tokens?uid=${uid}&t=${Date.now()}&tz=${encodeURIComponent(tz)}`, { cache: 'no-store' });
        const j = await r.json();
        if (mounted && r.ok) setData({ daily: j.tokensDaily ?? 0, monthly: j.tokensMonthly ?? 0, plan: j.plan || 'free' });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [uid, refreshKey]);
  if (!data) return null;

  const planTotals: Record<string, { daily: number; monthly: number; color: string }> = {
    free: { daily: 20, monthly: 100, color: '#9CA3AF' },
    pro: { daily: 200, monthly: 2000, color: 'var(--primary)' },
    enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER, color: '#8B5CF6' },
  };
  const totals = planTotals[data.plan] || planTotals.free;
  // Calculate remaining credits percentage (what's left, not what's used)
  const dailyRemaining = Math.max(0, data.daily || 0);
  const monthlyRemaining = Math.max(0, data.monthly || 0);
  const dailyPct = totals.daily === Number.MAX_SAFE_INTEGER ? 100 : Math.min(100, Math.round((dailyRemaining / Math.max(1, totals.daily)) * 100));
  const monthlyPct = totals.monthly === Number.MAX_SAFE_INTEGER ? 100 : Math.min(100, Math.round((monthlyRemaining / Math.max(1, totals.monthly)) * 100));

  return (
    <div className="mt-3 rounded-xl border bg-white p-4">
      <div className="mb-3">
        <p className="text-[13px] font-medium text-gray-700">Credit Balance</p>
      </div>
      <div className="space-y-4">
        {/* Daily Credits Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-gray-600">Daily credits</span>
            <span className="text-[12px] font-medium text-gray-900">
              {totals.daily === Number.MAX_SAFE_INTEGER ? 'Unlimited' : `${data.daily} / ${totals.daily}`}
            </span>
          </div>
          {totals.daily !== Number.MAX_SAFE_INTEGER ? (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div 
                className="h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ 
                  width: `${dailyPct}%`, 
                  background: totals.color,
                }} 
              />
            </div>
          ) : (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: '100%' }} />
            </div>
          )}
        </div>

        {/* Monthly Credits Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-gray-600">Monthly credits</span>
            <span className="text-[12px] font-medium text-gray-900">
              {totals.monthly === Number.MAX_SAFE_INTEGER ? 'Unlimited' : `${data.monthly} / ${totals.monthly}`}
            </span>
          </div>
          {totals.monthly !== Number.MAX_SAFE_INTEGER ? (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div 
                className="h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ 
                  width: `${monthlyPct}%`, 
                  background: totals.color,
                }} 
              />
            </div>
          ) : (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: '100%' }} />
            </div>
          )}
        </div>
      </div>
      {data.plan !== 'enterprise' && (data.daily <= 0 || data.monthly <= 0) && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3 text-[12px] text-blue-700">
          Upgrade your plan to buy more credits. <a href="/pricing" className="underline font-medium">Upgrade plan</a>
        </div>
      )}
    </div>
  );
}

interface EvidenceItem {
  title?: string;
  link?: string;
  snippet?: string;
  image?: string; // Image URL for thumbnails
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string; // Store the model used for this message
  evidence?: EvidenceItem[]; // Store evidence for citations
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Citation component for inline references (ChatGPT style)
function Citation({ index, evidence, onCitationClick }: { index: number; evidence: EvidenceItem; onCitationClick?: (index: number) => void }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCitationClick) {
      onCitationClick(index);
    } else if (evidence.link) {
      window.open(evidence.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <sup className="inline-flex items-center">
      <a
        href={evidence.link || '#'}
        onClick={handleClick}
        className="ml-0.5 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
        title={evidence.title || evidence.link}
      >
        [{index + 1}]
      </a>
    </sup>
  );
}

// Sources component - displays sources as badges
function Sources({ evidence }: { evidence: EvidenceItem[] }) {
  if (!evidence || evidence.length === 0) return null;

  // Get domain name from URL
  const getDomainName = (url?: string): string => {
    if (!url) return 'Source';
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname.replace(/^www\./, '');
      return hostname;
    } catch {
      return 'Source';
    }
  };

  // Get source name (prefer title, fallback to domain)
  const getSourceName = (item: EvidenceItem): string => {
    if (item.title) {
      // Try to extract source from title (e.g., "Reuters - Article Title" -> "Reuters")
      const match = item.title.match(/^([^-|•]+)/);
      if (match) {
        const source = match[1].trim();
        if (source.length > 0 && source.length < 30) return source;
      }
    }
    return getDomainName(item.link);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Sources</h3>
      <div className="flex flex-wrap gap-2">
        {evidence.map((item, index) => {
          const sourceName = getSourceName(item);
          
          return (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <Link2 className="h-3 w-3 text-gray-500" />
              <span>{sourceName}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// Further Reading component with article cards
function FurtherReading({ evidence }: { evidence: EvidenceItem[] }) {
  if (!evidence || evidence.length === 0) return null;

  // Get domain name from URL
  const getDomainName = (url?: string): string => {
    if (!url) return 'Source';
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname.replace(/^www\./, '');
      return hostname;
    } catch {
      return 'Source';
    }
  };

  // Get source name (prefer title, fallback to domain)
  const getSourceName = (item: EvidenceItem): string => {
    if (item.title) {
      // Try to extract source from title (e.g., "Reuters - Article Title" -> "Reuters")
      const match = item.title.match(/^([^-|•]+)/);
      if (match) {
        const source = match[1].trim();
        if (source.length > 0 && source.length < 30) return source;
      }
    }
    return getDomainName(item.link);
  };

  // Calculate days ago (mock for now, could be enhanced with actual dates)
  const getDaysAgo = (index: number): number => {
    // Mock: return 13, 15, 17 for first 3 items, then random
    const mockDays = [13, 15, 17];
    return mockDays[index] || Math.floor(Math.random() * 30) + 1;
  };

  // Limit to 3 articles for the further reading section
  const articlesToShow = evidence.slice(0, 3);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Further reading</h3>
      {/* Responsive grid: single column on mobile, two on small screens, three on large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {articlesToShow.map((item, index) => {
          const sourceName = getSourceName(item);
          const daysAgo = getDaysAgo(index);
          
          return (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow overflow-hidden h-full min-w-0"
            >
              {/* Image thumbnail - use actual image URL if available */}
              {item.image ? (
                <div className="w-full h-32 overflow-hidden bg-gray-100 relative">
                  <img 
                    src={item.image} 
                    alt={item.title || 'Article thumbnail'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image and show placeholder on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.placeholder-fallback')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'placeholder-fallback w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center absolute inset-0';
                        placeholder.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Link2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                {/* Source name with logo placeholder */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      {sourceName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{sourceName}</span>
                </div>
                {/* Headline */}
                <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 sm:line-clamp-3">
                  {item.title || item.snippet || 'Read more'}
                </h4>
                {/* Timestamp */}
                <p className="mt-auto text-xs text-gray-500">{daysAgo} days ago</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// Using the new animated-text component from components/ui

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<'private' | 'link' | 'public'>('private');
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [showAccessManagement, setShowAccessManagement] = useState(false);
  const [anonymousChatInfo, setAnonymousChatInfo] = useState<{ count: number; limit: number; remaining: number; showWarning: boolean } | null>(null);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [lastUsedModel, setLastUsedModel] = useState<string | undefined>(undefined);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);
  const [creditsData, setCreditsData] = useState<{ daily: number; monthly: number; plan: string } | null>(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [isSharedConversation, setIsSharedConversation] = useState(false);
  const [conversationOwner, setConversationOwner] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);

  // Sidebar defaults to closed - removed auto-open behavior
  // Sidebar is hidden for anonymous users

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

  const [processingMemory, setProcessingMemory] = useState<string | null>(null);
  
  const processAutoMemories = async (userMessage: string, aiResponse: string) => {
    if (!user?.uid) return;
    
    // Create a unique key for this message to prevent duplicate processing
    const messageKey = `${userMessage.slice(0, 50)}_${aiResponse.slice(0, 50)}`;
    
    // Skip if already processing this message
    if (processingMemory === messageKey) return;
    
    setProcessingMemory(messageKey);
    
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
        const created = Array.isArray(data.createdMemories) ? data.createdMemories : [];
        const updated = Array.isArray(data.updatedMemories) ? data.updatedMemories : [];
        
        if (created.length > 0 || updated.length > 0) {
          // Show notification with proper format
          const notifications = [
            ...created.map((m: any) => ({ ...m, action: 'created' })),
            ...updated.map((m: any) => ({ ...m, action: 'updated' }))
          ];
          
          setMemoryNotifications(notifications);
          setShowMemoryNotification(true);
          
          // Reload memories
          await loadMemories();
        }
      }
    } catch (error) {
      console.error('Failed to process auto memories:', error);
    } finally {
      // Clear processing flag after a delay to allow for retries if needed
      setTimeout(() => setProcessingMemory(null), 2000);
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
    
    // Generate public link - use /verify?c= format
    const link = `${window.location.origin}/verify?c=${currentConversationId}`;
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
          // Always use /verify?c= format for all shared links
          setPublicLink(`${window.location.origin}/verify?c=${currentConversationId}`);
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
      const link = `${window.location.origin}/verify?c=${currentConversationId}`;
      setPublicLink(link);
      await updateConversationPrivacy(true, 'link');
    } else if (level === 'public') {
      setIsPublic(true);
      const link = `${window.location.origin}/verify?c=${currentConversationId}`;
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

  // Process citations in markdown - replace source links with citation placeholders
  function processCitations(md: string, evidence: EvidenceItem[]): { processed: string; citationMap: Map<string, number> } {
    if (!evidence || evidence.length === 0) {
      return { processed: md, citationMap: new Map() };
    }

    const citationMap = new Map<string, number>();
    let processed = md;

    // Remove Sources section if it exists
    processed = processed.replace(/\n\s*\*\*Sources:\*\*\s*\n[\s\S]*?(?=\n\n|\n$|$)/gi, '');
    processed = processed.replace(/\n\s*Sources:\s*\n[\s\S]*?(?=\n\n|\n$|$)/gi, '');

    // Map evidence URLs to citation indices
    evidence.forEach((item, index) => {
      if (item.link) {
        citationMap.set(item.link.toLowerCase(), index);
      }
    });

    // Replace markdown links that match evidence URLs with citation placeholders
    // Pattern: [text](url) -> text[CITATION:index]
    processed = processed.replace(/\[([^\]]+)\]\((https?[^\s)]+)\)/g, (match, text, url) => {
      const normalizedUrl = url.toLowerCase();
      const citationIndex = citationMap.get(normalizedUrl);
      if (citationIndex !== undefined) {
        return `${text}[CITATION:${citationIndex}]`;
      }
      return match; // Keep original if not in evidence
    });

    return { processed, citationMap };
  }

  // Helpers for simple markdown table detection and rendering
  function isTableRow(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length > 2;
  }

  function isTableSeparator(line: string): boolean {
    const trimmed = line.trim();
    // Matches | --- |:---:| ---: | style separators
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
  }

  function renderTableCellContent(text: string): string {
    let cell = text.trim();
    // escape basic HTML
    cell = cell.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // bold **text**
    cell = cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // links [text](url)
    cell = cell.replace(
      /\[([^\]]+)\]\((https?:[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline" style="color: var(--primary);">$1</a>'
    );
    return cell;
  }

  function renderMarkdownTable(blockLines: string[]): string {
    if (blockLines.length < 2) return blockLines.join('<br/>');
    const headerCells = blockLines[0]
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => renderTableCellContent(c));

    const bodyLines = blockLines.slice(2).filter(isTableRow);
    const bodyRows = bodyLines.map((row) =>
      row
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => renderTableCellContent(c))
    );

    let tableHtml = `<div class="my-3 -mx-2 sm:mx-0 overflow-x-auto"><table class="min-w-full text-xs sm:text-sm border-collapse">`;
    tableHtml += `<thead class="bg-gray-50"><tr>`;
    headerCells.forEach((cell) => {
      tableHtml += `<th class="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">${cell}</th>`;
    });
    tableHtml += `</tr></thead><tbody class="align-top">`;
    bodyRows.forEach((cells) => {
      tableHtml += `<tr>`;
      cells.forEach((cell) => {
        tableHtml += `<td class="px-3 py-2 border-b border-gray-100 text-gray-800 whitespace-nowrap">${cell}</td>`;
      });
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table></div>`;
    return tableHtml;
  }

  function extractTablesFromMarkdown(md: string): { text: string; tables: string[] } {
    const lines = md.split(/\r?\n/);
    const outLines: string[] = [];
    const tables: string[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const next = lines[i + 1];
      if (isTableRow(line) && next !== undefined && isTableSeparator(next)) {
        const block: string[] = [line, next];
        let j = i + 2;
        while (j < lines.length && isTableRow(lines[j])) {
          block.push(lines[j]);
          j++;
        }
        const marker = `__TABLE_BLOCK_${tables.length}__`;
        tables.push(renderMarkdownTable(block));
        outLines.push(marker);
        i = j;
      } else {
        outLines.push(line);
        i++;
      }
    }

    return { text: outLines.join('\n'), tables };
  }

  // Minimal markdown renderer for assistant messages (links, bold, lists, newlines, citations, basic tables)
  function mdToHtml(md: string, evidence?: EvidenceItem[]): string {
    if (!md) return '';

    // Process citations first
    const { processed } = evidence ? processCitations(md, evidence) : { processed: md };

    // Extract markdown tables into placeholders so we can style them separately
    const { text: withoutTables, tables } = extractTablesFromMarkdown(processed);
    let html = withoutTables;

    // escape basic HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Process citation placeholders [CITATION:index] -> render as citation
    html = html.replace(/\[CITATION:(\d+)\]/g, (match, indexStr) => {
      const index = parseInt(indexStr, 10);
      if (evidence && evidence[index]) {
        const item = evidence[index];
        return `<sup class="inline-flex items-center"><a href="${item.link || '#'}" target="_blank" rel="noopener noreferrer" class="ml-0.5 hover:underline cursor-pointer font-medium" style="color: var(--primary);" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" title="${(item.title || item.link || '').replace(/"/g, '&quot;')}">[${index + 1}]</a></sup>`;
      }
      return match;
    });

    // Regular links [text](url) - only if not already processed as citations
    html = html.replace(
      /\[([^\]]+)\]\((https?:[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline" style="color: var(--primary);" onmouseover="this.style.opacity=\'0.8\'" onmouseout="this.style.opacity=\'1\'">$1</a>'
    );
    // angle links <url>
    html = html.replace(
      /&lt;(https?:[^\s]+)&gt;/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline" style="color: var(--primary);" onmouseover="this.style.opacity=\'0.8\'" onmouseout="this.style.opacity=\'1\'">$1</a>'
    );

    // numbered lists (1. 2. 3. etc.) and bullet lists (-)
    const lines = html.split(/\r?\n/);
    let inBulletList = false;
    let inNumberedList = false;
    const out: string[] = [];
    for (const line of lines) {
      const bulletMatch = line.match(/^\s*-\s+(.*)/);
      const numberedMatch = line.match(/^\s*(\d+)\.\s+(.*)/);

      if (bulletMatch) {
        if (inNumberedList) {
          out.push('</ol>');
          inNumberedList = false;
        }
        if (!inBulletList) {
          out.push('<ul class="list-disc pl-6 my-2">');
          inBulletList = true;
        }
        out.push(`<li>${bulletMatch[1]}</li>`);
      } else if (numberedMatch) {
        if (inBulletList) {
          out.push('</ul>');
          inBulletList = false;
        }
        if (!inNumberedList) {
          out.push('<ol class="list-decimal pl-6 my-2">');
          inNumberedList = true;
        }
        out.push(`<li>${numberedMatch[2]}</li>`);
      } else {
        if (inBulletList) {
          out.push('</ul>');
          inBulletList = false;
        }
        if (inNumberedList) {
          out.push('</ol>');
          inNumberedList = false;
        }
        out.push(line);
      }
    }
    if (inBulletList) out.push('</ul>');
    if (inNumberedList) out.push('</ol>');
    // join with <br/>
    html = out.join('\n').replace(/\n/g, '<br/>');

    // Replace table placeholders with rendered HTML tables
    tables.forEach((tableHtml, index) => {
      const marker = `__TABLE_BLOCK_${index}__`;
      html = html.replace(marker, tableHtml);
    });

    return html;
  }

  // Assistant Message Component
  const AssistantMessage = ({ 
    message, 
    isLastMessage, 
    isStreaming 
  }: { 
    message: Message; 
    isLastMessage: boolean; 
    isStreaming: boolean;
  }) => {
    return (
      <>
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-900 leading-relaxed">
          <div 
            className="prose prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-gray-800 prose-strong:text-gray-900 prose-strong:font-semibold prose-a:no-underline hover:prose-a:underline prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm" 
            style={{
              '--tw-prose-links': 'var(--primary)',
              '--tw-prose-code': 'var(--primary)',
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: mdToHtml(message.content, message.evidence) }} 
          />
        </div>
        {message.evidence && message.evidence.length > 0 && (
          <>
            <Sources evidence={message.evidence} />
            <FurtherReading evidence={message.evidence} />
          </>
        )}
      </>
    );
  };

  // Show quota modal
  function showQuotaModal(remaining?: { daily: number; monthly: number; plan: string }) {
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
            <p class="text-sm" style="color: var(--muted-foreground)">Your ${remaining?.plan || 'free'} plan has reached its credit limit. Daily credits reset at midnight in your local timezone.</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <button id="quota-upgrade" class="flex-1 rounded-xl px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]" style="background: var(--primary)">Upgrade plan</button>
            <button id="quota-cancel-2" class="rounded-xl border-2 px-6 py-4 font-semibold transition-all hover:scale-[1.02]" style="border-color: var(--border); color: var(--foreground)">Maybe later</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(div);
    const close = () => {
      div.remove();
      setCreditsExhausted(false);
    };
    div.querySelector('#quota-cancel')?.addEventListener('click', close);
    div.querySelector('#quota-cancel-2')?.addEventListener('click', close);
    div.querySelector('#quota-upgrade')?.addEventListener('click', () => { window.location.href = '/pricing'; });
  }

  // Load conversations when user is authenticated
  useEffect(() => {
    if (user) {
      loadConversations();
      loadUserPlan();
      checkCredits(); // Check credits on mount
    }
  }, [user]);

  // Refresh credits when refreshKey changes
  useEffect(() => {
    if (user?.uid && creditsRefreshKey > 0) {
      checkCredits();
    }
  }, [creditsRefreshKey, user?.uid]);

  // Load conversation privacy when conversation changes
  useEffect(() => {
    if (currentConversationId && user) {
      loadConversationPrivacy();
    }
  }, [currentConversationId, user]);

  // Handle deep-linking to a conversation via ?c=CONVERSATION_ID
  useEffect(() => {
    // Allow loading even for anonymous users if conversation is shared
    if (authLoading) return;
    const c = searchParams.get('c');
    if (c && c !== currentConversationId) {
      loadMessages(c);
    }
  }, [searchParams, authLoading]);

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

  // Check credits availability
  async function checkCredits(): Promise<boolean> {
    if (!user?.uid) return true; // Allow anonymous users
    
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`/api/user-tokens?uid=${user.uid}&t=${Date.now()}&tz=${encodeURIComponent(tz)}`, { cache: 'no-store' });
      const data = await response.json();
      
      if (response.ok) {
        const planTotals: Record<string, { daily: number; monthly: number }> = {
          free: { daily: 20, monthly: 100 },
          pro: { daily: 200, monthly: 2000 },
          enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER },
        };
        const plan = data.plan || 'free';
        const totals = planTotals[plan] || planTotals.free;
        const dailyRemaining = data.tokensDaily ?? 0;
        const monthlyRemaining = data.tokensMonthly ?? 0;
        
        setCreditsData({
          daily: dailyRemaining,
          monthly: monthlyRemaining,
          plan: plan
        });
        
        // Check if credits are exhausted (need at least 1 credit for a verification)
        const hasCredits = (plan === 'enterprise') || (dailyRemaining > 0 && monthlyRemaining > 0);
        setCreditsExhausted(!hasCredits);
        
        return hasCredits;
      }
    } catch (error) {
      console.error('Failed to check credits:', error);
    }
    
    return true; // Default to allowing if check fails
  }

  // Check for pending verification from hero section (works for both logged-in and anonymous users)
  // This will be moved after onVerify is defined

  // Allow anonymous access - no redirect to login
  // Users can use Llama 3.1 without logging in (with limits)

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
    try {
      const uid = user?.uid || null;
      const url = uid 
        ? `/api/conversations/${conversationId}/messages?uid=${uid}`
        : `/api/conversations/${conversationId}/messages`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
        setCurrentConversationId(conversationId);
        setIsSharedConversation(data.isShared || false);
        
        // Load conversation metadata to get title and owner info
        try {
          const convResponse = await fetch(`/api/conversations/${conversationId}${uid ? `?uid=${uid}` : ''}`);
          const convData = await convResponse.json();
          if (convResponse.ok) {
            setConversationTitle(convData.title || null);
            // Don't store owner UID - it's not user-friendly to display
            setConversationOwner(null);
          }
        } catch (e) {
          // Silent fail for conversation metadata
        }
        
        // Update URL to reflect current conversation without full reload
        router.replace(`/verify?c=${conversationId}`);
      } else {
        setError(data.error || 'Failed to load conversation');
      }
    } catch (error) {
      setError('Failed to load conversation');
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

  const onVerify = async (inputText: string, model?: string, imageFiles?: File[], regenerate?: boolean) => {
    if (!inputText || !inputText.trim()) {
      return;
    }
    
    // If viewing a shared conversation, create a new conversation to continue
    if (isSharedConversation && !regenerate) {
      try {
        // Create a new conversation based on the shared one
        const continueResponse = await fetch('/api/conversations/continue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceConversationId: currentConversationId,
            title: `Continued: ${conversationTitle || 'Shared Conversation'}`,
            uid: user?.uid || null
          })
        });

        if (continueResponse.ok) {
          const data = await continueResponse.json();
          const newConversationId = data.id;
          setCurrentConversationId(newConversationId);
          setIsSharedConversation(false);
          setConversationOwner(null);
          // Copy messages to new conversation
          setMessages([...messages]);
          // Update URL
          router.replace(`/verify?c=${newConversationId}`);
          // Reload conversations if user is logged in
          if (user) {
            await loadConversations();
          }
        } else {
          setError('Failed to continue conversation. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error continuing conversation:', error);
        setError('Failed to continue conversation. Please try again.');
        return;
      }
    }
    
    // Check credits before proceeding (for logged-in users)
    if (user?.uid) {
      const hasCredits = await checkCredits();
      if (!hasCredits) {
        setError('You have exhausted your daily or monthly credit limit. Please upgrade your plan or wait for credits to reset.');
        return;
      }
    }
    
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
      timestamp: new Date(),
      model: model // Store the model with the user message
    };
    
    // Build conversation history from previous messages BEFORE adding current user message
    // This ensures we don't duplicate the current message in history
    // Format: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
    let conversationHistory: Array<{ role: string; content: string }> = [];
    if (messages.length > 0) {
      // If regenerating, exclude the last assistant message since we're regenerating it
      const messagesToInclude = regenerate 
        ? messages.slice(0, -1) // Remove last message (assistant response being regenerated)
        : messages;
      
      // Convert messages to history format, limit to last 20 messages to avoid token limits
      conversationHistory = messagesToInclude
        .slice(-20)
        .map(m => ({
          role: m.role,
          content: m.content
        }))
        .filter(m => m.role === 'user' || m.role === 'assistant'); // Only include user and assistant messages
    }
    
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

      // Building lightweight context from recent turns to help follow-ups
      const recent = messages.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

      // If user selected a chat model (llama, gpt-oss), route to unified /api/chat
      const chatModelIds = ['llama', 'gpt-oss'];
      const isChatModel = chatModelIds.some(id => (model || '').toLowerCase().includes(id));
      if (isChatModel) {
        const chatModel = model || 'llama-3.3-70b-or';
        // Tracking the model used for regenerate functionality
        setLastUsedModel(chatModel);
        
        // When regenerating, adding a unique identifier to force fresh response
        // This ensures that the model generates a new response instead of returning the cached results
        const chatMessage = regenerate 
          ? `${inputText} [regenerate:${Date.now()}]`
          : inputText;
        
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: chatMessage, 
            userId: user?.uid || 'demo', 
            history: conversationHistory, 
            model: chatModel,
            regenerate: regenerate || false
          }),
        });
        const chatJson = await chatRes.json();
        
        // Handle anonymous chat limit
        if (chatRes.status === 429 && chatJson.error === 'limit_reached') {
          setError(chatJson.message || 'You\'ve reached the free chat limit. Please sign in to continue.');
          setShowLoginWarning(true);
          setLoading(false);
          return;
        }
        
        // Handle quota errors from /api/chat
        if (chatRes.status === 402 && chatJson?.error === 'quota') {
          setLoading(false);
          setCreditsExhausted(true);
          if (chatJson.remaining) {
            setCreditsData({
              daily: chatJson.remaining.daily || 0,
              monthly: chatJson.remaining.monthly || 0,
              plan: chatJson.remaining.plan || 'free'
            });
          }
          // Refresh credits to update UI
          setCreditsRefreshKey(prev => prev + 1);
          showQuotaModal(chatJson.remaining);
          return;
        }
        
        if (!chatRes.ok) throw new Error(chatJson?.error || 'Chat failed');

        // Update anonymous chat info if present (for anonymous users)
        if (chatJson.anonymousChatCount !== undefined) {
          setAnonymousChatInfo({
            count: chatJson.anonymousChatCount,
            limit: chatJson.anonymousChatLimit || 10,
            remaining: chatJson.remaining || 0,
            showWarning: chatJson.showWarning || false
          });
          // Show warning banner if threshold reached
          if (chatJson.showWarning) {
            setShowLoginWarning(true);
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: String(chatJson.result || ''),
          timestamp: new Date(),
          model: chatModel, // Store the model used for this response
          evidence: chatJson.evidence || [] // Store evidence for citations
        };
        
        // Replace last assistant message if regenerating, otherwise add new one
        if (regenerate) {
          setMessages(prev => {
            // Find the last assistant message index in the current state
            const lastAssistantIdx = [...prev].map((m, idx) => ({m, idx})).reverse().find(x => x.m.role === 'assistant')?.idx;
            if (lastAssistantIdx !== undefined) {
              // Replace the message at that index, preserving the original ID
              return prev.map((m, idx) => idx === lastAssistantIdx ? { ...assistantMessage, id: m.id } : m);
            }
            // If no assistant message found, just add the new one (shouldn't happen)
            return [...prev, assistantMessage];
          });
        } else {
          setMessages(prev => [...prev, assistantMessage]);
        }
        await processAutoMemories(inputText, assistantMessage.content);
        
        // Refresh credit balance after successful chat verification
        setCreditsRefreshKey(prev => prev + 1);
        // Re-check credits to update exhausted state
        if (user?.uid) {
          await checkCredits();
        }
        
        if (targetConversationId && user) {
          if (regenerate) {
            // Update last assistant message in DB when regenerating
            // Find the last assistant message to get its ID
            const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
            if (lastAssistant) {
              await fetch(`/api/conversations/${targetConversationId}/messages`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: user.uid,
                  messageId: lastAssistant.id,
                  content: assistantMessage.content
                })
              });
            }
          } else {
            // Add new message to DB
            await fetch(`/api/conversations/${targetConversationId}/messages`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid: user.uid, message: assistantMessage })
            });
          }
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

      // Timeline SSE is no longer needed - OpenAI Agent Builder has its own timeline
      // Removed HuggingFace stream endpoint

      // Prepare memories context
      const memoriesContext = memories.length > 0 
        ? `\n\nRelevant memories about this user:\n${memories.map(m => `- ${m.content}`).join('\n')}`
        : '';

      // Ensure model is explicitly set to OpenAI Agent Builder if not provided
      const selectedModel = model || 'openai-agent-builder';
      console.log('Sending verification request with model:', selectedModel);
      
      // Track the model used for regenerate functionality
      setLastUsedModel(selectedModel);
      
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
          regenerate: regenerate || false, // Pass regenerate flag to API
          model: selectedModel,
          imageBase64Array: imageBase64Array
        })
      });
      const j = await r.json();
      
      if (r.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: (j.messageMarkdown as string) || `**Verdict:** ${j.verdict}\n**Confidence:** ${j.confidence}%\n\n**Why:**\n${j.explanation}`,
          timestamp: new Date(),
          model: selectedModel // Store the model used for this response
        };
        
        // Replace last assistant message if regenerating, otherwise add new one
        if (regenerate) {
          setMessages(prev => {
            // Find the last assistant message index in the current state
            const lastAssistantIdx = [...prev].map((m, idx) => ({m, idx})).reverse().find(x => x.m.role === 'assistant')?.idx;
            if (lastAssistantIdx !== undefined) {
              // Replace the message at that index, preserving the original ID
              return prev.map((m, idx) => idx === lastAssistantIdx ? { ...assistantMessage, id: m.id } : m);
            }
            // If no assistant message found, just add the new one (shouldn't happen)
            return [...prev, assistantMessage];
          });
        } else {
          setMessages(prev => [...prev, assistantMessage]);
        }
        
        // Process auto-memories after AI response
        await processAutoMemories(inputText, assistantMessage.content);
        
        // Save assistant message to conversation
        if (targetConversationId && user) {
          if (regenerate) {
            // Update last assistant message in DB when regenerating
            // Find the last assistant message to get its ID
            const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
            if (lastAssistant) {
              await fetch(`/api/conversations/${targetConversationId}/messages`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: user.uid,
                  messageId: lastAssistant.id,
                  content: assistantMessage.content
                })
              });
            }
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
      
      // Refresh credit balance after successful verification
      setCreditsRefreshKey(prev => prev + 1);
      // Re-check credits to update exhausted state
      if (user?.uid) {
        await checkCredits();
      }
      
      // Clear timeline when verification completes
      setTimeline([]);
    } else {
        if (r.status === 402 && j?.error === 'quota') {
          setLoading(false);
          setCreditsExhausted(true);
          if (j.remaining) {
            setCreditsData({
              daily: j.remaining.daily || 0,
              monthly: j.remaining.monthly || 0,
              plan: j.remaining.plan || 'free'
            });
          }
          // Refresh credits to update UI
          setCreditsRefreshKey(prev => prev + 1);
          showQuotaModal(j.remaining);
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
  };
  
  
  // Check for pending verification from hero section (works for both logged-in and anonymous users)
  useEffect(() => {
    if (!authLoading) {
      const pendingVerification = sessionStorage.getItem('pendingVerification');
        if (pendingVerification) {
          sessionStorage.removeItem('pendingVerification');
          try {
            const data = JSON.parse(pendingVerification);
            // Ensure we have valid input before calling onVerify
            if (data && data.input && typeof data.input === 'string' && data.input.trim()) {
              onVerify(data.input, data.model, data.imageFiles);
            }
          } catch (error) {
            // If parsing fails, check if it's a plain string (old format)
            if (typeof pendingVerification === 'string' && pendingVerification.trim()) {
              onVerify(pendingVerification);
            }
          }
        }
    }
  }, [authLoading, onVerify]);
  
  // Listen for hero section submissions when already on verify page
  useEffect(() => {
    const handleHeroVerify = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { input, model, imageFiles } = customEvent.detail;
      onVerify(input, model, imageFiles);
    };
    
    window.addEventListener('heroVerifySubmit', handleHeroVerify);
    
    return () => {
      window.removeEventListener('heroVerifySubmit', handleHeroVerify);
    };
  }, [onVerify]);

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
    
    // Find the last assistant message (the one we're regenerating) to get the model used
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    
    // Get the model from the last assistant message (what we're regenerating),
    // or from the last user message, or fallback to lastUsedModel
    const modelToUse = lastAssistant?.model || lastUser.model || lastUsedModel;
    
    console.log('Regenerate - Model lookup:', {
      lastAssistantModel: lastAssistant?.model,
      lastUserModel: lastUser.model,
      lastUsedModel: lastUsedModel,
      finalModel: modelToUse
    });
    
    await onVerify(lastUser.content, modelToUse, undefined, true);
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
    // Get the model from the edited message, or fallback to lastUsedModel
    const messageToEdit = messages.find(m => m.id === editingMessageId);
    const modelToUse = messageToEdit?.model || lastUsedModel;
    await onVerify(editingContent.trim(), modelToUse, undefined, true);
    
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

  // Allow anonymous access - no redirect to login
  // Users can use Llama 3.1 without logging in (with limits)

  return (
    <div className="h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Anonymous User Warning Banner */}
      {showLoginWarning && !user && anonymousChatInfo && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {anonymousChatInfo.remaining > 0 
                      ? `You've used ${anonymousChatInfo.count} of ${anonymousChatInfo.limit} free chats. ${anonymousChatInfo.remaining} remaining.`
                      : `You've reached the free chat limit.`
                    }
                    {' '}
                    <Link href="/login" className="underline font-semibold hover:text-amber-100">
                      Sign in
                    </Link>
                    {' '}to continue using Llama 3.1 without limits.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginWarning(false)}
                className="ml-4 flex-shrink-0 rounded-md p-1.5 text-white hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
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
        {/* Mobile Sidebar Overlay - Hidden for anonymous users */}
        {sidebarOpen && user && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        

        {/* Mobile Sidebar - Hidden for anonymous users */}
        {user && (
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
              onClick={() => { setShowSettingsModal(true); }}
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
        )}

        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle - Hidden for anonymous users */}
            {user && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <img src="/Images/sidebar-toggle-nav-side-aside-svgrepo-com.svg" alt="Toggle Sidebar" className="h-5 w-5" />
              </button>
            )}
            <img src="/Images/Fakeverifier-official-logo.png" alt="FakeVerifier Official Logo" className="h-8" />
          </div>
          <div className="flex items-center gap-2">
            {/* Share Icon - Only show for logged-in users when there's a conversation with messages */}
            {user && currentConversationId && messages.length > 0 && (
              <button 
                onClick={generateShareLink}
                className="rounded-lg p-2 hover:bg-gray-100"
                title="Share conversation"
              >
                <Share className="h-5 w-5 text-gray-500" />
              </button>
            )}
            
            {/* Login and Sign up buttons for anonymous users - replacing three dots */}
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign up for free
                </Link>
              </div>
            ) : (
              /* Three Dots Dropdown - only for logged-in users */
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
            )}
          </div>
        </div>

        {/* Mobile Main Content */}
        <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">
          {/* Shared Conversation Banner */}
          {isSharedConversation && (
            <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
              <div className="mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <div className="bg-white rounded-lg border border-blue-200 px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm">
                  <div className="flex items-start gap-2 sm:gap-2.5">
                    <Share className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <span className="text-[11px] sm:text-xs font-semibold text-blue-900">Shared Conversation</span>
                        <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">View Only</span>
                      </div>
                      {conversationTitle && (
                        <p className="text-[11px] sm:text-xs text-blue-700 mb-1 sm:mb-1.5 break-words line-clamp-1">
                          <span className="font-medium">{conversationTitle}</span>
                        </p>
                      )}
                      <p className="text-[10px] sm:text-[11px] text-blue-600 leading-tight sm:leading-snug">
                        Send a message to continue this conversation in your own chat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="grid h-full place-items-center">
                <div className="text-center max-w-full px-4">
                  {user ? (
                    <>
                      {/* Personalized Welcome for Logged-in Users */}
                      <div className="mb-6 flex justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user?.name || 'User'} 
                            className="h-16 w-16 rounded-full object-cover ring-4 ring-gray-100 shadow-lg"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-4 ring-gray-100 shadow-lg">
                            <span className="text-2xl font-bold text-white">
                              {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <h2 className="mb-2 text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}! 👋
                      </h2>
                      <p className="mb-4 text-base text-gray-700">
                        Ready to verify something? Paste a URL or text below and I'll help you check its authenticity.
                      </p>
                      <div className="mx-auto mt-6 max-w-md rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-700 mb-2">💡 Quick tip:</p>
                        <p className="text-xs text-gray-600">
                          You can verify news articles, social media posts, websites, or any text content. Just paste it in the input below!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Default for Anonymous Users */}
                  <h2 className="mb-2 text-xl font-bold text-gray-900">Start a verification</h2>
                  <p className="text-sm text-gray-600">Paste a URL or text to verify its authenticity</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              messages.map((m, index) => (
                <div key={m.id} className="flex w-full justify-center px-3 sm:px-4 py-3 sm:py-4">
                  <div className="w-full max-w-3xl flex gap-3 sm:gap-4">
                    {m.role === 'assistant' ? (
                      <div className="group flex gap-3 sm:gap-4 w-full">
                        {/* Message content - plain text without container */}
                        <div className="flex-1 min-w-0 pl-2 sm:pl-3">
                          <div className="py-1">
                            <AssistantMessage 
                              message={m} 
                              isLastMessage={index === messages.length - 1} 
                              isStreaming={loading}
                            />
                          </div>
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              onClick={() => onFeedback(m.id, 'up')} 
                              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => onFeedback(m.id, 'down')} 
                              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                            <div className="mx-1 h-3 w-px bg-gray-300" />
                            <button 
                              onClick={() => onCopy(m.content)} 
                              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            {user && (
                              <button 
                                onClick={() => onShare(m.content)} 
                                className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                title="Share"
                              >
                                <Share className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button 
                              onClick={onRegenerate} 
                              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              title="Regenerate"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {/* Feedback tray */}
                          {feedbackForMessageId === m.id && (
                            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm">
                              <div className="mb-3 text-sm font-semibold text-gray-900">Tell us more:</div>
                              <div className="flex flex-wrap gap-2 mb-4">
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
                                    className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <input 
                                  id={`note-mobile-${m.id}`} 
                                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all" 
                                  placeholder="Optional note (max 120 chars)" 
                                  maxLength={120} 
                                />
                                <button
                                  disabled={feedbackSubmitting}
                                  onClick={async () => {
                                    const inputEl = document.getElementById(`note-mobile-${m.id}`) as HTMLInputElement | null;
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
                                  className="rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                >
                                  Send
                                </button>
                                <button
                                  disabled={feedbackSubmitting}
                                  onClick={() => setFeedbackForMessageId(null)}
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="group flex gap-3 sm:gap-4 w-full justify-end">
                        {/* Message content on right */}
                        <div className="flex-1 min-w-0 flex justify-end">
                          <div className="max-w-[85%] sm:max-w-[80%]">
                            {editingMessageId === m.id ? (
                              // Edit mode - ChatGPT style
                              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="w-full rounded-t-xl border-0 bg-transparent p-4 text-sm sm:text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none"
                                  rows={Math.max(3, Math.ceil(editingContent.split('\n').length))}
                                  placeholder="Edit your message..."
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100">
                                  <button
                                    onClick={cancelMessageEditing}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={saveEdit}
                                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
                                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                  >
                                    Save & Regenerate
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="rounded-2xl rounded-tr-sm p-4 sm:p-5 shadow-sm transition-all duration-200" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                                  <div className="text-sm sm:text-base leading-relaxed text-white whitespace-pre-wrap">{m.content}</div>
                                </div>
                                {/* Hover actions */}
                                <div className="flex items-center gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => startEditing(m.id, m.content)}
                                    className="rounded-md p-1.5 hover:bg-gray-100 transition-colors"
                                    title="Edit message"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => onCopy(m.content)}
                                    className="rounded-md p-1.5 hover:bg-gray-100 transition-colors"
                                    title="Copy message"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-gray-600" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Avatar on right */}
                        <div className="flex-shrink-0">
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-300">
                            <span className="text-xs sm:text-sm font-semibold text-gray-700">U</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex w-full justify-center px-3 sm:px-4 py-3 sm:py-4">
                <div className="w-full max-w-3xl flex gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0 pl-2 sm:pl-3">
                    <div className="py-1">
                      <AILoadingState />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Composer */}
          <div className="border-t border-gray-200 px-4 py-4 overflow-hidden">
            <div className="w-full max-w-2xl mx-auto">
              {creditsExhausted && user && (
                <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50/50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-orange-900 font-medium">
                        Credits exhausted
                      </span>
                      <span className="text-xs text-orange-700/80">
                        {creditsData?.plan === 'free' ? 'Daily' : 'Daily/monthly'} limit reached
                        {creditsData?.plan !== 'enterprise' && ' • Resets at midnight'}
                      </span>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="ml-auto px-2.5 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors shadow-sm hover:shadow"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <AI_Prompt 
                onSend={onVerify}
                placeholder={creditsExhausted && user ? "Credits exhausted - upgrade to continue" : "What's in your mind?..."}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-screen w-screen bg-gray-100 p-4">
        <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Left Sidebar - Hidden for anonymous users */}
           {user && (
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
              onClick={() => { setShowSettingsModal(true); }}
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
                      <InlineCredits uid={user?.uid} refreshKey={creditsRefreshKey} />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserDropdownOpen(false);
                          router.push('/pricing');
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                      >
                        <Crown className="h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserDropdownOpen(false);
                          setShowSettingsModal(true);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
        )}

           {/* Main */}
           <main className={`relative flex min-w-0 flex-1 flex-col bg-white ${user && sidebarOpen ? 'border-l border-gray-200' : ''} overflow-hidden transition-all duration-300`}>
            {/* Chat header (title row) */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                {/* Sidebar toggle - Hidden for anonymous users */}
                {user && !sidebarOpen && (
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
                {/* Share Icon - Only show for logged-in users when there's a conversation with messages */}
                {user && currentConversationId && messages.length > 0 && (
                  <button 
                    onClick={generateShareLink}
                    className="rounded-lg p-2 hover:bg-gray-100"
                    title="Share conversation"
                  >
                    <Share className="h-5 w-5 text-gray-500" />
                  </button>
                )}
                
                {/* Login and Sign up buttons for anonymous users - replacing three dots */}
                {!user ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign up for free
                    </Link>
                  </div>
                ) : (
                  /* Three Dots Dropdown - only for logged-in users */
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
                )}
              </div>
      </div>
      
            {/* Shared Conversation Banner */}
            {isSharedConversation && (
              <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
                <div className="mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                  <div className="bg-white rounded-lg border border-blue-200 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 shadow-sm">
                    <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                      <Share className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-blue-900">Shared Conversation</span>
                          <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] md:text-xs font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">View Only</span>
                        </div>
                        {conversationTitle && (
                          <p className="text-[11px] sm:text-xs md:text-sm text-blue-700 mb-1 sm:mb-1.5 break-words line-clamp-1">
                            <span className="font-medium">{conversationTitle}</span>
                          </p>
                        )}
                        <p className="text-[10px] sm:text-[11px] md:text-xs text-blue-600 leading-tight sm:leading-snug">
                          Send a message to continue this conversation in your own chat.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
                <div className="grid h-full place-items-center">
              <div className="text-center px-4 max-w-2xl">
                    {user ? (
                      <>
                        {/* Personalized Welcome for Logged-in Users */}
                        <div className="mb-8 flex justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user?.name || 'User'} 
                              className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-100 shadow-lg transition-transform hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-4 ring-gray-100 shadow-lg transition-transform hover:scale-105">
                              <span className="text-3xl font-bold text-white">
                                {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <h2 className="mb-3 text-3xl sm:text-4xl font-bold text-gray-900">
                          Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}! 👋
                        </h2>
                        <p className="mb-6 text-lg sm:text-xl text-gray-700 max-w-xl mx-auto">
                          Ready to verify something? Paste a URL or text below and I'll help you check its authenticity with real-time fact-checking.
                        </p>
                        <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 shadow-md">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                              <span className="text-xl">💡</span>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-gray-900 mb-2">Quick tip for you:</p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                You can verify news articles, social media posts, websites, or any text content. Just paste it in the input below and I'll analyze it with multiple sources!
                              </p>
                            </div>
                          </div>
                        </div>
                        {userPlan && userPlan !== 'free' && (
                          <div className="mt-6 mx-auto max-w-lg">
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 py-2">
                              <span className="text-sm font-medium text-blue-700">
                                ✨ {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan Active
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Default for Anonymous Users */}
                    <h2 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">Start a verification</h2>
                    <p className="text-sm sm:text-base text-gray-600">Paste a URL or text to verify its authenticity</p>
                      </>
                    )}
              </div>
            </div>
          ) : (
                messages.map((m, index) => (
                  <div key={m.id} className="flex w-full justify-center px-4 sm:px-6 py-4">
                    <div className="w-full max-w-3xl flex gap-4">
                      {m.role === 'assistant' ? (
                        <div className="group flex gap-4 w-full">
                          {/* Message content - plain text without container */}
                          <div className="flex-1 min-w-0 pl-3">
                            <div className="py-1">
                              <AssistantMessage 
                                message={m} 
                                isLastMessage={index === messages.length - 1} 
                                isStreaming={loading}
                              />
                            </div>
                            {/* Action buttons */}
                            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={() => onFeedback(m.id, 'up')} 
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => onFeedback(m.id, 'down')} 
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                              <div className="mx-1 h-3 w-px bg-gray-300" />
                              <button 
                                onClick={() => onCopy(m.content)} 
                                className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                title="Copy"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              {user && (
                                <button 
                                  onClick={() => onShare(m.content)} 
                                  className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                  title="Share"
                                >
                                  <Share className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={onRegenerate} 
                                className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                title="Regenerate"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {/* Feedback tray */}
                            {feedbackForMessageId === m.id && (
                              <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm">
                                <div className="mb-3 text-sm font-semibold text-gray-900">Tell us more:</div>
                                <div className="flex flex-wrap gap-2 mb-4">
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
                                      className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input 
                                    id={`note-desktop-${m.id}`} 
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all" 
                                    placeholder="Optional note (max 120 chars)" 
                                    maxLength={120} 
                                  />
                                  <button
                                    disabled={feedbackSubmitting}
                                    onClick={async () => {
                                      const inputEl = document.getElementById(`note-desktop-${m.id}`) as HTMLInputElement | null;
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
                                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                  >
                                    Send
                                  </button>
                                  <button
                                    disabled={feedbackSubmitting}
                                    onClick={() => setFeedbackForMessageId(null)}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="group flex gap-4 w-full justify-end">
                          {/* Message content on right */}
                          <div className="flex-1 min-w-0 flex justify-end">
                            <div className="max-w-[85%] lg:max-w-[80%]">
                              {editingMessageId === m.id ? (
                                // Edit mode - ChatGPT style
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                  <textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="w-full rounded-t-xl border-0 bg-transparent p-4 text-sm lg:text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none"
                                    rows={Math.max(3, Math.ceil(editingContent.split('\n').length))}
                                    placeholder="Edit your message..."
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100">
                                    <button
                                      onClick={cancelMessageEditing}
                                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={saveEdit}
                                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
                                      style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                    >
                                      Save & Regenerate
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="rounded-2xl rounded-tr-sm p-5 lg:p-6 shadow-sm transition-all duration-200" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                                    <div className="text-sm lg:text-base leading-relaxed text-white whitespace-pre-wrap">{m.content}</div>
                                  </div>
                                  {/* Hover actions */}
                                  <div className="flex items-center gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                      onClick={() => startEditing(m.id, m.content)}
                                      className="rounded-md p-1.5 hover:bg-gray-100 transition-colors"
                                      title="Edit message"
                                    >
                                      <Edit className="h-3.5 w-3.5 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={() => onCopy(m.content)}
                                      className="rounded-md p-1.5 hover:bg-gray-100 transition-colors"
                                      title="Copy message"
                                    >
                                      <Copy className="h-3.5 w-3.5 text-gray-600" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          {/* Avatar on right */}
                          <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                              <span className="text-sm font-semibold text-gray-700">U</span>
                            </div>
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
            <div className="flex w-full justify-center px-4 sm:px-6 py-4">
              <div className="w-full max-w-3xl flex gap-4">
                <div className="flex-1 min-w-0 pl-3">
                  <div className="py-1">
                    <AILoadingState />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
            {/* Composer */}
            <div className="px-6 py-5">
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 max-w-2xl mx-auto">{error}</div>
              )}
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  {creditsExhausted && user && (
                    <div className="mb-3 sm:mb-4 rounded-lg border border-orange-200 bg-orange-50/50 p-3 sm:p-3.5 md:p-3">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <AlertTriangle className="h-4 w-4 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm text-orange-900 font-medium">
                            Credits exhausted
                          </span>
                          <span className="text-xs sm:text-sm text-orange-700/80">
                            {creditsData?.plan === 'free' ? 'Daily' : 'Daily/monthly'} limit reached
                            {creditsData?.plan !== 'enterprise' && ' • Resets at midnight'}
                          </span>
                          <button
                            onClick={() => window.location.href = '/pricing'}
                            className="ml-auto px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors shadow-sm hover:shadow"
                          >
                            Upgrade
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-5">
                    <AI_Prompt 
                      onSend={onVerify}
                      placeholder={creditsExhausted && user ? "Credits exhausted - upgrade to continue" : "What's in your mind?..."}
                      className="w-full"
                    />
                  </div>
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
                  value={publicLink || ''}
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

      {/* Settings Modal */}
      <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

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
                    value={publicLink || ''}
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
