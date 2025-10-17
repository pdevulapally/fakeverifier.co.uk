
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListItem {
  id: string;
  title: string;
  updatedAt: string | Date;
}

export default function HistoryPage(){
  const { user, loading } = useAuth();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || loading) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/conversations?uid=${user.uid}`);
        const j = await r.json();
        if (r.ok) {
          const mapped: ConversationListItem[] = (j.conversations || []).map((c: any) => ({
            id: c.id,
            title: c.title || 'Untitled',
            updatedAt: c.updatedAt,
          }));
          setItems(mapped);
        } else {
          setError(j.error || 'Failed to load');
        }
      } catch {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, loading]);

  if (loading) return null;
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">History</h1>
        <p className="mt-2 text-gray-600">Your recent chats</p>

        {error && (
          <div className="mt-6 border rounded-xl bg-red-50 p-4 text-red-700 border-red-200">{error}</div>
        )}

        {isLoading ? (
          <div className="mt-6 border rounded-xl bg-white p-6 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="mt-6 border rounded-xl bg-white p-6 text-gray-500">No history yet.</div>
        ) : (
          <ul className="mt-6 divide-y rounded-xl border bg-white">
            {items.map((c) => (
              <li key={c.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-xl">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Updated {new Date(c.updatedAt).toLocaleString()}</p>
                </div>
                <Link href={`/verify?c=${c.id}`} className="text-blue-600 hover:text-blue-700 text-sm">Open</Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}


