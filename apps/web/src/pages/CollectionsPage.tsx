import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Lock, Globe, Trash2, ArrowRight, FolderHeart } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Collection, PostResponse } from '@verseora/shared-types';

interface CollectionsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Collection Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await api.getCollections();
      setCollections(data || []);
      if (data && data.length > 0 && !selectedCollection) {
        loadCollectionDetail(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionDetail = async (id: string) => {
    try {
      const detail = await api.getCollection(id);
      setSelectedCollection(detail);
    } catch (err) {
      console.error('Failed to load collection detail', err);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName.trim()) return;
    setCreating(true);
    try {
      const newCol = await api.createCollection({
        name: collectionName.trim(),
        description: collectionDescription.trim() || undefined,
        is_public: isPublic,
      });
      setCollections(prev => [newCol, ...prev]);
      setSelectedCollection(newCol);
      setCollectionName('');
      setCollectionDescription('');
      setIsPublic(false);
      setCreateModalOpen(false);
    } catch (err) {
      alert('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this collection? (Verses inside will remain intact)')) {
      try {
        await api.deleteCollection(id);
        setCollections(prev => prev.filter(c => c.id !== id));
        if (selectedCollection?.id === id) {
          setSelectedCollection(null);
        }
      } catch (err) {
        alert('Failed to delete collection');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-verse-violet/10 text-verse-violet text-xs font-medium mb-2 border border-verse-violet/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Anthologies</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ivory-50">
            My Literary Collections
          </h1>
          <p className="text-xs text-ivory-400 mt-1">
            Organize personal writings, Shayari compilations, and favorite poems into private or public volumes.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium hover:bg-verse-violet/90 transition shadow-md flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Collections List */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-semibold text-ivory-400 tracking-wider mb-2">
            Volumes ({collections.length})
          </h3>

          {loading ? (
            <div className="py-10 text-center text-xs text-ivory-400">Loading volumes...</div>
          ) : collections.length === 0 ? (
            <div className="p-6 rounded-2xl glass-panel border border-charcoal-800 text-center text-xs text-ivory-400">
              No collections yet. Click "New Collection" to begin.
            </div>
          ) : (
            collections.map(col => (
              <div
                key={col.id}
                onClick={() => loadCollectionDetail(col.id)}
                className={`p-4 rounded-xl glass-panel border cursor-pointer transition flex items-center justify-between ${
                  selectedCollection?.id === col.id
                    ? 'border-verse-violet bg-verse-violet/10'
                    : 'border-charcoal-800 hover:border-charcoal-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-charcoal-800 flex items-center justify-center text-verse-violet">
                    <FolderHeart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ivory-100">{col.name}</h4>
                    <div className="flex items-center space-x-2 text-[11px] text-ivory-400">
                      <span>{col.items_count} items</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        {col.is_public ? (
                          <>
                            <Globe className="w-3 h-3 text-verse-teal" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-verse-amber" />
                            <span>Private</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteCollection(e, col.id)}
                  className="p-1.5 text-ivory-500 hover:text-verse-rose transition"
                  title="Delete Collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Selected Collection Details and Included Verses */}
        <div className="lg:col-span-2">
          {selectedCollection ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-charcoal-800">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-charcoal-800">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="font-serif text-2xl font-bold text-ivory-50">
                      {selectedCollection.name}
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-charcoal-800 text-ivory-300 border border-charcoal-700">
                      {selectedCollection.is_public ? 'Public Collection' : 'Private Collection'}
                    </span>
                  </div>
                  {selectedCollection.description && (
                    <p className="text-xs text-ivory-300 mt-1 italic">
                      {selectedCollection.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              {selectedCollection.posts && selectedCollection.posts.length > 0 ? (
                <div className="space-y-4">
                  {selectedCollection.posts.map((post: PostResponse) => (
                    <div
                      key={post.id}
                      onClick={() => onNavigate('reading', { slug: post.slug || post.id })}
                      className="p-4 rounded-xl bg-charcoal-900/60 border border-charcoal-800 hover:border-verse-violet/40 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-[10px] uppercase text-verse-violet font-sans tracking-wide">
                          {post.content_type} · by {post.author.full_name}
                        </span>
                        <h4 className="font-serif text-base font-bold text-ivory-100 group-hover:text-verse-violet transition">
                          {post.title}
                        </h4>
                        <p className="text-xs text-ivory-400 line-clamp-1 italic mt-1 font-serif">
                          {post.excerpt}
                        </p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-ivory-400 group-hover:text-verse-violet group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-ivory-400">
                  This volume is empty. Browse poems and add them to this collection.
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 border border-charcoal-800 text-center text-ivory-400 text-xs">
              Select or create a volume to view its contents.
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-charcoal-700 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-ivory-50 mb-2">Create New Volume</h3>
            <p className="text-xs text-ivory-400 mb-6">
              Collections default to private so you can gather verses in peace.
            </p>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ivory-300 mb-1">Volume Name</label>
                <input
                  type="text"
                  required
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g. Midnight Ghazals"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-ivory-100 focus:outline-none focus:ring-1 focus:ring-verse-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ivory-300 mb-1">Description (Optional)</label>
                <textarea
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  rows={2}
                  placeholder="A brief note about this collection..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-ivory-100 focus:outline-none resize-none"
                />
              </div>

              {/* Public/Private toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs">
                <span className="text-ivory-300">Make this volume public</span>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded text-verse-violet focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-ivory-400 hover:text-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-verse-violet text-ivory-50 text-xs rounded-xl font-medium hover:bg-verse-violet/90 transition shadow-md"
                >
                  {creating ? 'Creating...' : 'Create Volume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

