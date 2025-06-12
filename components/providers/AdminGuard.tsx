'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) return;

      if (!user) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      try {
        // Check user role from database
        const response = await fetch('/api/admin/auth/check', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isAdmin) {
            setIsAdmin(true);
          } else {
            router.push('/dashboard'); // Redirect non-admin users
          }
        } else {
          router.push('/auth/login?redirect=/admin');
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        router.push('/auth/login?redirect=/admin');
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </Card>
      </DirectionalContainer>
    );
  }

  if (!user) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Icons.Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the admin dashboard.</p>
          <Button onClick={() => router.push('/auth/login?redirect=/admin')}>
            Sign In
          </Button>
        </Card>
      </DirectionalContainer>
    );
  }

  if (!isAdmin) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Icons.ShieldAlert className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </DirectionalContainer>
    );
  }

  return <>{children}</>;
}