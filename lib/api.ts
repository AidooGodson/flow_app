import { API_BASE_URL } from '../constants/config';
import { tokenStore } from './tokenStore';
import type { Report, User, CreateReportPayload } from './types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
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
    login: (email: string, password: string): Promise<{ access_token: string; user: User }> =>
      request('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
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
      request('/api/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
