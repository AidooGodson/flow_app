export type UserRole = 'manager' | 'sales_rep';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Report {
  id: string;
  userId: string | null;
  date: string;
  customerName: string;
  telephone: string;
  location: string | null;
  product: string;
  buyerType: string;
  comments: string | null;
  summary: string | null;
  followUpDate: string | null;
  followedUpBy: string;
  status: string;
  createdAt: string;
  createdBy: string;
  userName?: string | null;
  userEmail?: string | null;
}

export interface CreateReportPayload {
  userId: string;
  date: string;
  customerName: string;
  telephone: string;
  location?: string;
  product: string;
  buyerType: string;
  comments?: string;
  summary?: string;
  followUpDate?: string;
}
