import React, { useEffect, useState } from 'react';
import { Feather, Heart, Bookmark, Globe, UserCheck, UserPlus, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile, PostResponse } from '@verseora/shared-types';

interface ProfilePageProps {
  username: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ username, onNavigate }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const prof = await api.getProfile(username);
      setProfile(prof);

      // Fetch public works of this author
      const authorWorks = await api.getAuthorPosts(prof.id, 1);
      setPosts(authorWorks.items || []);
    } catch (err: any) {
      setError(err.message || 'Profile could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [username]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      onNavigate('auth', { mode: 'login' });
      return;
    }
    if (!profile) return;

    try {
      const res = await api.toggleFollow(profile.id);
      setProfile(prev => prev ? {
        ...prev,
        is_following: res.following,
        followers_count: res.followers_count
      } : null);
    } catch (err: any) {
      alert(err.message || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-ivory-400 text-sm">
        Retrieving poet profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="p-8 rounded-3xl glass-panel border border-charcoal-800">
          <Feather className="w-12 h-12 text-ivory-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-ivory-100 mb-2">Poet Not Found</h2>
          <p className="text-xs text-ivory-400 mb-6">{error || 'This account does not exist or has been removed.'}</p>
          <button
            onClick={() => onNavigate('explore')}
            className="px-5 py-2.5 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium"
          >
            Explore Literature
          </button>
        </div>
      </div>
    );
  }

  const isSelf = currentUser && currentUser.id === profile.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-charcoal-800 mb-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-verse-violet via-verse-indigo to-verse-rose flex items-center justify-center text-3xl font-bold text-ivory-50 shadow-xl shadow-verse-violet/20 flex-shrink-0">
            {profile.full_name.charAt(0)}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory-50">
                  {profile.full_name}
                </h1>
                <p className="text-xs text-ivory-400 mt-0.5">@{profile.username}</p>
              </div>

              {/* Follow / Edit Button */}
              <div>
                {isSelf ? (
                  <button
                    onClick={() => onNavigate('settings')}
                    className="px-4 py-2 rounded-xl glass-panel border border-charcoal-700 text-xs font-medium text-ivory-200 hover:text-ivory-50 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleToggleFollow}
                    className={`px-5 py-2 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 ${
                      profile.is_following
                        ? 'bg-charcoal-800 text-ivory-300 border border-charcoal-700'
                        : 'bg-verse-violet text-ivory-50 shadow-md shadow-verse-violet/20 hover:bg-verse-violet/90'
                    }`}
                  >
                    {profile.is_following ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow Poet</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-xs sm:text-sm text-ivory-300 mt-4 leading-relaxed max-w-2xl whitespace-pre-line font-serif italic">
                "{profile.bio}"
              </p>
            )}

            {/* Counters */}
            <div className="flex items-center justify-center sm:justify-start space-x-6 mt-6 text-xs text-ivory-400">
              <div>
                <span className="font-bold text-ivory-50 mr-1">{profile.posts_count}</span>
                <span>Published Verses</span>
              </div>
              <div>
                <span className="font-bold text-ivory-50 mr-1">{profile.followers_count}</span>
                <span>Followers</span>
              </div>
              <div>
                <span className="font-bold text-ivory-50 mr-1">{profile.following_count}</span>
                <span>Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Published Works Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-ivory-50">
          Published Works ({posts.length})
        </h2>
      </div>

      {posts.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-charcoal-800 p-8">
          <Feather className="w-10 h-10 text-ivory-500 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-ivory-200">No public verses yet</h3>
          <p className="text-xs text-ivory-400 mt-1">
            This poet has not published any public works yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => onNavigate('reading', { slug: post.slug || post.id })}
              className="glass-panel rounded-2xl p-6 border border-charcoal-800 hover:border-verse-violet/40 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-verse-violet/10 text-verse-violet border border-verse-violet/20">
                    {post.content_type} · {post.language}
                  </span>
                  <span className="text-xs text-ivory-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-ivory-100 mb-2 group-hover:text-verse-violet transition">
                  {post.title}
                </h3>

                <p className="text-xs text-ivory-300 line-clamp-3 leading-relaxed mb-4 italic font-serif">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-ivory-400">
                <span className="flex items-center space-x-1 text-verse-rose">
                  <Heart className="w-3.5 h-3.5 fill-verse-rose" />
                  <span>{post.likes_count}</span>
                </span>

                <span className="text-verse-violet group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

