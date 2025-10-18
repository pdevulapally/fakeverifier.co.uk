'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, X, AlertTriangle, ThumbsUp, ThumbsDown, Share, Copy, Lock } from 'lucide-react';

interface SharedConversation {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  author: string;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
}

export default function SharedConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  
  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      logAccess();
    }
  }, [conversationId]);

  const logAccess = async () => {
    try {
      await fetch(`/api/conversations/${conversationId}/access-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: 'Anonymous',
          userAgent: navigator.userAgent,
          location: 'Unknown'
        })
      });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      
      if (response.ok) {
        setConversation(data);
      } else {
        setError(data.error || 'Failed to load conversation');
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (action: 'like' | 'dislike') => {
    if (!conversation || interacting) return;
    
    setInteracting(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: 'anonymous' })
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(prev => prev ? {
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

  const handleContinueConversation = async () => {
    setContinueLoading(true);
    try {
      // Check if user is logged in
      const response = await fetch('/api/auth/check');
      const authData = await response.json();
      
      if (!authData.authenticated) {
        // Redirect to login with return URL
        window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.href)}`;
        return;
      }

      // Create a new conversation based on the shared one
      const continueResponse = await fetch('/api/conversations/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceConversationId: conversationId,
          title: `Continued: ${conversation?.title || 'Shared Conversation'}`
        })
      });

      if (continueResponse.ok) {
        const data = await continueResponse.json();
        // Redirect to the new conversation
        window.location.href = `/verify?c=${data.id}`;
      } else {
        console.error('Failed to continue conversation');
      }
    } catch (error) {
      console.error('Error continuing conversation:', error);
    } finally {
      setContinueLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation Not Found</h1>
              <p className="text-gray-600 mb-4">{error || 'This conversation does not exist or has been removed.'}</p>
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
              <h1 className="text-2xl font-bold text-gray-900">{conversation.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                By {conversation.author} • {new Date(conversation.createdAt).toLocaleDateString()}
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
          {/* Conversation Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Share className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                    Shared Conversation
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This conversation was shared with you via a direct link
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{conversation.views} views</span>
                <span>{conversation.likes} likes</span>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => handleInteraction('like')}
                disabled={interacting}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                <ThumbsUp className="h-4 w-4" />
                Like ({conversation.likes})
              </button>
              <button
                onClick={() => handleInteraction('dislike')}
                disabled={interacting}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                <ThumbsDown className="h-4 w-4" />
                Dislike ({conversation.dislikes})
              </button>
              <button
                onClick={() => navigator.share?.({ title: conversation.title, url: window.location.href })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <Share className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={() => setShowContinueModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Continue Conversation
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-6">
            <div className="space-y-6">
              {conversation.messages.map((message, index) => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      message.role === 'user' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {message.role === 'user' ? 'U' : 'AI'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {message.role === 'user' ? 'User' : 'FakeVerifier AI'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-10">
                    <div className="prose prose-sm max-w-none text-gray-900">
                      <div dangerouslySetInnerHTML={{ 
                        __html: message.content.replace(/\n/g, '<br>') 
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Continue Conversation Modal */}
      {showContinueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContinueModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Continue Conversation
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                This will create a new conversation in your chat history with all the messages from this shared conversation. 
                You can then continue the conversation with the AI.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs">ℹ</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-800 font-medium mb-1">How it works:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Creates a new private conversation in your account</li>
                      <li>• Copies all messages from this shared conversation</li>
                      <li>• You can then continue chatting with the AI</li>
                      <li>• The original shared conversation remains unchanged</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContinueModal(false)}
                className="flex-1 rounded-lg px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleContinueConversation}
                disabled={continueLoading}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {continueLoading ? 'Creating...' : 'Continue Conversation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
