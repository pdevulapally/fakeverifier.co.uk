'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SharedConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  useEffect(() => {
    if (conversationId) {
      // Redirect to /verify?c=[id] format
      router.replace(`/verify?c=${conversationId}`);
    }
  }, [conversationId, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
