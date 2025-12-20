// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { UserTable } from '../components/UserTable';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { AdminUser } from '../types/admin.types';

// Mock data - replace with actual API calls
const mockUsers: AdminUser[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'male',
    isBlocked: false,
    isVerified: true,
    createdAt: '2024-01-01T10:00:00Z',
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    profile: {
      age: 28,
      city: 'Mumbai',
      bio: 'Love traveling and photography',
      photos: [],
    },
  },
  {
    id: '2',
    email: 'sarah.smith@example.com',
    name: 'Sarah Smith',
    role: 'female',
    isBlocked: false,
    isVerified: true,
    createdAt: '2024-01-05T14:30:00Z',
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    profile: {
      age: 25,
      city: 'Delhi',
      bio: 'Fitness enthusiast and food lover',
      photos: [],
    },
  },
  {
    id: '3',
    email: 'michael.brown@example.com',
    name: 'Michael Brown',
    role: 'male',
    isBlocked: true,
    isVerified: false,
    createdAt: '2024-01-10T09:15:00Z',
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    profile: {
      age: 32,
      city: 'Bangalore',
      bio: 'Software engineer',
      photos: [],
    },
  },
  {
    id: '4',
    email: 'emily.johnson@example.com',
    name: 'Emily Johnson',
    role: 'female',
    isBlocked: false,
    isVerified: false,
    createdAt: '2024-01-12T16:45:00Z',
    lastLoginAt: new Date(Date.now() - 1800000).toISOString(),
    profile: {
      age: 23,
      city: 'Pune',
      bio: 'Artist and creative soul',
      photos: [],
    },
  },
  {
    id: '5',
    email: 'david.wilson@example.com',
    name: 'David Wilson',
    role: 'male',
    isBlocked: false,
    isVerified: true,
    createdAt: '2024-01-15T11:20:00Z',
    lastLoginAt: new Date(Date.now() - 300000).toISOString(),
    profile: {
      age: 29,
      city: 'Chennai',
      bio: 'Music producer and DJ',
      photos: [],
    },
  },
  {
    id: '6',
    email: 'jessica.martinez@example.com',
    name: 'Jessica Martinez',
    role: 'female',
    isBlocked: false,
    isVerified: true,
    createdAt: '2024-01-18T13:10:00Z',
    lastLoginAt: new Date(Date.now() - 5400000).toISOString(),
    profile: {
      age: 27,
      city: 'Hyderabad',
      bio: 'Yoga instructor and wellness coach',
      photos: [],
    },
  },
];

export const UsersManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUserClick = (user: AdminUser) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleBlockToggle = (userId: string, isBlocked: boolean) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, isBlocked } : user))
    );
    // TODO: API call to block/unblock user
    console.log(`User ${userId} ${isBlocked ? 'blocked' : 'unblocked'}`);
  };

  const handleVerifyToggle = (userId: string, isVerified: boolean) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, isVerified } : user))
    );
    // TODO: API call to verify user
    console.log(`User ${userId} ${isVerified ? 'verified' : 'unverified'}`);
  };

  const handleDelete = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    // TODO: API call to delete user
    console.log(`User ${userId} deleted`);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting users data...');
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
      {/* Top Navbar */}
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and monitor all platform users</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              <MaterialSymbol name="download" size={20} />
              Export Data
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-[#1a1a1a] dark:to-blue-900/10 rounded-2xl p-5 shadow-lg border border-blue-200 dark:border-blue-800/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {users.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <MaterialSymbol name="people" className="text-white" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-green-50 dark:from-[#1a1a1a] dark:to-green-900/10 rounded-2xl p-5 shadow-lg border border-green-200 dark:border-green-800/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {users.filter((u) => !u.isBlocked).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                  <MaterialSymbol name="check_circle" className="text-white" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-red-50 dark:from-[#1a1a1a] dark:to-red-900/10 rounded-2xl p-5 shadow-lg border border-red-200 dark:border-red-800/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {users.filter((u) => u.isBlocked).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md">
                  <MaterialSymbol name="block" className="text-white" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-purple-50 dark:from-[#1a1a1a] dark:to-purple-900/10 rounded-2xl p-5 shadow-lg border border-purple-200 dark:border-purple-800/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {users.filter((u) => u.isVerified).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                  <MaterialSymbol name="verified" className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* User Table */}
          <UserTable
            users={users}
            onUserClick={handleUserClick}
            onBlockToggle={handleBlockToggle}
            onVerifyToggle={handleVerifyToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>

    </div>
  );
};

