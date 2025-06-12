'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { AdminHeader } from '@/components/ui/admin-header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/select';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'jeweler' | 'admin';
  created_at: string;
  last_sign_in_at: string | null;
  email_verified: boolean;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  metadata: {
    orders_count?: number;
    stories_count?: number;
    last_activity?: string;
  };
}

interface UserFilters {
  role: string;
  status: string;
  search: string;
  dateRange: string;
}

export default function AdminUsers() {
  const { t, formatDate } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    status: '',
    search: '',
    dateRange: ''
  });
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      
      // Mock data for demo
      const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        role: ['user', 'jeweler', 'admin'][Math.floor(Math.random() * 3)] as any,
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        last_sign_in_at: Math.random() > 0.3 ? 
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : 
          null,
        email_verified: Math.random() > 0.2,
        phone: Math.random() > 0.5 ? `+972-5${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}` : null,
        avatar_url: Math.random() > 0.7 ? `https://avatar.iran.liara.run/public/${i + 1}` : null,
        is_active: Math.random() > 0.1,
        metadata: {
          orders_count: Math.floor(Math.random() * 10),
          stories_count: Math.floor(Math.random() * 25),
          last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }));
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(user => user.is_active);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(user => !user.is_active);
      } else if (filters.status === 'verified') {
        filtered = filtered.filter(user => user.email_verified);
      } else if (filters.status === 'unverified') {
        filtered = filtered.filter(user => !user.email_verified);
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.name.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          filterDate.setDate(now.getDate() - 90);
          break;
      }

      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(user => 
          new Date(user.created_at) >= filterDate
        );
      }
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action
        }),
      });

      if (response.ok) {
        setSelectedUsers([]);
        await fetchUsers();
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const exportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'jeweler': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (user: User) => {
    if (!user.is_active) return 'destructive';
    if (!user.email_verified) return 'secondary';
    return 'default';
  };

  const getStatusText = (user: User) => {
    if (!user.is_active) return 'Inactive';
    if (!user.email_verified) return 'Unverified';
    return 'Active';
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex-1">
        <AdminHeader title="User Management" subtitle="Manage and monitor user accounts" />
        <DirectionalContainer className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DirectionalContainer>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <AdminHeader 
        title="User Management" 
        subtitle="Manage and monitor user accounts"
        actions={
          <DirectionalFlex className="items-center gap-3">
            <Button onClick={exportUsers} variant="outline" size="sm">
              <Icons.Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            {selectedUsers.length > 0 && (
              <>
                <Button 
                  onClick={() => handleBulkAction('activate')} 
                  variant="outline" 
                  size="sm"
                >
                  <Icons.UserCheck className="h-4 w-4 mr-2" />
                  Activate ({selectedUsers.length})
                </Button>
                
                <Button 
                  onClick={() => handleBulkAction('deactivate')} 
                  variant="outline" 
                  size="sm"
                >
                  <Icons.UserX className="h-4 w-4 mr-2" />
                  Deactivate ({selectedUsers.length})
                </Button>
              </>
            )}
          </DirectionalFlex>
        }
      />
      
      <DirectionalContainer className="p-6 space-y-6">
        {/* Filters */}
        <Card className="p-4">
          <DirectionalFlex className="gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <Select 
              value={filters.role} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
            >
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="jeweler">Jewelers</option>
              <option value="admin">Admins</option>
            </Select>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </Select>
            
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <option value="">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </Select>
            
            <Button 
              onClick={() => setFilters({ role: '', status: '', search: '', dateRange: '' })} 
              variant="outline"
            >
              Clear
            </Button>
          </DirectionalFlex>
        </Card>

        {/* Users Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icons.Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xl font-semibold">{users.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icons.UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xl font-semibold">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icons.Gem className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jewelers</p>
                <p className="text-xl font-semibold">
                  {users.filter(u => u.role === 'jeweler').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icons.Mail className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-xl font-semibold">
                  {users.filter(u => u.email_verified).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(currentUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Activity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stats</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(prev => [...prev, user.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DirectionalFlex className="items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                          ) : (
                            <Icons.User className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </DirectionalFlex>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(user)}>
                        {getStatusText(user)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          Joined {formatDate(new Date(user.created_at))}
                        </p>
                        <p className="text-gray-500">
                          {user.last_sign_in_at 
                            ? `Last seen ${formatDate(new Date(user.last_sign_in_at))}`
                            : 'Never signed in'
                          }
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {user.metadata.orders_count || 0} orders
                        </p>
                        <p className="text-gray-500">
                          {user.metadata.stories_count || 0} stories
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DirectionalFlex className="items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDialog(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Icons.Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                          variant="outline"
                          size="sm"
                        >
                          {user.is_active ? (
                            <Icons.UserX className="h-4 w-4" />
                          ) : (
                            <Icons.UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </DirectionalFlex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t">
              <DirectionalFlex className="justify-between items-center">
                <p className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                
                <DirectionalFlex className="gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </DirectionalFlex>
              </DirectionalFlex>
            </div>
          )}
        </Card>
      </DirectionalContainer>

      {/* User Detail Dialog */}
      {showUserDialog && selectedUser && (
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <DirectionalFlex className="justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                  <Button
                    onClick={() => setShowUserDialog(false)}
                    variant="outline"
                    size="sm"
                  >
                    <Icons.X className="h-4 w-4" />
                  </Button>
                </DirectionalFlex>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                          {selectedUser.role}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge variant={getStatusBadgeVariant(selectedUser)}>
                          {getStatusText(selectedUser)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Activity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Joined</p>
                        <p className="font-medium">{formatDate(new Date(selectedUser.created_at))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Sign In</p>
                        <p className="font-medium">
                          {selectedUser.last_sign_in_at 
                            ? formatDate(new Date(selectedUser.last_sign_in_at))
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedUser.metadata.orders_count || 0}
                        </p>
                        <p className="text-sm text-gray-600">Orders</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedUser.metadata.stories_count || 0}
                        </p>
                        <p className="text-sm text-gray-600">Stories</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedUser.email_verified ? '✓' : '✗'}
                        </p>
                        <p className="text-sm text-gray-600">Verified</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleUserAction(selectedUser.id, selectedUser.is_active ? 'deactivate' : 'activate')}
                      variant={selectedUser.is_active ? "destructive" : "default"}
                    >
                      {selectedUser.is_active ? 'Deactivate User' : 'Activate User'}
                    </Button>
                    
                    {!selectedUser.email_verified && (
                      <Button
                        onClick={() => handleUserAction(selectedUser.id, 'verify_email')}
                        variant="outline"
                      >
                        Verify Email
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleUserAction(selectedUser.id, 'reset_password')}
                      variant="outline"
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}