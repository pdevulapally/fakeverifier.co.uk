'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Edit, X } from 'lucide-react';

interface MemoryNotificationProps {
  memories: Array<{
    id: string;
    content: string;
    type: string;
    action: 'created' | 'updated';
    tags?: string[];
  }>;
  onClose: () => void;
}

export function MemoryNotification({ memories, onClose }: MemoryNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const createdMemories = memories.filter(m => m.action === 'created');
  const updatedMemories = memories.filter(m => m.action === 'updated');

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-1">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Memory Updated</h3>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="rounded p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-2">
          {createdMemories.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Plus className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  {createdMemories.length} new memor{createdMemories.length === 1 ? 'y' : 'ies'} added
                </span>
              </div>
              {createdMemories.map((memory, index) => (
                <div key={index} className="text-xs text-gray-600 bg-green-50 rounded p-2 mb-1">
                  <div className="font-medium">{memory.content}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize">{memory.type}</span>
                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex gap-1">
                        {memory.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-green-100 text-green-700 px-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {updatedMemories.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Edit className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {updatedMemories.length} memor{updatedMemories.length === 1 ? 'y' : 'ies'} updated
                </span>
              </div>
              {updatedMemories.map((memory, index) => (
                <div key={index} className="text-xs text-gray-600 bg-blue-50 rounded p-2 mb-1">
                  <div className="font-medium">{memory.content}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize">{memory.type}</span>
                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex gap-1">
                        {memory.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            I'll remember this information for future conversations
          </p>
        </div>
      </div>
    </div>
  );
}
