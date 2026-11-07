export type UserRole =
  | 'OWNER'
  | 'ADMIN'
  | 'PROCUREMENT_MANAGER'
  | 'FINANCE'
  | 'MEMBER';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  role: UserRole;
  organizationId: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  expiresAt: string;
}

export interface RegistrationInput {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  acceptedTerms: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}
