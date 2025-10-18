'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Calendar, User, X } from 'lucide-react';

interface Memory {
  id: string;
  content: string;
  type: string;
  tags: string[];
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({
    content: '',
    type: 'general',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

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

  const handleAddMemory = async () => {
    if (!uid || !newMemory.content.trim()) return;
    
    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          content: newMemory.content,
          type: newMemory.type,
          tags: newMemory.tags
        })
      });

      if (response.ok) {
        await loadMemories();
        setNewMemory({ content: '', type: 'general', tags: [] });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add memory:', error);
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
          tags: editingMemory.tags
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

  const addTag = () => {
    if (tagInput.trim() && !newMemory.tags.includes(tagInput.trim())) {
      setNewMemory(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewMemory(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Memories</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Memory
        </button>
      </div>

      {/* Add Memory Form */}
      {showAddForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memory Content
            </label>
            <textarea
              value={newMemory.content}
              onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="What would you like me to remember?"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={newMemory.type}
              onChange={(e) => setNewMemory(prev => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="general">General</option>
              <option value="preference">Preference</option>
              <option value="fact">Fact</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Add a tag..."
              />
              <button
                onClick={addTag}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newMemory.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAddMemory}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 w-full sm:w-auto"
            >
              Save Memory
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewMemory({ content: '', type: 'general', tags: [] });
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Memories List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No memories yet</p>
            <p className="text-sm">Add your first memory to get started</p>
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
              </select>
            </div>

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
