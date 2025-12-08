'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Eye, ThumbsUp, ThumbsDown, User, MessageCircle, Send, ChevronDown, ChevronUp, Bookmark, Heart, Share2, Copy, X, Facebook, Twitter } from 'lucide-react';

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

interface Comment {
  id: string;
  content: string;
  author: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  replies?: Comment[];
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

export default function PublicReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const reportId = params.id as string;
  
  const [report, setReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showRepliesMap, setShowRepliesMap] = useState<{ [key: string]: boolean }>({});

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/public-reports/${reportId}`);
        if (response.ok) {
          const data = await response.json();
          setReport(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load report');
        }
      } catch (err) {
        setError('Failed to load report');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const response = await fetch(`/api/public-reports/${reportId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    if (reportId) {
      fetchComments();
    }
  }, [reportId]);

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = user?.name || user?.email?.split('@')[0] || 'Anonymous';
    const userId = user?.uid || 'anonymous';

    try {
      const response = await fetch(`/api/public-reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          author: authorName,
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const authorName = user?.name || user?.email?.split('@')[0] || 'Anonymous';
    const userId = user?.uid || 'anonymous';

    try {
      const response = await fetch(`/api/public-reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText,
          author: authorName,
          parentId: commentId,
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: [...(comment.replies || []), data] }
            : comment
        ));
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  // Handle comment interaction
  const handleCommentInteraction = async (commentId: string, action: 'like' | 'dislike', isReply: boolean = false, parentId?: string) => {
    try {
      const response = await fetch(`/api/public-reports/${reportId}/comments/${commentId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        if (isReply && parentId) {
          setComments(prev => prev.map(comment =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: comment.replies?.map(reply =>
                    reply.id === commentId
                      ? { ...reply, likes: data.likes, dislikes: data.dislikes }
                      : reply
                  )
                }
              : comment
          ));
        } else {
          setComments(prev => prev.map(comment =>
            comment.id === commentId
              ? { ...comment, likes: data.likes, dislikes: data.dislikes }
              : comment
          ));
        }
      }
    } catch (error) {
      console.error('Failed to update comment interaction:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
          <a href="/public-reports" className="text-blue-600 hover:underline">Back to Public Reports</a>
        </div>
      </div>
    );
  }

  const handleShare = async (platform: string) => {
    const url = `${window.location.origin}/public-reports/${reportId}`;
    const title = report?.title || 'Public Verification';
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
  };

  const config = getVerdictConfig(report.verdict);
  const VerdictIcon = config.icon;
  const authorInitials = report.author?.charAt(0)?.toUpperCase() || 'A';
  const formattedDate = new Date(report.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - White Background */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-6">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <button
              onClick={() => router.push('/public-reports')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Public Reports
            </button>
            <span className="text-sm text-gray-400 mx-2">/</span>
            <span className="text-sm text-gray-900 font-medium">{report.title || 'Verification'}</span>
          </div>

          {/* Title and Author Info */}
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{report.title || 'Untitled Verification'}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {authorInitials}
                  </div>
                  <span className="text-sm text-gray-700">{report.author || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{report.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{report.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bookmark className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => router.push(`/verify?c=${reportId}`)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{ 
                  background: 'var(--primary)', 
                  color: 'var(--primary-foreground)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <span>Open in FakeVerifier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white min-h-[700px] py-8">
        {/* Iframe Section - Centered with Border Radius */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading conversation...</p>
                </div>
              </div>
            )}
            <iframe
              src={`/verify?c=${reportId}`}
              className="w-full h-[700px] border-0 rounded-xl"
              title="Conversation Preview"
              allow="clipboard-read; clipboard-write"
              onLoad={() => setIframeLoading(false)}
            />
          </div>
        </div>
      </div>

      {/* Footer Section - White Background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - About */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                This verification was created using FakeVerifier, an AI-powered fact-checking tool. The conversation above shows the complete verification process, including the original claim, AI analysis, evidence gathering, and final verdict with confidence score.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Use this as a reference for fact-checking similar claims or as a foundation for understanding how AI-powered verification works.
              </p>
            </div>

            {/* Right Column - Tags, Share, Last Updated */}
            <div className="space-y-6">
              {/* Tags */}
              {report.tags && report.tags.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {report.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Share</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Last Updated */}
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm text-gray-700 font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Comments Section - Threads App Style */}
          <div className="border-t pt-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Comments {comments.length > 0 && `(${comments.length})`}</h2>
            </div>

            {/* Comment Input - Instagram Style */}
            <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user?.name || 'User'} 
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'A').toUpperCase()}
                </div>
              )}
              <form onSubmit={handleCommentSubmit} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 text-sm px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                {newComment.trim() && (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Post
                  </button>
                )}
              </form>
            </div>

            {/* Comments List - Reddit/Instagram Style */}
            {loadingComments ? (
              <div className="text-sm text-center py-8 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
            ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const showReplies = showRepliesMap[comment.id] !== false; // Default to true
                const showReplyInput = replyingTo === comment.id;
                
                return (
                  <div key={comment.id} className="space-y-2">
                    {/* Main Comment */}
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        <div className="inline-block rounded-2xl px-4 py-2.5 mb-1 bg-gray-100">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">{getRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                        </div>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center gap-4 mt-1 mb-2">
                          <button
                            onClick={() => handleCommentInteraction(comment.id, 'like')}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button
                            onClick={() => handleCommentInteraction(comment.id, 'dislike')}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span>{comment.dislikes || 0}</span>
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            Reply
                          </button>
                          {comment.replies && comment.replies.length > 0 && (
                            <button
                              onClick={() => {
                                setShowRepliesMap(prev => ({
                                  ...prev,
                                  [comment.id]: !showReplies
                                }));
                              }}
                              className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                            </button>
                          )}
                        </div>
                        
                        {/* Reply Input - Instagram Style */}
                        {showReplyInput && (
                          <form 
                            onSubmit={(e) => handleReplySubmit(comment.id, e)}
                            className="flex gap-2 mt-2 mb-3"
                          >
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user?.name || 'User'} 
                                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'A').toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${comment.author}...`}
                                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                autoFocus
                              />
                              {replyText.trim() && (
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                  Post
                                </button>
                              )}
                            </div>
                          </form>
                        )}

                        {/* Replies - Reddit Style with Indentation */}
                        {comment.replies && comment.replies.length > 0 && showReplies && (
                          <div className="ml-4 mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {reply.author.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="inline-block rounded-2xl px-3 py-1.5 mb-1 bg-gray-100">
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                      <span className="text-xs font-semibold text-gray-900">{reply.author}</span>
                                      <span className="text-[10px] text-gray-500">{getRelativeTime(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-gray-800 leading-relaxed">{reply.content}</p>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <button
                                      onClick={() => handleCommentInteraction(reply.id, 'like', true, comment.id)}
                                      className="flex items-center gap-1 text-[10px] font-medium text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>{reply.likes || 0}</span>
                                    </button>
                                    <button
                                      onClick={() => handleCommentInteraction(reply.id, 'dislike', true, comment.id)}
                                      className="flex items-center gap-1 text-[10px] font-medium text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                      <span>{reply.dislikes || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
