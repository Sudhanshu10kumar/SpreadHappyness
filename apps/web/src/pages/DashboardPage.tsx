import React, { useEffect, useState } from 'react';
import { Feather, BookOpen, Heart, Bookmark, Plus, Edit3, Trash2, Globe, Lock, Clock, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { PostResponse } from '@verseora/shared-types';

interface DashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<PostResponse[]>([]);
  const [bookmarks, setBookmarks] = useState<PostResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'drafts' | 'bookmarks'>('drafts');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [draftsData, bookmarksData] = await Promise.all([
        api.getDrafts(1),
        api.getMyBookmarks(),
      ]);
      setDrafts(draftsData.items || []);
      setBookmarks(bookmarksData || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteDraft = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        await api.deletePost(id);
        setDrafts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete draft');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-charcoal-800 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-verse-violet/10 text-verse-violet text-xs font-medium mb-3 border border-verse-violet/20">
              <Feather className="w-3.5 h-3.5" />
              <span>Personal Writing Sanctuary</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory-50 tracking-tight">
              Welcome to your desk, {user?.full_name}
            </h1>
            <p className="text-sm text-ivory-400 mt-2 max-w-xl">
              Write private reflections, refine your Shayari stanzas, or publish chosen verses to the world.
            </p>
          </div>

          <button
            onClick={() => onNavigate('studio')}
            className="self-start md:self-auto px-6 py-3 rounded-xl bg-gradient-to-r from-verse-violet via-verse-indigo to-verse-rose text-ivory-50 text-sm font-medium shadow-lg shadow-verse-violet/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Draft</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-charcoal-800">
          <div className="flex items-center justify-between text-xs text-ivory-400 mb-2">
            <span>Private Drafts</span>
            <Lock className="w-4 h-4 text-verse-amber" />
          </div>
          <p className="font-serif text-2xl font-bold text-ivory-50">{drafts.length}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-charcoal-800">
          <div className="flex items-center justify-between text-xs text-ivory-400 mb-2">
            <span>Saved Bookmarks</span>
            <Bookmark className="w-4 h-4 text-verse-violet" />
          </div>
          <p className="font-serif text-2xl font-bold text-ivory-50">{bookmarks.length}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-charcoal-800">
          <div className="flex items-center justify-between text-xs text-ivory-400 mb-2">
            <span>Author Pen Name</span>
            <Feather className="w-4 h-4 text-verse-rose" />
          </div>
          <p className="font-serif text-sm font-semibold text-ivory-200 truncate">@{user?.username}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-charcoal-800">
          <div className="flex items-center justify-between text-xs text-ivory-400 mb-2">
            <span>Account Status</span>
            <Globe className="w-4 h-4 text-verse-teal" />
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-verse-teal/10 text-verse-teal font-medium border border-verse-teal/20">
            Active Creator
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 border-b border-charcoal-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex items-center space-x-2 text-sm font-medium pb-2 border-b-2 transition ${
            activeTab === 'drafts'
              ? 'border-verse-violet text-verse-violet'
              : 'border-transparent text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>My Drafts & Journal ({drafts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center space-x-2 text-sm font-medium pb-2 border-b-2 transition ${
            activeTab === 'bookmarks'
              ? 'border-verse-violet text-verse-violet'
              : 'border-transparent text-ivory-400 hover:text-ivory-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Bookmarks ({bookmarks.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-ivory-400 text-sm">
          Loading your literary works...
        </div>
      ) : activeTab === 'drafts' ? (
        drafts.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-2xl border border-charcoal-800 p-8">
            <Feather className="w-12 h-12 text-ivory-500 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-ivory-100">Your journal is waiting</h3>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto mt-2 mb-6">
              You have no active drafts. Pen down a stray thought, a stanza of Shayari, or a full poem.
            </p>
            <button
              onClick={() => onNavigate('studio')}
              className="px-5 py-2.5 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium hover:bg-verse-violet/90 transition shadow-md"
            >
              Start Writing Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map(draft => (
              <div
                key={draft.id}
                onClick={() => onNavigate('studio', { postId: draft.id })}
                className="glass-panel rounded-2xl p-6 border border-charcoal-800 hover:border-verse-violet/40 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="px-2 py-0.5 rounded bg-charcoal-800 text-ivory-300 font-sans uppercase text-[10px] tracking-wider border border-charcoal-700">
                      {draft.content_type} · {draft.language}
                    </span>
                    <span className="flex items-center space-x-1 text-verse-amber text-[11px]">
                      <Lock className="w-3 h-3" />
                      <span>Private Draft</span>
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-ivory-100 mb-2 group-hover:text-verse-violet transition">
                    {draft.title || 'Untitled Draft'}
                  </h3>

                  <p className="text-xs text-ivory-400 line-clamp-3 leading-relaxed mb-4">
                    {draft.excerpt || 'No content yet...'}
                  </p>
                </div>

                <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-ivory-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(draft.updated_at).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigate('studio', { postId: draft.id }); }}
                      className="p-1.5 hover:text-verse-violet hover:bg-charcoal-800 rounded transition"
                      title="Edit Draft"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteDraft(e, draft.id)}
                      className="p-1.5 hover:text-verse-rose hover:bg-verse-rose/10 rounded transition"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        bookmarks.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-2xl border border-charcoal-800 p-8">
            <Bookmark className="w-12 h-12 text-ivory-500 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-ivory-100">No bookmarks saved</h3>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto mt-2 mb-6">
              Browse public poetry and save meaningful verses to your personal bookmarks.
            </p>
            <button
              onClick={() => onNavigate('explore')}
              className="px-5 py-2.5 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium hover:bg-verse-violet/90 transition shadow-md"
            >
              Explore Public Literature
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(post => (
              <div
                key={post.id}
                onClick={() => onNavigate('reading', { slug: post.slug || post.id })}
                className="glass-panel rounded-2xl p-6 border border-charcoal-800 hover:border-verse-violet/40 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="px-2 py-0.5 rounded bg-verse-violet/10 text-verse-violet font-sans uppercase text-[10px] tracking-wider border border-verse-violet/20">
                      {post.content_type} · {post.mood || 'Reflection'}
                    </span>
                    <span className="text-xs text-ivory-400">by {post.author.full_name}</span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-ivory-100 mb-2 group-hover:text-verse-violet transition">
                    {post.title}
                  </h3>

                  <p className="text-xs text-ivory-300 line-clamp-3 leading-relaxed mb-4 italic">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-ivory-400">
                  <span className="flex items-center space-x-1 text-verse-rose">
                    <Heart className="w-3.5 h-3.5 fill-verse-rose" />
                    <span>{post.likes_count}</span>
                  </span>

                  <span className="text-verse-violet text-xs group-hover:underline">Read Piece →</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

