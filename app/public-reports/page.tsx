'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, User, Eye, ThumbsUp, ThumbsDown, Share, Copy, CheckCircle2, XCircle, AlertTriangle, Clock, Sparkles, TrendingUp, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

interface PublicReport {
  id: string;
  title: string;
  content: string;
  verdict: 'Likely Real' | 'Likely Fake' | 'Mixed' | 'Unverified';
  confidence: number;
  createdAt: string;
  author: string;
  views: number;
  likes: number;
  dislikes: number;
  tags: string[];
  sources: Array<{
    name: string;
    url: string;
  }>;
  evidence?: string[];
  explanation?: string;
}


// Helper function for relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}

// Skeleton loader component
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg mb-3 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}

// Report Card Component - v0.dev Style
function ReportCard({ report, onInteraction, onShare }: { 
  report: PublicReport; 
  onInteraction: (id: string, action: 'like' | 'dislike') => void;
  onShare: (report: PublicReport) => void;
}) {
  const router = useRouter();
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'Likely Real':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          iconColor: 'text-green-600',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-800'
        };
      case 'Likely Fake':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          iconColor: 'text-red-600',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-800'
        };
      case 'Mixed':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          badgeBg: 'bg-yellow-100',
          badgeText: 'text-yellow-800'
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-800'
        };
    }
  };

  const config = getVerdictConfig(report.verdict);
  const VerdictIcon = config.icon;
  const authorInitials = report.author?.charAt(0)?.toUpperCase() || 'A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
      style={{ borderColor: 'var(--border)' }}
      onClick={(e) => {
        // Only navigate if clicking on non-interactive areas
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('.hover-overlay')) {
          router.push(`/public-reports/${report.id}`);
        }
      }}
    >
      {/* Hover Overlay with View Detail Button */}
      <div className="hover-overlay absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/public-reports/${report.id}`);
          }}
          className="px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:scale-105 transition-transform"
          style={{ 
            background: 'var(--primary)', 
            color: 'var(--primary-foreground)'
          }}
        >
          View Detail
        </button>
      </div>
      {/* Premium Header with Verdict Badge */}
      <div className={`${config.bgColor} ${config.borderColor} border-b px-5 py-4 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)' }}></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.badgeBg}`}>
              <VerdictIcon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <span className={`font-bold text-base ${config.textColor}`}>{report.verdict}</span>
              <div className={`px-2.5 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText} text-xs font-semibold mt-1 inline-block`}>
                {report.confidence}% Confidence
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Card Content */}
      <div className="p-5">
        {/* Dynamic Title */}
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-base sm:text-lg">
          {report.title || 'Untitled Verification'}
        </h3>

        {/* Preview Content */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {report.content}
        </p>

        {/* Analysis Section Toggle */}
        {(report.evidence && report.evidence.length > 0) || report.explanation ? (
          <div className="mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAnalysis(!showAnalysis);
              }}
              className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analysis</span>
              {showAnalysis ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showAnalysis && (
              <div className="mt-3 p-3 rounded-lg border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                {report.explanation && (
                  <p className="text-xs text-gray-700 mb-2">{report.explanation}</p>
                )}
                {report.evidence && report.evidence.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-800 mb-1">Evidence:</p>
                    {report.evidence.slice(0, 2).map((evidence, idx) => (
                      <p key={idx} className="text-xs text-gray-600 line-clamp-2">• {evidence}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Author Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {authorInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{report.author || 'Anonymous'}</p>
            <p className="text-[10px] text-gray-500">{getRelativeTime(report.createdAt)}</p>
          </div>
        </div>

        {/* Premium Stats Bar with Likes/Dislikes */}
        <div className="flex items-center justify-between text-xs mb-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{report.views}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInteraction(report.id, 'like');
              }}
              className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{report.likes}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInteraction(report.id, 'dislike');
              }}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{report.dislikes}</span>
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(report);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-gray-500 hover:text-blue-600"
          >
            <Share className="h-4 w-4" />
          </button>
        </div>

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {report.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                {tag}
              </span>
            ))}
            {report.tags.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] text-gray-500">
                +{report.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PublicReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        verdict: selectedVerdict,
        sortBy: sortBy,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/public-reports?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setReports(data.reports || []);
        setPagination(data.pagination || pagination);
      } else {
        console.error('Failed to fetch reports:', data.error);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Load reports on component mount and when filters change
  useEffect(() => {
    fetchReports();
  }, [selectedVerdict, sortBy, pagination.page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchReports();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle report interactions
  const handleInteraction = async (reportId: string, action: 'like' | 'dislike') => {
    try {
      const response = await fetch(`/api/public-reports/${reportId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: 'anonymous' })
      });

      if (response.ok) {
        const data = await response.json();
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, likes: data.likes, dislikes: data.dislikes }
            : report
        ));
      }
    } catch (error) {
      console.error('Failed to update interaction:', error);
    }
  };

  const handleShare = async (report: PublicReport) => {
    const shareUrl = `${window.location.origin}/verify?c=${report.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    } catch (e) {
      console.error('Failed to copy link');
    }
  };

  const verdictOptions = [
    { value: 'all', label: 'All' },
    { value: 'likely-real', label: 'Real' },
    { value: 'likely-fake', label: 'Fake' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'unverified', label: 'Unverified' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'most-viewed', label: 'Most Viewed' },
    { value: 'highest-confidence', label: 'Highest Confidence' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Hero Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 sm:pb-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: 'var(--primary)' }} />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Community Showcase
              </h1>
            </div>
            <p className="text-base sm:text-lg mt-2 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Discover verified fact-checks and verifications from our community
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <TrendingUp className="h-4 w-4" />
              <span>{pagination.total} public verifications</span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ 
                  background: 'var(--background)', 
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
                placeholder="Search verifications..."
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-xs font-medium mr-2" style={{ color: 'var(--muted-foreground)' }}>Verdict:</span>
              {verdictOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedVerdict(option.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedVerdict === option.value
                      ? 'text-white'
                      : 'border'
                  }`}
                  style={
                    selectedVerdict === option.value
                      ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                      : { 
                          borderColor: 'var(--border)', 
                          color: 'var(--foreground)',
                          background: 'var(--card)'
                        }
                  }
                >
                  {option.label}
                </button>
              ))}
              
              <span className="text-xs font-medium mx-2" style={{ color: 'var(--muted-foreground)' }}>Sort:</span>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    sortBy === option.value
                      ? 'text-white'
                      : 'border'
                  }`}
                  style={
                    sortBy === option.value
                      ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                      : { 
                          borderColor: 'var(--border)', 
                          color: 'var(--foreground)',
                          background: 'var(--card)'
                        }
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--muted)' }}>
              <Search className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No verifications found</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedVerdict('all');
                setSortBy('newest');
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ 
                background: 'var(--primary)', 
                color: 'var(--primary-foreground)'
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onInteraction={handleInteraction}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    borderColor: 'var(--border)', 
                    color: 'var(--foreground)',
                    background: 'var(--card)'
                  }}
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          pagination.page === pageNum
                            ? 'text-white'
                            : 'border'
                        }`}
                        style={
                          pagination.page === pageNum
                            ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                            : { 
                                borderColor: 'var(--border)', 
                                color: 'var(--foreground)',
                                background: 'var(--card)'
                              }
                        }
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    borderColor: 'var(--border)', 
                    color: 'var(--foreground)',
                    background: 'var(--card)'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
