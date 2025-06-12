'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const menuItems = [
    {
      id: 'dashboard',
      label: t('admin.nav.dashboard'),
      icon: Icons.BarChart3,
      href: '/admin',
      badge: null,
    },
    {
      id: 'analytics',
      label: t('admin.nav.analytics'),
      icon: Icons.TrendingUp,
      href: '/admin/analytics',
      badge: null,
    },
    {
      id: 'users',
      label: t('admin.nav.users'),
      icon: Icons.Users,
      href: '/admin/users',
      badge: null,
    },
    {
      id: 'content',
      label: t('admin.nav.content'),
      icon: Icons.FileText,
      href: '/admin/content',
      badge: 'NEW',
    },
    {
      id: 'jewelers',
      label: t('admin.nav.jewelers'),
      icon: Icons.Gem,
      href: '/admin/jewelers',
      badge: null,
    },
    {
      id: 'orders',
      label: t('admin.nav.orders'),
      icon: Icons.ShoppingBag,
      href: '/admin/orders',
      badge: null,
    },
    {
      id: 'experiments',
      label: t('admin.nav.experiments'),
      icon: Icons.Beaker,
      href: '/admin/experiments',
      badge: 'BETA',
    },
    {
      id: 'monitoring',
      label: t('admin.nav.monitoring'),
      icon: Icons.Activity,
      href: '/admin/monitoring',
      badge: null,
    },
    {
      id: 'logs',
      label: t('admin.nav.logs'),
      icon: Icons.FileSearch,
      href: '/admin/logs',
      badge: null,
    },
    {
      id: 'settings',
      label: t('admin.nav.settings'),
      icon: Icons.Settings,
      href: '/admin/settings',
      badge: null,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`
      fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transition-all duration-300
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <DirectionalFlex className="items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Icons.Shield className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-lg">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
          </Button>
        </DirectionalFlex>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link key={item.id} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <Icons.ArrowLeft className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Back to App</span>}
          </div>
        </Link>
      </div>
    </div>
  );
}