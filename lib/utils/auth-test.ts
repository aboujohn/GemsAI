'use client';

import { supabase } from '@/lib/supabase/client';
import type { AuthUser } from '@/lib/contexts/AuthContext';

export interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  duration?: number;
  error?: any;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

// Test utilities
export class AuthTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
    const start = Date.now();

    try {
      await testFn();
      const duration = Date.now() - start;

      return {
        test: testName,
        passed: true,
        message: 'Test passed',
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - start;

      return {
        test: testName,
        passed: false,
        message: error.message || 'Test failed',
        duration,
        error,
      };
    }
  }

  // Authentication Flow Tests
  async testSignUpFlow(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<TestResult> {
    return this.runTest('Sign Up Flow', async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name || 'Test User',
            role: metadata?.role || 'user',
            language_preference: metadata?.language_preference || 'he',
            ...metadata,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signup');

      console.log('Sign up successful:', data.user.email);
    });
  }

  async testSignInFlow(email: string, password: string): Promise<TestResult> {
    return this.runTest('Sign In Flow', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user || !data.session) throw new Error('No user or session returned');

      console.log('Sign in successful:', data.user.email);
    });
  }

  async testPasswordReset(email: string): Promise<TestResult> {
    return this.runTest('Password Reset Flow', async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      console.log('Password reset email sent to:', email);
    });
  }

  async testSignOut(): Promise<TestResult> {
    return this.runTest('Sign Out Flow', async () => {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      console.log('Sign out successful');
    });
  }

  // Session Management Tests
  async testSessionPersistence(): Promise<TestResult> {
    return this.runTest('Session Persistence', async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        console.log('Session found:', session.user.email);

        // Test session refresh
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) throw refreshError;
        if (!refreshData.session) throw new Error('Session refresh failed');

        console.log('Session refresh successful');
      } else {
        console.log('No active session found');
      }
    });
  }

  async testTokenValidation(): Promise<TestResult> {
    return this.runTest('Token Validation', async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        console.log('Token is valid for user:', user.email);

        // Check token expiry
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const expiresAt = new Date(session.expires_at! * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();

          if (timeUntilExpiry < 0) {
            throw new Error('Token has expired');
          }

          console.log(`Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
        }
      } else {
        throw new Error('No user found - token invalid');
      }
    });
  }

  // Profile Management Tests
  async testProfileUpdate(updates: Record<string, any>): Promise<TestResult> {
    return this.runTest('Profile Update', async () => {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      console.log('Profile updated successfully:', updates);
    });
  }

  async testPasswordUpdate(newPassword: string): Promise<TestResult> {
    return this.runTest('Password Update', async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      console.log('Password updated successfully');
    });
  }

  // Role-based Access Tests
  async testRoleBasedAccess(requiredRole: string): Promise<TestResult> {
    return this.runTest(`Role-based Access (${requiredRole})`, async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error('No authenticated user');

      const userRole = user.user_metadata?.role || 'user';

      // Define role hierarchy
      const roleHierarchy: Record<string, string[]> = {
        admin: ['admin', 'jeweler', 'user'],
        jeweler: ['jeweler', 'user'],
        user: ['user'],
      };

      const allowedRoles = roleHierarchy[userRole] || [userRole];

      if (!allowedRoles.includes(requiredRole)) {
        throw new Error(
          `User role '${userRole}' does not have access to '${requiredRole}' resources`
        );
      }

      console.log(`Access granted: User role '${userRole}' can access '${requiredRole}' resources`);
    });
  }

  // Error Handling Tests
  async testInvalidCredentials(): Promise<TestResult> {
    return this.runTest('Invalid Credentials Handling', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

      if (!error) throw new Error('Expected authentication to fail');
      if (error.message !== 'Invalid login credentials') {
        throw new Error(`Unexpected error message: ${error.message}`);
      }

      console.log('Invalid credentials properly rejected');
    });
  }

  async testWeakPassword(): Promise<TestResult> {
    return this.runTest('Weak Password Handling', async () => {
      const { error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: '123', // Weak password
      });

      if (!error) throw new Error('Expected signup to fail with weak password');
      if (!error.message.includes('Password')) {
        throw new Error(`Unexpected error message: ${error.message}`);
      }

      console.log('Weak password properly rejected');
    });
  }

  async testInvalidEmail(): Promise<TestResult> {
    return this.runTest('Invalid Email Handling', async () => {
      const { error } = await supabase.auth.signUp({
        email: 'invalid-email',
        password: 'validpassword123',
      });

      if (!error) throw new Error('Expected signup to fail with invalid email');
      if (!error.message.includes('email')) {
        throw new Error(`Unexpected error message: ${error.message}`);
      }

      console.log('Invalid email properly rejected');
    });
  }

  // Run all tests
  async runAllTests(testEmail?: string, testPassword?: string): Promise<TestSuite> {
    const email = testEmail || `test-${Date.now()}@example.com`;
    const password = testPassword || 'testpassword123';

    console.log('Starting authentication test suite...');

    const tests = [
      // Error handling tests (run first)
      () => this.testInvalidCredentials(),
      () => this.testWeakPassword(),
      () => this.testInvalidEmail(),

      // Session tests
      () => this.testSessionPersistence(),
      () => this.testTokenValidation(),

      // Role-based access tests
      () => this.testRoleBasedAccess('user'),
      () => this.testRoleBasedAccess('jeweler'),
      () => this.testRoleBasedAccess('admin'),
    ];

    // Only run auth flow tests if credentials provided
    if (testEmail && testPassword) {
      tests.push(
        () => this.testSignInFlow(email, password),
        () => this.testPasswordReset(email),
        () => this.testProfileUpdate({ full_name: 'Updated Test User' }),
        () => this.testSignOut()
      );
    }

    const results: TestResult[] = [];

    for (const test of tests) {
      const result = await test();
      results.push(result);

      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const duration = Date.now() - this.startTime;

    return {
      name: 'Authentication Test Suite',
      results,
      passed,
      failed,
      duration,
    };
  }
}

// Utility functions for manual testing
export const authTestUtils = {
  // Generate test user data
  generateTestUser: () => ({
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    full_name: 'Test User',
    role: 'user' as const,
    language_preference: 'he' as const,
  }),

  // Validate user object structure
  validateUserObject: (user: any): user is AuthUser => {
    return (
      user &&
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      user.role &&
      ['user', 'jeweler', 'admin'].includes(user.role)
    );
  },

  // Check session validity
  isSessionValid: (session: any): boolean => {
    if (!session || !session.expires_at) return false;

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();

    return expiresAt > now;
  },

  // Format test results for display
  formatTestResults: (suite: TestSuite): string => {
    const lines = [
      `=== ${suite.name} ===`,
      `Duration: ${suite.duration}ms`,
      `Passed: ${suite.passed}`,
      `Failed: ${suite.failed}`,
      `Total: ${suite.results.length}`,
      '',
      'Results:',
    ];

    suite.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      lines.push(`${index + 1}. ${status} ${result.test}${duration}`);

      if (!result.passed) {
        lines.push(`   Error: ${result.message}`);
      }
    });

    return lines.join('\n');
  },
};

// Export singleton instance
export const authTestRunner = new AuthTestRunner();
