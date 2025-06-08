'use client';

import React, { useState } from 'react';
import { AuthGuard } from '@/components/providers/AuthGuard';
import { useAuth, useSessionManager, useAuthErrorHandler } from '@/lib/hooks/useAuth';
import { UserProfileForm } from '@/components/forms/UserProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Shield,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { authTestRunner, authTestUtils, type TestSuite } from '@/lib/utils/auth-test';

function AuthTestContent() {
  const { user, session, signOut, isAuthenticated, loading } = useAuth();
  const { sessionExpiry, isSessionExpiringSoon, refreshSession } = useSessionManager();
  const { getErrorMessage } = useAuthErrorHandler();
  const [testResults, setTestResults] = useState<TestSuite | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [manualTestError, setManualTestError] = useState<string | null>(null);

  const runAuthTests = async () => {
    try {
      setTestRunning(true);
      setManualTestError(null);

      const results = await authTestRunner.runAllTests();
      setTestResults(results);
    } catch (error) {
      setManualTestError(getErrorMessage(error));
    } finally {
      setTestRunning(false);
    }
  };

  const handleSessionRefresh = async () => {
    try {
      await refreshSession();
      setManualTestError(null);
    } catch (error) {
      setManualTestError(getErrorMessage(error));
    }
  };

  const formatTimeRemaining = (expiry: Date | null) => {
    if (!expiry) return 'Unknown';

    const now = new Date();
    const timeRemaining = expiry.getTime() - now.getTime();

    if (timeRemaining < 0) return 'Expired';

    const minutes = Math.floor(timeRemaining / 1000 / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }

    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication test page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <TestTube className="h-8 w-8 mr-3" />
              Authentication Testing
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive testing and validation of authentication features
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Badge>

            {user && (
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'destructive'
                    : user.role === 'jeweler'
                      ? 'default'
                      : 'secondary'
                }
              >
                {user.role}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Auth Status</TabsTrigger>
            <TabsTrigger value="profile">Profile Management</TabsTrigger>
            <TabsTrigger value="session">Session Management</TabsTrigger>
            <TabsTrigger value="testing">Automated Testing</TabsTrigger>
          </TabsList>

          {/* Authentication Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">ID:</span>
                          <p className="font-mono text-xs break-all">{user.id}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Email:</span>
                          <p>{user.email}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Role:</span>
                          <p className="capitalize">{user.role}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Language:</span>
                          <p>{user.profile?.language_preference === 'he' ? 'Hebrew' : 'English'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Full Name:</span>
                          <p>{user.profile?.full_name || 'Not set'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Phone:</span>
                          <p>{user.profile?.phone || 'Not set'}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Created:</span>
                          <p>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Last Sign In:</span>
                          <p>
                            {user.last_sign_in_at
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Email Verified:</span>
                          <div className="flex items-center">
                            {user.email_confirmed_at ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span>{user.email_confirmed_at ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Phone Verified:</span>
                          <div className="flex items-center">
                            {user.phone_confirmed_at ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span>{user.phone_confirmed_at ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">No user information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Session Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Session Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Access Token:</span>
                          <p className="font-mono text-xs break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {session.access_token.substring(0, 50)}...
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Token Type:</span>
                          <p>{session.token_type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Expires At:</span>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {sessionExpiry ? sessionExpiry.toLocaleString() : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Time Remaining:</span>
                          <div className="flex items-center">
                            {isSessionExpiringSoon() ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            )}
                            <span>{formatTimeRemaining(sessionExpiry)}</span>
                          </div>
                        </div>
                      </div>

                      {isSessionExpiringSoon() && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Your session is expiring soon. Consider refreshing it.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">No active session</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    {authTestUtils.validateUserObject(user) ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>User Object Valid</span>
                  </div>

                  <div className="flex items-center">
                    {authTestUtils.isSessionValid(session) ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>Session Valid</span>
                  </div>

                  <div className="flex items-center">
                    {isAuthenticated ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>Authentication State</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Management Tab */}
          <TabsContent value="profile">
            <UserProfileForm />
          </TabsContent>

          {/* Session Management Tab */}
          <TabsContent value="session" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Manage your authentication session and test session-related functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSessionRefresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Session
                  </Button>

                  <Button onClick={signOut} variant="destructive">
                    Sign Out
                  </Button>
                </div>

                {manualTestError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{manualTestError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Session Expiry Warning:</span>
                    <p>{isSessionExpiringSoon() ? 'Active' : 'Not active'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Auto-refresh:</span>
                    <p>Enabled (5 minutes before expiry)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automated Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Authentication Tests</CardTitle>
                <CardDescription>
                  Run comprehensive tests to validate authentication functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={runAuthTests} disabled={testRunning} className="min-w-[140px]">
                    {testRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Test Suite
                      </>
                    )}
                  </Button>

                  {testResults && (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {testResults.passed} passed
                      </span>
                      <span className="flex items-center text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        {testResults.failed} failed
                      </span>
                      <span className="text-gray-500">{testResults.duration}ms</span>
                    </div>
                  )}
                </div>

                {manualTestError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{manualTestError}</AlertDescription>
                  </Alert>
                )}

                {testResults && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Test Results</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {authTestUtils.formatTestResults(testResults)}
                      </pre>
                    </div>
                  </div>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    These tests validate authentication flows, session management, role-based access
                    control, and error handling. Some tests may require specific user credentials or
                    permissions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AuthTestPage() {
  return (
    <AuthGuard requireAuth={false}>
      <AuthTestContent />
    </AuthGuard>
  );
}
