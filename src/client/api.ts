import {
  PurchaseRequest,
  PurchaseProposal,
  AgentRun,
  SpendingPolicy,
  ApprovalRecord,
  PaymentTransaction,
  AuditLogEntry,
  Organization,
} from '../types';

import { UserProfile, AuthSession } from '../types/auth';

const BASE_URL = '/api/v1';

const TOKEN_KEY = 'procurapay_auth_token';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

const getHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async register(data: { fullName: string; email: string; password: string; companyName: string }): Promise<{
    user: UserProfile;
    verificationToken: string;
  }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async verifyEmail(token: string): Promise<{ user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Email verification failed');
    }
    return res.json();
  },

  async resendVerification(email: string): Promise<{ message: string; verificationToken?: string }> {
    const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Resending verification email failed');
    }
    return res.json();
  },

  async login(data: { email: string; password: string }): Promise<{ session: AuthSession; isVerified: boolean }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      const error: any = new Error(result.error || 'Invalid credentials');
      error.isVerified = result.isVerified;
      error.email = result.email;
      throw error;
    }
    if (result.session?.token) {
      authStorage.setToken(result.session.token);
    }
    return result;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request password reset');
    }
    return res.json();
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reset password');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    const token = authStorage.getToken();
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    });
    authStorage.clearToken();
  },

  async getMe(): Promise<{ user: UserProfile; organization: Organization; isAuthenticated: boolean }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateOrganization(data: Partial<Organization>): Promise<{ organization: Organization }> {
    const res = await fetch(`${BASE_URL}/organizations/current`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Procurement
  async getRequests(): Promise<{ requests: PurchaseRequest[] }> {
    const res = await fetch(`${BASE_URL}/procurement/requests`);
    return res.json();
  },

  async getRequest(id: string): Promise<{ request: PurchaseRequest; proposal?: PurchaseProposal; agentRun?: AgentRun }> {
    const res = await fetch(`${BASE_URL}/procurement/requests/${id}`);
    if (!res.ok) throw new Error('Request not found');
    return res.json();
  },

  async createRequest(data: {
    rawPrompt: string;
    title?: string;
    category?: string;
    quantity: number;
    maxBudget: number; // cents
    mandatorySpecs: string[];
    preferences: string[];
  }): Promise<{ request: PurchaseRequest }> {
    const res = await fetch(`${BASE_URL}/procurement/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create request');
    }
    return res.json();
  },

  async runAgent(requestId: string): Promise<{ agentRun: AgentRun; proposal?: PurchaseProposal }> {
    const res = await fetch(`${BASE_URL}/procurement/requests/${requestId}/run-agent`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Agent execution failed');
    }
    return res.json();
  },

  // Proposals & Approvals
  async getApprovals(): Promise<{
    pendingProposals: { proposal: PurchaseProposal; request?: PurchaseRequest }[];
    history: ApprovalRecord[];
  }> {
    const res = await fetch(`${BASE_URL}/approvals`);
    return res.json();
  },

  async approveProposal(id: string): Promise<{ approval: ApprovalRecord; proposal: PurchaseProposal }> {
    const res = await fetch(`${BASE_URL}/approvals/${id}/approve`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to approve');
    }
    return res.json();
  },

  async rejectProposal(id: string, reason: string): Promise<{ approval: ApprovalRecord; proposal: PurchaseProposal }> {
    const res = await fetch(`${BASE_URL}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reject');
    }
    return res.json();
  },

  // Policies
  async getPolicy(): Promise<{ policy: SpendingPolicy }> {
    const res = await fetch(`${BASE_URL}/policies`);
    return res.json();
  },

  async updatePolicy(id: string, data: Partial<SpendingPolicy>): Promise<{ policy: SpendingPolicy }> {
    const res = await fetch(`${BASE_URL}/policies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Payments
  async createPayPalOrder(proposalId: string): Promise<{
    transaction: PaymentTransaction;
    paypalOrderId: string;
    approvalUrl?: string;
  }> {
    const res = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create PayPal order');
    }
    return res.json();
  },

  async capturePayPalOrder(transactionId: string, paypalOrderId: string): Promise<{ transaction: PaymentTransaction }> {
    const res = await fetch(`${BASE_URL}/payments/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, paypalOrderId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to capture PayPal order');
    }
    return res.json();
  },

  async getPayments(): Promise<{ payments: PaymentTransaction[] }> {
    const res = await fetch(`${BASE_URL}/payments`);
    return res.json();
  },

  // Analytics & Audit
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${BASE_URL}/analytics/overview`);
    return res.json();
  },

  async getAuditLogs(): Promise<{ auditLogs: AuditLogEntry[] }> {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    return res.json();
  },

  // Integrations & Currency
  async getIntegrationsStatus(): Promise<{ timestamp: string; integrations: any[] }> {
    const res = await fetch(`${BASE_URL}/integrations/status`);
    return res.json();
  },

  async getCurrencyRates(base: string = 'USD'): Promise<{ baseCurrency: string; date: string; rates: Record<string, number>; source: string }> {
    const res = await fetch(`${BASE_URL}/currency/rates?base=${encodeURIComponent(base)}`);
    return res.json();
  },

  async convertCurrency(amount: number, from: string, to: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/currency/convert`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, from, to }),
    });
    return res.json();
  },

  async getInvoice(transactionId: string): Promise<{ invoice: any }> {
    const res = await fetch(`${BASE_URL}/invoices/${encodeURIComponent(transactionId)}`);
    return res.json();
  },
};
