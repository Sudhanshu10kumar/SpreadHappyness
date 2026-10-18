/**
 * Verseora Shared Type Definitions
 * Shared domain models, enums, and API interfaces between apps/web and backend contracts.
 */

export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export type ContentType = 
  | 'thought' 
  | 'shayari' 
  | 'poem' 
  | 'quote' 
  | 'story' 
  | 'reflection';

export type Language = 
  | 'hindi' 
  | 'english' 
  | 'hinglish' 
  | 'urdu' 
  | 'other';

export type PostStatus = 
  | 'draft' 
  | 'published' 
  | 'archived';

export type Visibility = 
  | 'private' 
  | 'unlisted' 
  | 'public';

export type Mood = 
  | 'love' 
  | 'heartbreak' 
  | 'hope' 
  | 'life' 
  | 'silence' 
  | 'motivation' 
  | 'spirituality' 
  | 'friendship';

export interface UserSummary {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  role: Role;
  is_verified: boolean;
  created_at: string;
}

export interface UserProfile extends UserSummary {
  email?: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

export interface PostThemeSettings {
  background_style?: 'charcoal' | 'midnight' | 'parchment' | 'rose_veil' | 'aurora';
  font_family?: 'serif_classic' | 'serif_devanagari' | 'sans_clean' | 'calligraphy';
  font_size?: 'normal' | 'large' | 'cinematic';
  text_alignment?: 'left' | 'center' | 'justify';
}

export interface Post {
  id: string;
  author_id: string;
  author: UserSummary;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  content_type: ContentType;
  language: Language;
  status: PostStatus;
  visibility: Visibility;
  mood?: Mood | null;
  tags: string[];
  theme_settings: PostThemeSettings;
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type PostResponse = Post;

export interface PostListResponse {
  items: Post[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface PostVersion {
  id: string;
  post_id: string;
  title: string;
  content: string;
  version_number: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: UserSummary;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor: UserSummary;
  type: 'like' | 'comment' | 'follow' | 'system';
  post_id?: string | null;
  post_title?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  reporter?: UserSummary;
  post_id?: string | null;
  reported_user_id?: string | null;
  reason: string;
  details?: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string | null;
}
