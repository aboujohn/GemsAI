'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function JewelerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'jeweler')) {
      router.push('/auth/login?redirect=/jeweler/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DirectionalContainer>
    );
  }

  if (!user || user.role !== 'jeweler') {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('auth.accessDenied')}
            </h2>
            <p className="text-gray-600">
              {t('auth.jewelerAccessRequired')}
            </p>
          </div>
        </div>
      </DirectionalContainer>
    );
  }

  return <>{children}</>;
}