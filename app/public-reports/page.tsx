'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Eye, ThumbsUp, ThumbsDown, Share, Copy, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

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
}

export default function PublicReportsPage() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedReport, setSelectedReport] = useState<PublicReport | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
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
  }, [searchQuery, selectedVerdict, sortBy, pagination.page]);

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
        body: JSON.stringify({ action, userId: 'anonymous' }) // You can get real user ID from auth
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
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

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Likely Real':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'Likely Fake':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Mixed':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Unverified':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Likely Real':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Likely Fake':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Mixed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Unverified':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShare = async (report: PublicReport) => {
    const shareUrl = `${window.location.origin}/r/${report.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    } catch (e) {
      console.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading public reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Public Reports</h1>
              <p className="text-gray-600 mt-1">Browse fact-checking reports from our community</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{pagination.total} reports</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search reports..."
                  />
                </div>
              </div>

              {/* Verdict Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verdict</label>
                <select
                  value={selectedVerdict}
                  onChange={(e) => setSelectedVerdict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Verdicts</option>
                  <option value="likely-real">Likely Real</option>
                  <option value="likely-fake">Likely Fake</option>
                  <option value="mixed">Mixed</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-viewed">Most Viewed</option>
                  <option value="highest-confidence">Highest Confidence</option>
                </select>
              </div>

              {/* Popular Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popular Tags</label>
                <div className="flex flex-wrap gap-2">
                  {['health', 'politics', 'science', 'economics', 'social-media'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{report.content}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getVerdictColor(report.verdict)} ml-4`}>
                        {getVerdictIcon(report.verdict)}
                        <span className="text-sm font-medium">{report.verdict}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{report.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{report.views}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{report.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{report.dislikes}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(report);
                          }}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Share className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {report.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`px-3 py-2 text-sm rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Verdict */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getVerdictColor(selectedReport.verdict)}`}>
                  {getVerdictIcon(selectedReport.verdict)}
                  <span className="font-medium">{selectedReport.verdict}</span>
                  <span className="text-sm">({selectedReport.confidence}% confidence)</span>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  <p className="text-gray-700">{selectedReport.content}</p>
                </div>

                {/* Sources */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sources</h3>
                  <div className="space-y-2">
                    {selectedReport.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <span>{source.name}</span>
                        <Share className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedReport.views}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedReport.likes}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedReport.dislikes}</div>
                    <div className="text-sm text-gray-600">Dislikes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedReport.confidence}%</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
