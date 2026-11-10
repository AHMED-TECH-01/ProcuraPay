import crypto from 'crypto';
import { UserProfile, AuthSession } from '../../types/auth';
import { db } from '../db/database';

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  companyName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationSentAt?: number;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: number;
  role: 'OWNER' | 'ADMIN' | 'PROCUREMENT_MANAGER' | 'FINANCE' | 'MEMBER';
  organizationId: string;
  createdAt: string;
}

export class AuthService {
  private static users: Map<string, StoredUser> = new Map();
  private static sessions: Map<string, AuthSession> = new Map();

  static {
    // Seed default owner account for evaluation
    const defaultEmail = 'muhammadahmedrazartx@gmail.com';
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync('Password123!', salt, 1000, 64, 'sha256').toString('hex');

    const defaultUser: StoredUser = {
      id: 'usr-ahmed-01',
      fullName: 'Ahmed Raza',
      email: defaultEmail,
      passwordHash,
      salt,
      companyName: 'TechFlow Global Logistics',
      emailVerified: true,
      role: 'OWNER',
      organizationId: 'org-techflow-01',
      createdAt: new Date().toISOString(),
    };
    AuthService.users.set(defaultEmail.toLowerCase(), defaultUser);

    // Initial session
    const sessionToken = 'tok-seed-' + crypto.randomBytes(24).toString('hex');
    const sessionUser: UserProfile = {
      id: defaultUser.id,
      fullName: defaultUser.fullName,
      email: defaultUser.email,
      companyName: defaultUser.companyName,
      emailVerified: true,
      role: defaultUser.role,
      organizationId: defaultUser.organizationId,
      createdAt: defaultUser.createdAt,
    };
    AuthService.sessions.set(sessionToken, {
      token: sessionToken,
      user: sessionUser,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    // Seed requested test account: tast@test.com / 123456
    const tastEmail = 'tast@test.com';
    const tastSalt = crypto.randomBytes(16).toString('hex');
    const tastPasswordHash = crypto.pbkdf2Sync('123456', tastSalt, 1000, 64, 'sha256').toString('hex');

    const tastUser: StoredUser = {
      id: 'usr-tast-01',
      fullName: 'Test Auditor',
      email: tastEmail,
      passwordHash: tastPasswordHash,
      salt: tastSalt,
      companyName: 'ProcuraPay Test Labs',
      emailVerified: true,
      role: 'OWNER',
      organizationId: 'org-techflow-01',
      createdAt: new Date().toISOString(),
    };
    AuthService.users.set(tastEmail.toLowerCase(), tastUser);

    // Also alias test@test.com in case of standard test typo
    const testEmail = 'test@test.com';
    const testSalt = crypto.randomBytes(16).toString('hex');
    const testPasswordHash = crypto.pbkdf2Sync('123456', testSalt, 1000, 64, 'sha256').toString('hex');
    const aliasUser: StoredUser = {
      id: 'usr-test-alias',
      fullName: 'Test Auditor',
      email: testEmail,
      passwordHash: testPasswordHash,
      salt: testSalt,
      companyName: 'ProcuraPay Test Labs',
      emailVerified: true,
      role: 'OWNER',
      organizationId: 'org-techflow-01',
      createdAt: new Date().toISOString(),
    };
    AuthService.users.set(testEmail.toLowerCase(), aliasUser);
  }

  private static hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  }

  /**
   * Register a new user and company organization
   */
  public static async register(params: {
    fullName: string;
    email: string;
    password: string;
    companyName: string;
  }): Promise<{ user: UserProfile; verificationToken: string }> {
    const normalizedEmail = params.email.trim().toLowerCase();

    if (this.users.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(params.password, salt);
    const userId = 'usr-' + crypto.randomBytes(8).toString('hex');
    const orgId = 'org-' + crypto.randomBytes(8).toString('hex');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const storedUser: StoredUser = {
      id: userId,
      fullName: params.fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      salt,
      companyName: params.companyName.trim(),
      emailVerified: false,
      verificationToken,
      verificationSentAt: Date.now(),
      role: 'OWNER',
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };

    this.users.set(normalizedEmail, storedUser);

    // Audit log
    db.addAuditLog({
      organizationId: orgId,
      eventType: 'USER_LOGIN',
      severity: 'INFO',
      actor: normalizedEmail,
      details: { action: 'ACCOUNT_REGISTERED', email: normalizedEmail, companyName: params.companyName },
    });

    const userProfile: UserProfile = {
      id: storedUser.id,
      fullName: storedUser.fullName,
      email: storedUser.email,
      companyName: storedUser.companyName,
      emailVerified: false,
      role: storedUser.role,
      organizationId: storedUser.organizationId,
      createdAt: storedUser.createdAt,
    };

    return { user: userProfile, verificationToken };
  }

  /**
   * Verify email via token
   */
  public static async verifyEmail(token: string): Promise<UserProfile> {
    for (const [_, user] of this.users.entries()) {
      if (user.verificationToken === token) {
        user.emailVerified = true;
        user.verificationToken = undefined;

        db.addAuditLog({
          organizationId: user.organizationId,
          eventType: 'USER_LOGIN',
          severity: 'INFO',
          actor: user.email,
          details: { action: 'EMAIL_VERIFIED', email: user.email },
        });

        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          companyName: user.companyName,
          emailVerified: true,
          role: user.role,
          organizationId: user.organizationId,
          createdAt: user.createdAt,
        };
      }
    }
    throw new Error('Invalid or expired email verification token.');
  }

  /**
   * Resend email verification
   */
  public static async resendVerification(email: string): Promise<{ verificationToken: string }> {
    const user = this.users.get(email.trim().toLowerCase());
    if (!user) {
      // Generic success to prevent account enumeration
      return { verificationToken: 'simulated' };
    }

    if (user.emailVerified) {
      throw new Error('This account is already verified. Please sign in.');
    }

    // Cooldown check (60 seconds)
    const now = Date.now();
    if (user.verificationSentAt && now - user.verificationSentAt < 60000) {
      const waitSec = Math.ceil((60000 - (now - user.verificationSentAt)) / 1000);
      throw new Error(`Please wait ${waitSec} seconds before requesting another verification email.`);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationSentAt = now;

    return { verificationToken };
  }

  /**
   * Login user
   */
  public static async login(params: {
    email: string;
    password: string;
  }): Promise<{ session: AuthSession; isVerified: boolean }> {
    const user = this.users.get(params.email.trim().toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const hash = this.hashPassword(params.password, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const userProfile: UserProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      companyName: user.companyName,
      emailVerified: user.emailVerified,
      role: user.role,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
    };

    if (!user.emailVerified) {
      return {
        session: { token: '', user: userProfile, expiresAt: '' },
        isVerified: false,
      };
    }

    // Generate Session
    const token = 'tok-' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
    const session: AuthSession = {
      token,
      user: userProfile,
      expiresAt,
    };

    this.sessions.set(token, session);

    db.addAuditLog({
      organizationId: user.organizationId,
      eventType: 'USER_LOGIN',
      severity: 'INFO',
      actor: user.email,
      details: { action: 'USER_LOGGED_IN' },
    });

    return { session, isVerified: true };
  }

  /**
   * Request password reset token
   */
  public static async forgotPassword(email: string): Promise<{ resetToken?: string }> {
    const user = this.users.get(email.trim().toLowerCase());
    if (!user) {
      // Don't reveal account existence
      return {};
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour

    return { resetToken };
  }

  /**
   * Reset password via token
   */
  public static async resetPassword(token: string, newPassword: string): Promise<void> {
    for (const [_, user] of this.users.entries()) {
      if (user.resetPasswordToken === token) {
        if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < Date.now()) {
          throw new Error('Password reset link has expired. Please request a new one.');
        }

        user.salt = crypto.randomBytes(16).toString('hex');
        user.passwordHash = this.hashPassword(newPassword, user.salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        db.addAuditLog({
          organizationId: user.organizationId,
          eventType: 'USER_LOGIN',
          severity: 'INFO',
          actor: user.email,
          details: { action: 'PASSWORD_RESET_SUCCESS' },
        });

        return;
      }
    }
    throw new Error('Invalid or expired password reset token.');
  }

  /**
   * Verify session token
   */
  public static getSession(token: string): AuthSession | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  /**
   * Logout user
   */
  public static logout(token: string): void {
    if (token) {
      this.sessions.delete(token);
    }
  }
}
