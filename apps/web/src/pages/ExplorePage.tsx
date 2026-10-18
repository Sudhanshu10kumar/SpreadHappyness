import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Eye,
  Globe
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PostResponse, Mood, Language, ContentType } from '@verseora/shared-types';

interface ExplorePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const moods = [
    { id: 'all', label: 'All Moods' },
    { id: 'love', label: 'Love (इश्क)' },
    { id: 'heartbreak', label: 'Heartbreak (दर्द)' },
    { id: 'silence', label: 'Silence (खामोशी)' },
    { id: 'hope', label: 'Hope (उम्मीद)' },
    { id: 'life', label: 'Life (ज़िंदगी)' },
    { id: 'motivation', label: 'Motivation (हौसला)' },
    { id: 'spirituality', label: 'Spirituality (रूह)' },
  ];

  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'hindi', label: 'Hindi (हिंदी)' },
    { id: 'english', label: 'English' },
    { id: 'hinglish', label: 'Hinglish' },
    { id: 'urdu', label: 'Urdu (उर्दू)' },
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort,
        page: 1,
        page_size: 30,
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedMood !== 'all') params.mood = selectedMood;
      if (selectedLanguage !== 'all') params.language = selectedLanguage;
      if (selectedType !== 'all') params.content_type = selectedType;

      const data = await api.getFeed(params);
      setPosts(data.items || []);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sort, selectedMood, selectedLanguage, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleToggleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('auth', { mode: 'login' });
      return;
    }
    try {
      const res = await api.toggleLike(postId);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, is_liked: res.liked, likes_count: res.likes_count };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error toggling like', err);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('auth', { mode: 'login' });
      return;
    }
    try {
      const res = await api.toggleBookmark(postId);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, is_bookmarked: res.bookmarked, bookmarks_count: res.bookmarks_count };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error toggling bookmark', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-verse-violet/10 text-verse-violet text-xs font-medium mb-3 border border-verse-violet/20">
          <Compass className="w-3.5 h-3.5" />
          <span>Public Literary Feed</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-50 tracking-tight">
          Explore Poetry & Reflections
        </h1>
        <p className="text-sm text-ivory-400 mt-3">
          Immerse yourself in authentic verses across Hindi, English, and Hinglish.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-charcoal-800 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-ivory-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, line, or tag..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl glass-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-verse-violet"
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 px-3 py-1 bg-verse-violet text-ivory-50 text-xs rounded-lg hover:bg-verse-violet/90 transition"
            >
              Search
            </button>
          </form>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1 p-1 bg-charcoal-900 rounded-xl border border-charcoal-800 w-full md:w-auto justify-center">
            <button
              onClick={() => setSort('latest')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                sort === 'latest' ? 'bg-verse-violet text-ivory-50 shadow' : 'text-ivory-400 hover:text-ivory-100'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSort('popular')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                sort === 'popular' ? 'bg-verse-violet text-ivory-50 shadow' : 'text-ivory-400 hover:text-ivory-100'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSort('trending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                sort === 'trending' ? 'bg-verse-violet text-ivory-50 shadow' : 'text-ivory-400 hover:text-ivory-100'
              }`}
            >
              Trending
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 pt-3 border-t border-charcoal-800 flex flex-wrap items-center gap-2">
          {/* Mood Pills */}
          <div className="flex flex-wrap gap-1.5">
            {moods.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition ${
                  selectedMood === m.id
                    ? 'bg-verse-violet text-ivory-50 shadow-sm'
                    : 'bg-charcoal-800/80 text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-4 w-px bg-charcoal-700 mx-2" />

          {/* Language Pills */}
          <div className="flex flex-wrap gap-1.5">
            {languages.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLanguage(l.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition ${
                  selectedLanguage === l.id
                    ? 'bg-verse-rose text-ivory-50 shadow-sm'
                    : 'bg-charcoal-800/80 text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed Grid */}
      {loading ? (
        <div className="py-24 text-center text-ivory-400 text-sm">
          Gathering verses from the community...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-charcoal-800 p-8">
          <Compass className="w-12 h-12 text-ivory-500 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-ivory-100">No verses match your filters</h3>
          <p className="text-xs text-ivory-400 max-w-sm mx-auto mt-2 mb-6">
            Try adjusting your search query, mood, or language selections.
          </p>
          <button
            onClick={() => { setSelectedMood('all'); setSelectedLanguage('all'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium hover:bg-verse-violet/90 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => onNavigate('reading', { slug: post.slug || post.id })}
              className="glass-panel rounded-2xl p-6 border border-charcoal-800 hover:border-verse-violet/40 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Author Info & Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex items-center space-x-2"
                    onClick={(e) => { e.stopPropagation(); onNavigate('profile', { username: post.author.username }); }}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-verse-violet to-verse-rose flex items-center justify-center font-bold text-[11px] text-ivory-50">
                      {post.author.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ivory-200 hover:text-verse-violet transition">
                        {post.author.full_name}
                      </p>
                      <p className="text-[10px] text-ivory-400">@{post.author.username}</p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-verse-violet/10 text-verse-violet border border-verse-violet/20 uppercase tracking-wider font-sans">
                    {post.content_type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl font-bold text-ivory-50 mb-3 group-hover:text-verse-violet transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="font-serif text-sm text-ivory-300 leading-relaxed whitespace-pre-line line-clamp-4 italic mb-4">
                  {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-charcoal-800 text-ivory-400 border border-charcoal-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Interactions */}
              <div className="pt-4 border-t border-charcoal-800/80 flex items-center justify-between text-xs text-ivory-400">
                <div className="flex items-center space-x-4">
                  {/* Like */}
                  <button
                    onClick={(e) => handleToggleLike(e, post.id)}
                    className={`flex items-center space-x-1.5 hover:text-verse-rose transition ${
                      post.is_liked ? 'text-verse-rose' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-verse-rose' : ''}`} />
                    <span>{post.likes_count}</span>
                  </button>

                  {/* Comments count */}
                  <span className="flex items-center space-x-1 hover:text-verse-violet transition">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Bookmark */}
                  <button
                    onClick={(e) => handleToggleBookmark(e, post.id)}
                    className={`p-1.5 hover:text-verse-violet hover:bg-charcoal-800 rounded transition ${
                      post.is_bookmarked ? 'text-verse-violet' : ''
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-verse-violet' : ''}`} />
                  </button>

                  <span className="text-verse-violet group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
