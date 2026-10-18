import React, { useEffect, useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Sparkles, CheckCheck } from 'lucide-react';
import { api } from '../lib/api';
import { NotificationItem } from '@verseora/shared-types';

interface NotificationsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string, postId?: string | null) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (postId) {
        onNavigate('reading', { slug: postId });
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-charcoal-800">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ivory-50">Notifications</h1>
          <p className="text-xs text-ivory-400 mt-1">Updates on your published verses and followers.</p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-verse-violet hover:bg-verse-violet/10 transition border border-verse-violet/20"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-ivory-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-charcoal-800 p-8">
          <Bell className="w-10 h-10 text-ivory-500 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-ivory-200">No new notifications</h3>
          <p className="text-xs text-ivory-400 mt-1">When readers appreciate your lines or follow you, you'll see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id, n.post_id)}
              className={`p-4 rounded-xl glass-panel border cursor-pointer transition flex items-center justify-between ${
                !n.is_read ? 'border-verse-violet/40 bg-verse-violet/5' : 'border-charcoal-800 hover:border-charcoal-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-charcoal-800 flex items-center justify-center flex-shrink-0">
                  {n.type === 'like' && <Heart className="w-4 h-4 text-verse-rose fill-verse-rose" />}
                  {n.type === 'comment' && <MessageCircle className="w-4 h-4 text-verse-violet" />}
                  {n.type === 'follow' && <UserPlus className="w-4 h-4 text-verse-teal" />}
                  {n.type === 'system' && <Sparkles className="w-4 h-4 text-verse-amber" />}
                </div>

                <div>
                  <p className="text-xs text-ivory-200">
                    <span className="font-bold text-ivory-50">{n.actor?.full_name}</span>{' '}
                    {n.type === 'like' && `appreciated your poem "${n.post_title || 'a verse'}"`}
                    {n.type === 'comment' && `left a reflection on "${n.post_title || 'a verse'}"`}
                    {n.type === 'follow' && `started following your journey`}
                    {n.type === 'system' && `Welcome to Verseora.`}
                  </p>
                  <p className="text-[10px] text-ivory-400 mt-0.5">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-verse-violet flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

