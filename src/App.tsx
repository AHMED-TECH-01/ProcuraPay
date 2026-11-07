import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/dashboard/OverviewView';
import { ProcurementListView } from './components/procurement/ProcurementListView';
import { AgentWorkspace } from './components/agent/AgentWorkspace';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { TransactionsView } from './components/payments/TransactionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { PoliciesView } from './components/policies/PoliciesView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { ProductCatalogView } from './components/catalog/ProductCatalogView';
import { SettingsView } from './components/settings/SettingsView';
import { NewRequestModal } from './components/procurement/NewRequestModal';
import { PayPalCheckoutModal } from './components/payments/PayPalCheckoutModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { VerifyEmailView } from './components/auth/VerifyEmailView';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { api, authStorage } from './client/api';
import { UserProfile } from './types/auth';
import {
  PurchaseRequest,
  PurchaseProposal,
  AgentRun,
  Organization,
  SpendingPolicy,
  PaymentTransaction,
  ApprovalRecord,
  AuditLogEntry,
} from './types';

export type AppRoute =
  | '/'
  | '/login'
  | '/signup'
  | '/verify-email'
  | '/forgot-password'
  | '/reset-password'
  | '/dashboard';

export default function App() {
  // Navigation Routing
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const path = window.location.pathname;
    if (['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password', '/dashboard'].includes(path)) {
      return path as AppRoute;
    }
    return '/';
  });

  // Auth & Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [activeResetToken, setActiveResetToken] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Dashboard Data State
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [activeProposal, setActiveProposal] = useState<PurchaseProposal | undefined>(undefined);
  const [activeAgentRun, setActiveAgentRun] = useState<AgentRun | undefined>(undefined);
  const [policy, setPolicy] = useState<SpendingPolicy | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<
    { proposal: PurchaseProposal; request?: PurchaseRequest }[]
  >([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Modals
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [checkoutProposal, setCheckoutProposal] = useState<PurchaseProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync route changes with browser history
  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    try {
      window.history.pushState({}, '', route);
    } catch {}
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (['/', '/login', '/signup', '/verify-email', '/forgot-password', '/reset-password', '/dashboard'].includes(path)) {
        setCurrentRoute(path as AppRoute);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.getMe();
        if (res.isAuthenticated && res.user) {
          setCurrentUser(res.user);
          setOrganization(res.organization);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Auth check error:', err);
        setCurrentUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };
    initAuth();
  }, []);

  // Refresh procurement and organization data when in /dashboard
  const refreshData = async () => {
    try {
      const [
        meRes,
        reqRes,
        policyRes,
        payRes,
        apprRes,
        analyticsRes,
        auditRes,
      ] = await Promise.all([
        api.getMe(),
        api.getRequests(),
        api.getPolicy(),
        api.getPayments(),
        api.getApprovals(),
        api.getAnalytics(),
        api.getAuditLogs(),
      ]);

      if (meRes.user) setCurrentUser(meRes.user);
      setOrganization(meRes.organization);
      setRequests(reqRes.requests);
      setPolicy(policyRes.policy);
      setPayments(payRes.payments);
      setPendingApprovals(apprRes.pendingProposals);
      setApprovalHistory(apprRes.history);
      setAnalytics(analyticsRes);
      setAuditLogs(auditRes.auditLogs);

      if (selectedRequest) {
        try {
          const detailRes = await api.getRequest(selectedRequest.id);
          setSelectedRequest(detailRes.request);
          setActiveProposal(detailRes.proposal);
          setActiveAgentRun(detailRes.agentRun);
        } catch {}
      }
    } catch (err) {
      console.error('Error refreshing ProcuraPay AI data:', err);
    }
  };

  useEffect(() => {
    if (currentRoute === '/dashboard') {
      refreshData();
    }
  }, [currentRoute]);

  // Route Protection Rules:
  // If user attempts to enter /dashboard without authenticated session:
  useEffect(() => {
    if (!isAuthChecking) {
      if (currentRoute === '/dashboard' && !currentUser) {
        navigateTo('/login');
      } else if (currentRoute === '/dashboard' && currentUser && !currentUser.emailVerified) {
        setPendingVerificationEmail(currentUser.email);
        navigateTo('/verify-email');
      }
    }
  }, [currentRoute, currentUser, isAuthChecking]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    navigateTo('/dashboard');
  };

  const handleSignupSuccess = (email: string, token: string) => {
    setPendingVerificationEmail(email);
    setVerificationToken(token);
    navigateTo('/verify-email');
  };

  const handleVerified = (user: UserProfile) => {
    setCurrentUser(user);
    navigateTo('/dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    navigateTo('/login');
  };

  // Procurement Handlers
  const handleSelectRequest = async (req: PurchaseRequest) => {
    try {
      setIsLoading(true);
      const res = await api.getRequest(req.id);
      setSelectedRequest(res.request);
      setActiveProposal(res.proposal);
      setActiveAgentRun(res.agentRun);
      setCurrentTab('agent-activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (data: {
    rawPrompt: string;
    title: string;
    category: string;
    quantity: number;
    maxBudget: number;
    mandatorySpecs: string[];
    preferences: string[];
  }): Promise<PurchaseRequest> => {
    const res = await api.createRequest(data);
    await refreshData();
    handleSelectRequest(res.request);
    handleRunAgent(res.request.id);
    return res.request;
  };

  const handleRunAgent = async (requestId: string) => {
    try {
      setIsLoading(true);
      const result = await api.runAgent(requestId);
      setActiveAgentRun(result.agentRun);
      if (result.proposal) setActiveProposal(result.proposal);
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProposal = async (proposalId: string) => {
    await api.approveProposal(proposalId);
    await refreshData();
  };

  const handleRejectProposal = async (proposalId: string, reason: string) => {
    await api.rejectProposal(proposalId, reason);
    await refreshData();
  };

  const handleRunDemoScenario = async (scenario: 'monitors' | 'laptops') => {
    if (scenario === 'monitors') {
      await handleCreateRequest({
        rawPrompt: 'Find two 4K monitors with USB-C under $250 each. Prefer reliable suppliers with fast delivery.',
        title: 'Two 4K Monitors with USB-C',
        category: 'Displays & Monitors',
        quantity: 2,
        maxBudget: 50000,
        mandatorySpecs: ['4K UHD resolution', 'USB-C connectivity with Power Delivery'],
        preferences: ['IPS panel', 'Under $250 each', 'B&H Photo or Dell supplier'],
      });
    } else {
      await handleCreateRequest({
        rawPrompt: 'Find five business laptops with at least 16GB RAM, 512GB SSD, and a maximum total budget of $4,000. Prefer reliable suppliers.',
        title: 'Five 16GB RAM / 512GB SSD Business Laptops',
        category: 'Computers & Laptops',
        quantity: 5,
        maxBudget: 400000,
        mandatorySpecs: ['16GB RAM', '512GB SSD', 'Windows 11 Pro'],
        preferences: ['Lenovo ThinkPad or Dell Latitude', 'Ryzen 5 or Intel i5'],
      });
    }
  };

  const handleUpdatePolicy = async (data: Partial<SpendingPolicy>) => {
    if (!policy) return;
    const res = await api.updatePolicy(policy.id, data);
    setPolicy(res.policy);
    await refreshData();
  };

  // Loading spinner during initial auth check
  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F7F8F6]">
        <div className="w-9 h-9 border-3 border-[#187B61] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-700">Verifying ProcuraPay AI Authentication...</p>
      </div>
    );
  }

  // ==========================================
  // ROUTE 1: LANDING PAGE (/)
  // ==========================================
  if (currentRoute === '/') {
    return (
      <LandingPage
        onNavigateLogin={() => navigateTo('/login')}
        onNavigateSignup={() => navigateTo('/signup')}
        onNavigateDashboard={() => navigateTo('/dashboard')}
        isAuthenticated={!!currentUser}
      />
    );
  }

  // ==========================================
  // ROUTE 2: SIGNUP (/signup)
  // ==========================================
  if (currentRoute === '/signup') {
    return (
      <AuthLayout
        title="Register Organization"
        subtitle="Create an enterprise account to delegate procurement research while retaining strict financial payment authority."
        onNavigateHome={() => navigateTo('/')}
      >
        <SignupForm
          onSuccess={handleSignupSuccess}
          onNavigateLogin={() => navigateTo('/login')}
        />
      </AuthLayout>
    );
  }

  // ==========================================
  // ROUTE 3: LOGIN (/login)
  // ==========================================
  if (currentRoute === '/login') {
    return (
      <AuthLayout
        title="Sign In to ProcuraPay AI"
        subtitle="Enter your verified work credentials to access your autonomous procurement and payment workspace."
        onNavigateHome={() => navigateTo('/')}
      >
        <LoginForm
          onSuccess={handleLoginSuccess}
          onRequireVerification={(email) => {
            setPendingVerificationEmail(email);
            navigateTo('/verify-email');
          }}
          onNavigateForgotPassword={() => navigateTo('/forgot-password')}
          onNavigateSignup={() => navigateTo('/signup')}
        />
      </AuthLayout>
    );
  }

  // ==========================================
  // ROUTE 4: EMAIL VERIFICATION (/verify-email)
  // ==========================================
  if (currentRoute === '/verify-email') {
    return (
      <AuthLayout
        title="Email Verification"
        subtitle="Complete server-verified email confirmation before accessing financial procurement tools."
        onNavigateHome={() => navigateTo('/')}
      >
        <VerifyEmailView
          email={pendingVerificationEmail || (currentUser?.email ?? '')}
          initialToken={verificationToken}
          onVerified={handleVerified}
          onNavigateLogin={() => navigateTo('/login')}
        />
      </AuthLayout>
    );
  }

  // ==========================================
  // ROUTE 5: FORGOT PASSWORD (/forgot-password)
  // ==========================================
  if (currentRoute === '/forgot-password') {
    return (
      <AuthLayout
        title="Password Recovery"
        subtitle="Enter your registered work email to receive an authenticated password reset link."
        onNavigateHome={() => navigateTo('/')}
      >
        <ForgotPasswordForm
          onNavigateLogin={() => navigateTo('/login')}
          onHasResetToken={(tok) => {
            setActiveResetToken(tok);
            navigateTo('/reset-password');
          }}
        />
      </AuthLayout>
    );
  }

  // ==========================================
  // ROUTE 6: RESET PASSWORD (/reset-password)
  // ==========================================
  if (currentRoute === '/reset-password') {
    return (
      <AuthLayout
        title="Set New Password"
        subtitle="Establish a secure password meeting enterprise complexity requirements."
        onNavigateHome={() => navigateTo('/')}
      >
        <ResetPasswordForm
          token={activeResetToken}
          onSuccess={() => navigateTo('/login')}
          onNavigateLogin={() => navigateTo('/login')}
        />
      </AuthLayout>
    );
  }

  // ==========================================
  // ROUTE 7: PROTECTED DASHBOARD (/dashboard)
  // ==========================================
  if (!organization || !policy) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F7F8F6]">
        <div className="w-10 h-10 border-3 border-[#187B61] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-700">Loading Enterprise Workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F8F6] text-[#111827]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'new-request') {
            setIsNewRequestOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        pendingApprovalsCount={pendingApprovals.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          organization={organization}
          onOpenNewRequest={() => setIsNewRequestOpen(true)}
          onRunDemoScenario={handleRunDemoScenario}
        />

        {/* User bar with Logout button */}
        <div className="bg-gray-50/80 border-b border-gray-200 px-6 py-1.5 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center space-x-2">
            <span>Signed in as:</span>
            <span className="font-semibold text-gray-800">{currentUser?.email}</span>
            <span className="text-gray-300">|</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">
              {currentUser?.role}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateTo('/')}
              className="text-[#187B61] hover:underline font-semibold"
            >
              Public Website
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'overview' && (
            <OverviewView
              analytics={analytics}
              requests={requests}
              payments={payments}
              onOpenNewRequest={() => setIsNewRequestOpen(true)}
              onSelectRequest={handleSelectRequest}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'procurement' && (
            <ProcurementListView
              requests={requests}
              onSelectRequest={handleSelectRequest}
              onOpenNewRequest={() => setIsNewRequestOpen(true)}
            />
          )}

          {currentTab === 'agent-activity' && (
            <>
              {selectedRequest ? (
                <AgentWorkspace
                  request={selectedRequest}
                  proposal={activeProposal}
                  agentRun={activeAgentRun}
                  onRunAgent={handleRunAgent}
                  onApproveProposal={handleApproveProposal}
                  onRejectProposal={handleRejectProposal}
                  onOpenCheckout={(prop) => setCheckoutProposal(prop)}
                  isLoading={isLoading}
                />
              ) : requests.length > 0 ? (
                <AgentWorkspace
                  request={requests[0]}
                  proposal={activeProposal}
                  agentRun={activeAgentRun}
                  onRunAgent={handleRunAgent}
                  onApproveProposal={handleApproveProposal}
                  onRejectProposal={handleRejectProposal}
                  onOpenCheckout={(prop) => setCheckoutProposal(prop)}
                  isLoading={isLoading}
                />
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm font-semibold text-gray-700">No active request selected.</p>
                  <button
                    onClick={() => setIsNewRequestOpen(true)}
                    className="mt-3 px-4 py-2 bg-[#187B61] text-white text-xs font-bold rounded-lg"
                  >
                    Create Request
                  </button>
                </div>
              )}
            </>
          )}

          {currentTab === 'product-research' && <ProductCatalogView />}

          {currentTab === 'approvals' && (
            <ApprovalsView
              pendingProposals={pendingApprovals}
              history={approvalHistory}
              onApprove={handleApproveProposal}
              onReject={handleRejectProposal}
              onOpenWorkspace={handleSelectRequest}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView payments={payments} />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView analytics={analytics} payments={payments} />
          )}

          {currentTab === 'policies' && (
            <PoliciesView policy={policy} onUpdatePolicy={handleUpdatePolicy} />
          )}

          {currentTab === 'audit-logs' && (
            <AuditLogsView logs={auditLogs} />
          )}

          {currentTab === 'settings' && (
            <SettingsView organization={organization} />
          )}
        </main>
      </div>

      {/* New Purchase Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmit={handleCreateRequest}
      />

      {/* PayPal Sandbox Checkout Modal */}
      {checkoutProposal && (
        <PayPalCheckoutModal
          isOpen={!!checkoutProposal}
          onClose={() => setCheckoutProposal(null)}
          proposal={checkoutProposal}
          onPaymentSuccess={async () => {
            await refreshData();
          }}
        />
      )}
    </div>
  );
}
