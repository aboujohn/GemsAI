'use client';

import React, { useState } from 'react';
import { AuthGuard } from '@/components/providers/AuthGuard';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserProfileForm } from '@/components/forms/UserProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Shield, AlertCircle, CheckCircle } from 'lucide-react';

function SettingsContent() {
  const { user, updatePassword } = useAuth();
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.new.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);

      await updatePassword(passwordForm.new);

      setPasswordSuccess(true);
      setPasswordForm({ new: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Settings className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Form */}
            <UserProfileForm />

            {/* Password Update */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password for security</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                      placeholder="Enter new password"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirm}
                      onChange={e =>
                        setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))
                      }
                      placeholder="Confirm new password"
                      dir="ltr"
                    />
                  </div>

                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  {passwordSuccess && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Password updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={passwordLoading} className="w-full">
                    {passwordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Type</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        user?.role === 'admin'
                          ? 'destructive'
                          : user?.role === 'jeweler'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {user?.role || 'user'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Sign In</Label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Email Verified</Label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {user?.email_confirmed_at ? 'Yes' : 'No'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific information */}
            {user?.role === 'jeweler' && (
              <Card>
                <CardHeader>
                  <CardTitle>Jeweler Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    As a jeweler, you have access to:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• Customer story management</li>
                    <li>• Order processing tools</li>
                    <li>• Design collaboration features</li>
                    <li>• Analytics dashboard</li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    As an admin, you have access to:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• User management</li>
                    <li>• System configuration</li>
                    <li>• Analytics and reporting</li>
                    <li>• Content moderation</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <SettingsContent />
    </AuthGuard>
  );
}
