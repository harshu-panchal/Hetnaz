import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { UserTable } from '../components/UserTable';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import adminService from '../../../core/services/admin.service';
import type { AdminUser } from '../types/admin.types';

export const UsersManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: 'all', blocked: 'all' });
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.listUsers(filters, page, 20);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (user: AdminUser) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleBlockToggle = async (userId: string, isBlocked: boolean) => {
    try {
      await adminService.toggleBlockUser(userId);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, isBlocked } : user))
      );
    } catch (error) {
      console.error('Failed to toggle block status:', error);
      alert('Failed to update block status');
    }
  };


  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality if needed
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
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 text-sm dark:text-white"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <MaterialSymbol name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <MaterialSymbol name="download" size={20} />
                Export Data
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-[#1a1a1a] dark:to-blue-900/10 rounded-2xl p-5 shadow-lg border border-blue-200 dark:border-blue-800/50 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {total}
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
              <div className="space-y-4">
                <UserTable
                  users={users}
                  onUserClick={handleUserClick}
                  onBlockToggle={handleBlockToggle}
                  onDelete={handleDelete}
                />

                {/* Simple Pagination */}
                {total > 20 && (
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                    >
                      <MaterialSymbol name="chevron_left" size={20} />
                    </button>
                    <span className="text-sm font-medium dark:text-white">Page {page} of {Math.ceil(total / 20)}</span>
                    <button
                      disabled={page >= Math.ceil(total / 20)}
                      onClick={() => setPage(page + 1)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                    >
                      <MaterialSymbol name="chevron_right" size={20} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

