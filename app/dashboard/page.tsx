'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/providers/AuthGuard';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Gem, Shield, Wrench } from 'lucide-react';

function DashboardContent() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNewStory = () => {
    router.push('/story/new');
  };

  const handleSettings = () => {
    router.push('/dashboard/settings');
  };

  const handleJewelerDashboard = () => {
    router.push('/jeweler/dashboard');
  };

  const handleAdminDashboard = () => {
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.profile?.full_name || user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-4">
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
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 dark:text-white">
                  {user?.profile?.full_name || 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900 dark:text-white capitalize">{user?.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Language Preference</label>
                <p className="text-gray-900 dark:text-white">
                  {user?.profile?.language_preference === 'he' ? 'Hebrew' : 'English'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleNewStory}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gem className="h-5 w-5 mr-2" />
                Create Story
              </CardTitle>
              <CardDescription>Start a new jewelry customization story</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleNewStory}>
                New Story
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleSettings}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={handleSettings}>
                Open Settings
              </Button>
            </CardContent>
          </Card>

          {user?.role === 'jeweler' && (
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleJewelerDashboard}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Jeweler Tools
                </CardTitle>
                <CardDescription>Access your jeweler dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" onClick={handleJewelerDashboard}>
                  Jeweler Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {user?.role === 'admin' && (
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleAdminDashboard}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Panel
                </CardTitle>
                <CardDescription>System administration tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={handleAdminDashboard}>
                  Admin Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display</p>
              <p className="text-sm mt-2">Start creating stories to see your activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  );
}
