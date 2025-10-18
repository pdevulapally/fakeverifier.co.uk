'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, X, AlertTriangle, ThumbsUp, ThumbsDown, Share, Copy, Lock } from 'lucide-react';

interface PublicReport {
  id: string;
  title: string;
  content: string;
  verdict: string;
  confidence: number;
  author: string;
  views: number;
  likes: number;
  dislikes: number;
  tags: string[];
  sources: Array<{ name: string; url: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function PublicReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  
  const [report, setReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    if (reportId) {
      fetchReport();
      logAccess();
    }
  }, [reportId]);

  const logAccess = async () => {
    try {
      await fetch(`/api/conversations/${reportId}/access-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: 'Anonymous', // In a real app, you'd get this from the request
          userAgent: navigator.userAgent,
          location: 'Unknown' // In a real app, you'd use a geolocation service
        })
      });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public-reports/${reportId}`);
      const data = await response.json();
      
      if (response.ok) {
        setReport(data);
      } else {
        setError(data.error || 'Failed to load report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (action: 'like' | 'dislike') => {
    if (!report || interacting) return;
    
    setInteracting(true);
    try {
      const response = await fetch(`/api/public-reports/${reportId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: 'anonymous' })
      });

      if (response.ok) {
        const data = await response.json();
        setReport(prev => prev ? {
          ...prev,
          likes: data.likes,
          dislikes: data.dislikes
        } : null);
      }
    } catch (error) {
      console.error('Failed to update interaction:', error);
    } finally {
      setInteracting(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Likely Real':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'Likely Fake':
        return <X className="h-5 w-5 text-red-600" />;
      case 'Mixed':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'Unverified':
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Likely Real':
        return 'text-green-600 bg-green-50';
      case 'Likely Fake':
        return 'text-red-600 bg-red-50';
      case 'Mixed':
        return 'text-yellow-600 bg-yellow-50';
      case 'Unverified':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    // Check if it's an access denied error (conversation is private)
    const isAccessDenied = error?.includes('Access denied') || error?.includes('not public');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {isAccessDenied ? (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                This conversation is now private and can only be accessed by the owner. 
                The link you have is no longer valid.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs">ℹ</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-800 font-medium mb-1">What happened?</p>
                    <p className="text-xs text-blue-700">
                      The owner of this conversation has changed the privacy settings to private. 
                      This means only they can view it now.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
              <p className="text-gray-600 mb-4">{error || 'This report does not exist or has been removed.'}</p>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/public-reports" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Public Reports
            </a>
            <a 
              href="/verify" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start New Conversation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                By {report.author} • {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a 
              href="/public-reports"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Reports
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Report Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getVerdictIcon(report.verdict)}
                <div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerdictColor(report.verdict)}`}>
                    {report.verdict}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {report.confidence}% confidence
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{report.views} views</span>
                <span>{report.likes} likes</span>
              </div>
            </div>

            {/* Tags */}
            {report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {report.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleInteraction('like')}
                disabled={interacting}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                <ThumbsUp className="h-4 w-4" />
                Like ({report.likes})
              </button>
              <button
                onClick={() => handleInteraction('dislike')}
                disabled={interacting}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                <ThumbsDown className="h-4 w-4" />
                Dislike ({report.dislikes})
              </button>
              <button
                onClick={() => navigator.share?.({ title: report.title, url: window.location.href })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <Share className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: report.content.replace(/\n/g, '<br>') }} />
            </div>
          </div>

          {/* Sources */}
          {report.sources && report.sources.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources</h3>
              <div className="space-y-3">
                {report.sources.map((source, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {source.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
