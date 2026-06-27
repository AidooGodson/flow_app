import { API_BASE_URL } from '../constants/config';
import type { Report, User, CreateReportPayload } from './types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
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
