import { API_BASE_URL } from '../constants/config';
import { tokenStore } from './tokenStore';
import type { Report, User, CreateReportPayload } from './types';

let _refreshing = false;

async function refreshTokens(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh || _refreshing) return false;
  _refreshing = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const { access_token, refresh_token, expires_at } = await res.json();
    tokenStore.set(access_token, refresh_token, expires_at);
    await tokenStore.onTokensRefreshed?.(access_token, refresh_token, expires_at);
    return true;
  } catch {
    return false;
  } finally {
    _refreshing = false;
  }
}

async function request<T>(path: string, options?: RequestInit, isRetry = false): Promise<T> {
  // Proactively refresh if token is expiring soon
  if (!isRetry && tokenStore.isExpiringSoon()) {
    await refreshTokens();
  }

  const token = tokenStore.get();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401 && !isRetry) {
    // Try refreshing once before giving up
    const refreshed = await refreshTokens();
    if (refreshed) return request<T>(path, options, true);
    tokenStore.unauthorized();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string): Promise<{
      access_token: string;
      refresh_token: string;
      expires_at: number;
      user: User;
    }> =>
      request('/api/auth', { method: 'POST', body: JSON.stringify({ email, password }) }),
  },

  users: {
    list: (): Promise<{ data: User[] }> =>
      request('/api/users'),
  },

  reports: {
    list: (userId: string): Promise<{ data: Report[] }> =>
      request(`/api/reports?userId=${encodeURIComponent(userId)}`),

    get: (id: string): Promise<{ data: Report }> =>
      request(`/api/reports/${id}`),

    create: (payload: CreateReportPayload): Promise<{ data: Report }> =>
      request('/api/reports', { method: 'POST', body: JSON.stringify(payload) }),
  },
};
