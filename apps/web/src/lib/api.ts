/**
 * Verseora HTTP Client
 * Secure wrapper for API communication, token attachment, and unified error handling.
 */

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('verseora_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    let data;
    try {
      data = await response.json();
      errorDetail = data.detail || data.message || errorDetail;
    } catch {
      // response was not JSON
    }
    throw new ApiError(errorDetail, response.status, data);
  }

  // Handle empty 204 or non-JSON response
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Users & Profiles
  getProfile: (username: string) => request<any>(`/users/${username}`),
  updateProfile: (body: any) => request<any>('/users/profile/me', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body: any) => request<any>('/users/profile/change-password', { method: 'POST', body: JSON.stringify(body) }),
  deleteAccount: (body: any) => request<any>('/users/profile/delete-account', { method: 'DELETE', body: JSON.stringify(body) }),

  // Posts & Studio
  createDraft: (body: any) => request<any>('/posts/', { method: 'POST', body: JSON.stringify(body) }),
  updatePost: (id: string, body: any) => request<any>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePost: (id: string) => request<any>(`/posts/${id}`, { method: 'DELETE' }),
  getPost: (idOrSlug: string) => request<any>(`/posts/${idOrSlug}`),
  getFeed: (params: Record<string, any>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        search.append(k, String(v));
      }
    });
    return request<any>(`/posts/feed?${search.toString()}`);
  },
  getDrafts: (page = 1) => request<any>(`/posts/drafts?page=${page}`),
  getAuthorPosts: (authorId: string, page = 1) => request<any>(`/posts/user/${authorId}?page=${page}`),
  getPostVersions: (postId: string) => request<any>(`/posts/${postId}/versions`),

  // Social
  toggleLike: (postId: string) => request<any>(`/social/posts/${postId}/like`, { method: 'POST' }),
  toggleBookmark: (postId: string) => request<any>(`/social/posts/${postId}/bookmark`, { method: 'POST' }),
  toggleFollow: (userId: string) => request<any>(`/social/users/${userId}/follow`, { method: 'POST' }),
  addComment: (postId: string, content: string) => request<any>(`/social/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  getComments: (postId: string) => request<any>(`/social/posts/${postId}/comments`),
  getMyBookmarks: () => request<any>('/social/bookmarks'),

  // Collections
  getCollections: (userId?: string) => request<any>(`/collections/${userId ? `?user_id=${userId}` : ''}`),
  getCollection: (id: string) => request<any>(`/collections/${id}`),
  createCollection: (body: any) => request<any>('/collections/', { method: 'POST', body: JSON.stringify(body) }),
  addToCollection: (collectionId: string, postId: string) => request<any>(`/collections/${collectionId}/items/${postId}`, { method: 'POST' }),
  removeFromCollection: (collectionId: string, postId: string) => request<any>(`/collections/${collectionId}/items/${postId}`, { method: 'DELETE' }),
  deleteCollection: (collectionId: string) => request<any>(`/collections/${collectionId}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request<any>('/notifications/'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),

  // Moderation & Admin
  submitReport: (body: any) => request<any>('/admin/reports', { method: 'POST', body: JSON.stringify(body) }),
  getAdminReports: (status?: string) => request<any>(`/admin/reports${status ? `?status_filter=${status}` : ''}`),
  resolveReport: (reportId: string, resolution: string, notes?: string) =>
    request<any>(`/admin/reports/${reportId}/resolve?resolution=${resolution}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`, { method: 'POST' }),
  applyModerationAction: (body: any) => request<any>('/admin/actions', { method: 'POST', body: JSON.stringify(body) }),
  getAuditLogs: (limit = 50) => request<any>(`/admin/audit-logs?limit=${limit}`),

  // GDPR Export
  exportMyData: () => request<any>('/export/my-data'),
};

