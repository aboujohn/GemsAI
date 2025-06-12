'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications - in real implementation, these would come from API
  const notifications = [
    {
      id: '1',
      type: 'warning',
      title: 'High Queue Processing Time',
      message: 'Sketch generation queue is experiencing delays',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: '2',
      type: 'info',
      title: 'New User Registration',
      message: '5 new users registered in the last hour',
      time: '15 minutes ago',
      unread: true,
    },
    {
      id: '3',
      type: 'success',
      title: 'Payment Processed',
      message: 'Order #GEM-20231215-0123 payment completed',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Icons.AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <Icons.AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <Icons.CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Icons.Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <DirectionalFlex className="justify-between items-center">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Actions and User Menu */}
        <DirectionalFlex className="items-center gap-4">
          {actions}

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Icons.Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <DirectionalFlex className="justify-between items-center">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                    <Button variant="ghost" size="sm">
                      <Icons.MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DirectionalFlex>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <DirectionalFlex className="gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </DirectionalFlex>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Icons.ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
            
            <div className="dropdown-content">
              <div className="p-2 w-48">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/settings'}
                >
                  <Icons.Settings className="h-4 w-4 mr-2" />
                  {t('admin.nav.settings')}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <Icons.User className="h-4 w-4 mr-2" />
                  {t('common.nav.profile')}
                </Button>
                
                <hr className="my-2" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <Icons.LogOut className="h-4 w-4 mr-2" />
                  {t('common.nav.signOut')}
                </Button>
              </div>
            </div>
          </DropdownMenu>
        </DirectionalFlex>
      </DirectionalFlex>
    </header>
  );
}