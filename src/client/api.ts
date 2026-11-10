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

import { sanitizeErrorMessage } from '../utils/errorUtils';

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

export class ApiError extends Error {
  status: number;
  data: any;
  isVerified?: boolean;
  email?: string;
  code?: string;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    if (data && typeof data === 'object') {
      this.isVerified = data.isVerified;
      this.email = data.email;
      this.code = data.code;
    }
  }
}

/**
 * Reusable HTTP API response handler.
 * Safely parses responses, inspects HTTP status, checks Content-Type,
 * and shields the UI from raw HTML or JSON SyntaxErrors (e.g. "Unexpected token 'T', 'The page c'...").
 */
export async function parseResponse<T = any>(
  res: Response,
  fallbackMessage = 'Request failed. Please try again.'
): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  let parsed: any = null;

  if (contentType.includes('application/json')) {
    try {
      parsed = await res.json();
    } catch (jsonErr) {
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        console.warn('[API] JSON parse error:', jsonErr);
      }
      parsed = null;
    }
  } else {
    // Non-JSON response (e.g. HTML proxy warmup, 502 Bad Gateway text, plain error)
    try {
      const text = await res.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        parsed = JSON.parse(trimmed);
      } else if (typeof window !== 'undefined' && (window as any).__DEV__) {
        console.warn(`[API] Received non-JSON response (${res.status} ${contentType}):`, text.slice(0, 150));
      }
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    let rawError = (parsed && (parsed.error || parsed.message)) || '';
    if (!rawError) {
      if (res.status === 404) {
        rawError = 'The requested endpoint was not found.';
      } else if (res.status === 401) {
        rawError = 'Invalid email or password. Please try again.';
      } else if (res.status === 403) {
        rawError = parsed?.error || 'Email verification is required before signing in.';
      } else if (res.status >= 500) {
        rawError = 'The authentication server is temporarily unavailable. Please try again shortly.';
      } else {
        rawError = fallbackMessage;
      }
    }

    const cleanError = sanitizeErrorMessage(rawError, fallbackMessage);
    throw new ApiError(cleanError, res.status, parsed);
  }

  if (parsed === null) {
    return {} as T;
  }

  return parsed as T;
}

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
    return parseResponse(res, 'Registration failed. Please try again.');
  },

  async verifyEmail(token: string): Promise<{ user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return parseResponse(res, 'Email verification failed. Please try again.');
  },

  async resendVerification(email: string): Promise<{ message: string; verificationToken?: string }> {
    const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return parseResponse(res, 'Resending verification email failed. Please try again.');
  },

  async login(data: { email: string; password: string }): Promise<{ session: AuthSession; isVerified: boolean }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await parseResponse<{ session: AuthSession; isVerified: boolean }>(
      res,
      'Invalid email or password.'
    );
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
    return parseResponse(res, 'Failed to request password reset. Please try again.');
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return parseResponse(res, 'Failed to reset password. Please try again.');
  },

  async logout(): Promise<void> {
    const token = authStorage.getToken();
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token }),
      });
    } catch {}
    authStorage.clearToken();
  },

  async getMe(): Promise<{ user: UserProfile; organization: Organization; isAuthenticated: boolean }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders(),
      });
      return await parseResponse(res, 'Session check failed');
    } catch {
      return {
        user: null as any,
        organization: null as any,
        isAuthenticated: false,
      };
    }
  },

  async updateOrganization(data: Partial<Organization>): Promise<{ organization: Organization }> {
    const res = await fetch(`${BASE_URL}/organizations/current`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Failed to update organization');
  },

  // Procurement
  async getRequests(): Promise<{ requests: PurchaseRequest[] }> {
    const res = await fetch(`${BASE_URL}/procurement/requests`);
    return parseResponse(res, 'Failed to fetch purchase requests');
  },

  async getRequest(id: string): Promise<{ request: PurchaseRequest; proposal?: PurchaseProposal; agentRun?: AgentRun }> {
    const res = await fetch(`${BASE_URL}/procurement/requests/${id}`);
    return parseResponse(res, 'Request not found');
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
    return parseResponse(res, 'Failed to create request');
  },

  async runAgent(requestId: string): Promise<{ agentRun: AgentRun; proposal?: PurchaseProposal }> {
    const res = await fetch(`${BASE_URL}/procurement/requests/${requestId}/run-agent`, {
      method: 'POST',
    });
    return parseResponse(res, 'Agent execution failed');
  },

  // Proposals & Approvals
  async getApprovals(): Promise<{
    pendingProposals: { proposal: PurchaseProposal; request?: PurchaseRequest }[];
    history: ApprovalRecord[];
  }> {
    const res = await fetch(`${BASE_URL}/approvals`);
    return parseResponse(res, 'Failed to fetch approvals');
  },

  async approveProposal(id: string): Promise<{ approval: ApprovalRecord; proposal: PurchaseProposal }> {
    const res = await fetch(`${BASE_URL}/approvals/${id}/approve`, {
      method: 'POST',
    });
    return parseResponse(res, 'Failed to approve');
  },

  async rejectProposal(id: string, reason: string): Promise<{ approval: ApprovalRecord; proposal: PurchaseProposal }> {
    const res = await fetch(`${BASE_URL}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return parseResponse(res, 'Failed to reject');
  },

  // Policies
  async getPolicy(): Promise<{ policy: SpendingPolicy }> {
    const res = await fetch(`${BASE_URL}/policies`);
    return parseResponse(res, 'Failed to fetch policy');
  },

  async updatePolicy(id: string, data: Partial<SpendingPolicy>): Promise<{ policy: SpendingPolicy }> {
    const res = await fetch(`${BASE_URL}/policies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Failed to update policy');
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
    return parseResponse(res, 'Failed to create PayPal order');
  },

  async capturePayPalOrder(transactionId: string, paypalOrderId: string): Promise<{ transaction: PaymentTransaction }> {
    const res = await fetch(`${BASE_URL}/payments/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, paypalOrderId }),
    });
    return parseResponse(res, 'Failed to capture PayPal order');
  },

  async getPayments(): Promise<{ payments: PaymentTransaction[] }> {
    const res = await fetch(`${BASE_URL}/payments`);
    return parseResponse(res, 'Failed to fetch payments');
  },

  // Analytics & Audit
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${BASE_URL}/analytics/overview`);
    return parseResponse(res, 'Failed to fetch analytics');
  },

  async getAuditLogs(): Promise<{ auditLogs: AuditLogEntry[] }> {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    return parseResponse(res, 'Failed to fetch audit logs');
  },

  // Integrations & Currency
  async getIntegrationsStatus(): Promise<{ timestamp: string; integrations: any[] }> {
    const res = await fetch(`${BASE_URL}/integrations/status`);
    return parseResponse(res, 'Failed to fetch integrations status');
  },

  async getCurrencyRates(base: string = 'USD'): Promise<{ baseCurrency: string; date: string; rates: Record<string, number>; source: string }> {
    const res = await fetch(`${BASE_URL}/currency/rates?base=${encodeURIComponent(base)}`);
    return parseResponse(res, 'Failed to fetch currency rates');
  },

  async convertCurrency(amount: number, from: string, to: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/currency/convert`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, from, to }),
    });
    return parseResponse(res, 'Failed to convert currency');
  },

  async getInvoice(transactionId: string): Promise<{ invoice: any }> {
    const res = await fetch(`${BASE_URL}/invoices/${encodeURIComponent(transactionId)}`);
    return parseResponse(res, 'Failed to fetch invoice');
  },
};
