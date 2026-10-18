import React, { useEffect, useState } from 'react';
import {
  Feather,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  MessageCircle,
  Clock,
  ArrowLeft,
  User,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PostResponse, Comment } from '@verseora/shared-types';

interface ReadingPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ReadingPage: React.FC<ReadingPageProps> = ({ slug, onNavigate }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction feedback states
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Reading presentation controls
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'cinematic'>('normal');
  const [themeMode, setThemeMode] = useState<'charcoal' | 'midnight' | 'parchment'>('midnight');

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPost(slug);
      setPost(data);

      // Load comments
      const comms = await api.getComments(data.id);
      setComments(comms || []);
    } catch (err: any) {
      setError(err.message || 'This piece is either private, unlisted, or no longer available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [slug]);

  const handleToggleLike = async () => {
    if (!user) {
      onNavigate('auth', { mode: 'login' });
      return;
    }
    if (!post) return;

    try {
      const res = await api.toggleLike(post.id);
      setPost((prev: PostResponse | null) => prev ? { ...prev, is_liked: res.liked, likes_count: res.likes_count } : null);
      if (res.liked) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#f43f5e', '#8b7cf6']
        });
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      onNavigate('auth', { mode: 'login' });
      return;
    }
    if (!post) return;

    try {
      const res = await api.toggleBookmark(post.id);
      setPost((prev: PostResponse | null) => prev ? { ...prev, is_bookmarked: res.bookmarked, bookmarks_count: res.bookmarks_count } : null);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  const handleCopyQuote = () => {
    if (!post) return;
    const plainText = post.content.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n\n').trim();
    const formatted = `"${plainText}"\n\n— ${post.author.full_name} (@${post.author.username})\nRead on Verseora: ${window.location.href}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: `Read "${post.title}" by ${post.author.full_name} on Verseora`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyQuote();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('auth', { mode: 'login' });
      return;
    }
    if (!newComment.trim() || !post) return;

    try {
      const comm = await api.addComment(post.id, newComment.trim());
      setComments(prev => [comm, ...prev]);
      setNewComment('');
      setPost((prev: PostResponse | null) => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('auth', { mode: 'login' });
      return;
    }
    if (!post) return;

    try {
      await api.submitReport({
        post_id: post.id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportModalOpen(false);
      }, 2000);
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-ivory-400 text-sm">
        Opening parchment...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="p-8 rounded-3xl glass-panel border border-charcoal-800">
          <Feather className="w-12 h-12 text-ivory-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-ivory-100 mb-2">Piece Unavailable</h2>
          <p className="text-xs text-ivory-400 mb-6 leading-relaxed">
            {error || 'This writing is private or does not exist.'}
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="px-5 py-2.5 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium hover:bg-verse-violet/90 transition shadow-md"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const plainReadingText = post.content.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n\n').trim();

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors ${
      themeMode === 'parchment'
        ? 'bg-[#181614] text-[#ede8df]'
        : themeMode === 'charcoal'
        ? 'bg-charcoal-950 text-ivory-50'
        : 'bg-[#0f1118] text-ivory-50'
    }`}>
      {/* Top Reading Navigation Bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-6 mb-8 border-b border-charcoal-800/80">
        <button
          onClick={() => onNavigate('explore')}
          className="flex items-center space-x-2 text-xs font-medium text-ivory-400 hover:text-ivory-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        {/* Presentation Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Font Size Toggle */}
          <div className="flex items-center space-x-1 p-1 rounded-lg bg-charcoal-900 border border-charcoal-800">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded text-[11px] font-serif ${fontSize === 'normal' ? 'bg-verse-violet text-ivory-50' : 'text-ivory-400'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded text-sm font-serif ${fontSize === 'large' ? 'bg-verse-violet text-ivory-50' : 'text-ivory-400'}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('cinematic')}
              className={`px-2 py-0.5 rounded text-base font-serif ${fontSize === 'cinematic' ? 'bg-verse-violet text-ivory-50' : 'text-ivory-400'}`}
            >
              A++
            </button>
          </div>

          {/* Theme Palette Toggle */}
          <div className="flex items-center space-x-1 p-1 rounded-lg bg-charcoal-900 border border-charcoal-800">
            <button
              onClick={() => setThemeMode('midnight')}
              title="Midnight"
              className={`w-4 h-4 rounded-full bg-[#0f1118] border ${themeMode === 'midnight' ? 'border-verse-violet ring-1 ring-verse-violet' : 'border-charcoal-600'}`}
            />
            <button
              onClick={() => setThemeMode('charcoal')}
              title="Charcoal"
              className={`w-4 h-4 rounded-full bg-charcoal-950 border ${themeMode === 'charcoal' ? 'border-verse-violet ring-1 ring-verse-violet' : 'border-charcoal-600'}`}
            />
            <button
              onClick={() => setThemeMode('parchment')}
              title="Parchment"
              className={`w-4 h-4 rounded-full bg-[#2a241e] border ${themeMode === 'parchment' ? 'border-verse-violet ring-1 ring-verse-violet' : 'border-charcoal-600'}`}
            />
          </div>
        </div>
      </div>

      {/* Main Reading Article */}
      <article className="max-w-2xl mx-auto">
        {/* Header Metadata */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-verse-violet/10 text-verse-violet text-xs font-medium mb-4 border border-verse-violet/20 uppercase tracking-widest font-sans">
            <span>{post.content_type}</span>
            <span>·</span>
            <span>{post.language}</span>
            {post.mood && (
              <>
                <span>·</span>
                <span>{post.mood}</span>
              </>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author Card */}
          <div
            onClick={() => onNavigate('profile', { username: post.author.username })}
            className="inline-flex items-center space-x-3 p-2 rounded-2xl hover:bg-charcoal-800/40 cursor-pointer transition"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-verse-violet via-verse-indigo to-verse-rose flex items-center justify-center font-bold text-sm text-ivory-50 shadow-md">
              {post.author.full_name.charAt(0)}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-ivory-100 hover:text-verse-violet transition">
                {post.author.full_name}
              </h3>
              <p className="text-xs text-ivory-400">@{post.author.username}</p>
            </div>
          </div>
        </header>

        {/* Poetic Stanzas / Body */}
        <div className={`poem-body leading-loose whitespace-pre-line text-center mb-16 font-serif ${
          fontSize === 'large'
            ? 'text-xl sm:text-2xl leading-loose'
            : fontSize === 'cinematic'
            ? 'text-2xl sm:text-3xl leading-[2.2]'
            : 'text-lg sm:text-xl leading-loose'
        }`}>
          {plainReadingText}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {post.tags.map((tag: string, i: number) => (
              <span key={i} className="text-xs px-3 py-1 rounded-lg bg-charcoal-800/80 text-ivory-300 border border-charcoal-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Interaction Actions Bar */}
        <div className="p-4 rounded-2xl glass-panel border border-charcoal-800 flex items-center justify-between mb-16">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition ${
                post.is_liked
                  ? 'bg-verse-rose/15 text-verse-rose'
                  : 'hover:bg-charcoal-800 text-ivory-300'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-verse-rose' : ''}`} />
              <span className="text-xs font-medium">{post.likes_count}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleToggleBookmark}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition ${
                post.is_bookmarked
                  ? 'bg-verse-violet/15 text-verse-violet'
                  : 'hover:bg-charcoal-800 text-ivory-300'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? 'fill-verse-violet' : ''}`} />
              <span className="text-xs font-medium">{post.bookmarks_count}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Copy Quote Button */}
            <button
              onClick={handleCopyQuote}
              className="p-2 rounded-xl hover:bg-charcoal-800 text-ivory-300 hover:text-ivory-50 transition"
              title="Copy quote with attribution"
            >
              {copied ? <Check className="w-5 h-5 text-verse-teal" /> : <Copy className="w-5 h-5" />}
            </button>

            {/* Share Button */}
            <button
              onClick={handleNativeShare}
              className="p-2 rounded-xl hover:bg-charcoal-800 text-ivory-300 hover:text-ivory-50 transition"
              title="Share piece"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Report Content */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-xl hover:bg-charcoal-800 text-ivory-400 hover:text-verse-rose transition"
              title="Report content"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Discussion / Comments Section */}
        <section className="pt-8 border-t border-charcoal-800">
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="w-5 h-5 text-verse-violet" />
            <h3 className="font-serif text-2xl font-bold text-ivory-50">
              Literary Discussion ({comments.length})
            </h3>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts or reflection on this verse..." : "Sign in to leave a reflection"}
              disabled={!user}
              rows={3}
              className="w-full glass-input rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-verse-violet resize-none placeholder:text-ivory-500 mb-3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!user || !newComment.trim()}
                className="px-5 py-2 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium hover:bg-verse-violet/90 disabled:opacity-40 transition"
              >
                Post Reflection
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-ivory-400 py-6 italic">
                Be the first to share an impression on this verse.
              </p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-4 rounded-xl glass-panel border border-charcoal-800/80">
                  <div className="flex items-center justify-between text-xs text-ivory-400 mb-2">
                    <span className="font-medium text-ivory-200">{c.author.full_name} (@{c.author.username})</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-ivory-300 leading-relaxed whitespace-pre-line">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </article>

      {/* Content Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-charcoal-700 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-ivory-50 mb-2">Report Content</h3>
            <p className="text-xs text-ivory-400 mb-4">
              Help preserve Verseora as a respectful, authentic literary sanctuary.
            </p>

            {reportSubmitted ? (
              <div className="p-4 rounded-xl bg-verse-teal/10 border border-verse-teal/30 text-verse-teal text-xs text-center">
                Report submitted for editorial review. Thank you.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ivory-300 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-charcoal-900 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-ivory-200"
                  >
                    <option value="Plagiarism / Copyright">Plagiarism / Stolen Content</option>
                    <option value="Harassment or Hate Speech">Harassment or Hate Speech</option>
                    <option value="Spam / Commercial Bot">Spam / Commercial Promotion</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ivory-300 mb-1">Details (Optional)</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    placeholder="Provide additional context for moderators..."
                    className="w-full glass-input rounded-xl p-3 text-xs text-ivory-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs text-ivory-400 hover:text-ivory-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-verse-rose text-ivory-50 text-xs rounded-xl font-medium hover:bg-verse-rose/90 transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
