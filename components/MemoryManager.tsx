'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Calendar, User } from 'lucide-react';

interface Memory {
  id: string;
  content: string;
  type: string;
  tags: string[];
  topics?: string[];
  importanceScore?: number;
  usageCount?: number;
  lastUsedAt?: Date | null;
  relatedMemories?: string[];
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface MemoryManagerProps {
  uid: string | null;
  onMemorySelect?: (memory: Memory) => void;
}

export function MemoryManager({ uid, onMemorySelect }: MemoryManagerProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  // Load memories
  useEffect(() => {
    if (!uid) return;
    loadMemories();
  }, [uid]);

  const loadMemories = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/memories?uid=${uid}`);
      const data = await response.json();
      if (response.ok) {
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemory = async () => {
    if (!editingMemory || !uid) return;
    
    try {
      const response = await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMemory.id,
          uid,
          content: editingMemory.content,
          type: editingMemory.type,
          tags: editingMemory.tags,
          topics: editingMemory.topics || [],
          importanceScore: editingMemory.importanceScore
        })
      });

      if (response.ok) {
        await loadMemories();
        setEditingMemory(null);
      }
    } catch (error) {
      console.error('Failed to update memory:', error);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!uid) return;
    
    try {
      const response = await fetch(`/api/memories?id=${id}&uid=${uid}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadMemories();
      }
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!uid) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Memories</h3>
        <p className="text-sm text-gray-500 mt-1">Memories are automatically created from your conversations</p>
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No memories yet</p>
            <p className="text-sm">Memories will be automatically created from your conversations</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div
              key={memory.id}
              className="group rounded-lg border border-gray-200 bg-white p-3 sm:p-4 hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-2 break-words">{memory.content}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {memory.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(memory.createdAt)}
                    </span>
                  </div>

                  {memory.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {memory.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {onMemorySelect && (
                    <button
                      onClick={() => onMemorySelect(memory)}
                      className="rounded p-1.5 hover:bg-gray-100"
                      title="Use this memory"
                    >
                      <Plus className="h-3 w-3 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingMemory(memory)}
                    className="rounded p-1.5 hover:bg-gray-100"
                    title="Edit memory"
                  >
                    <Edit className="h-3 w-3 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteMemory(memory.id)}
                    className="rounded p-1.5 hover:bg-red-100"
                    title="Delete memory"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Memory</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={editingMemory.content}
                onChange={(e) => setEditingMemory(prev => prev ? { ...prev, content: e.target.value } : null)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={editingMemory.type}
                onChange={(e) => setEditingMemory(prev => prev ? { ...prev, type: e.target.value } : null)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="preference">Preference</option>
                <option value="fact">Fact</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="project">Project</option>
              </select>
            </div>

            {editingMemory.importanceScore !== undefined && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importance Score: {(editingMemory.importanceScore * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={editingMemory.importanceScore}
                  onChange={(e) => setEditingMemory(prev => prev ? { ...prev, importanceScore: parseFloat(e.target.value) } : null)}
                  className="w-full"
                />
              </div>
            )}

            {editingMemory.usageCount !== undefined && editingMemory.usageCount > 0 && (
              <div className="mb-4 text-xs text-gray-500">
                <span>Used {editingMemory.usageCount} time{editingMemory.usageCount !== 1 ? 's' : ''}</span>
                {editingMemory.lastUsedAt && (
                  <span className="ml-2">Last used: {formatDate(editingMemory.lastUsedAt)}</span>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleUpdateMemory}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingMemory(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
