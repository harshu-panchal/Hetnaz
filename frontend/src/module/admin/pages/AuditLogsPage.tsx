// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { AuditLog } from '../types/admin.types';

// Mock data - replace with actual API calls
const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'user_blocked',
    targetUserId: '3',
    targetUserName: 'Michael Chen',
    details: 'User blocked for violating community guidelines',
    timestamp: new Date(Date.now() - 3600000),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit-2',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'female_approved',
    targetUserId: '2',
    targetUserName: 'Sarah Lee',
    details: 'Female profile approved after review',
    timestamp: new Date(Date.now() - 7200000),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit-3',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'withdrawal_approved',
    targetUserId: '3',
    targetUserName: 'Emily White',
    details: 'Withdrawal request approved: ₹1000',
    timestamp: new Date(Date.now() - 10800000),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit-4',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'coin_plan_updated',
    details: 'Coin plan "Gold Plan" updated: Price changed from ₹499 to ₹599',
    timestamp: new Date(Date.now() - 86400000),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit-5',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'user_verified',
    targetUserId: '1',
    targetUserName: 'Alex Johnson',
    details: 'User verification status updated',
    timestamp: new Date(Date.now() - 172800000),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit-6',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'payout_slab_created',
    details: 'New payout slab created: 1001-5000 coins at 60%',
    timestamp: new Date(Date.now() - 259200000),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit-7',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'user_deleted',
    targetUserId: '5',
    targetUserName: 'David Brown',
    details: 'User account permanently deleted',
    timestamp: new Date(Date.now() - 345600000),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'audit-8',
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'settings_updated',
    details: 'Platform settings updated: Minimum withdrawal amount changed',
    timestamp: new Date(Date.now() - 432000000),
    ipAddress: '192.168.1.100',
  },
];

export const AuditLogsPage = () => {
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | string>('all');
  const [adminFilter, setAdminFilter] = useState<'all' | string>('all');
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (log.targetUserName && log.targetUserName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Admin filter
    if (adminFilter !== 'all') {
      filtered = filtered.filter((log) => log.adminId === adminFilter);
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [auditLogs, searchQuery, actionFilter, adminFilter]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log) => log.action)));
  }, [auditLogs]);

  const uniqueAdmins = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log) => ({ id: log.adminId, name: log.adminName }))));
  }, [auditLogs]);

  const getActionIcon = (action: string) => {
    if (action.includes('blocked')) return 'block';
    if (action.includes('approved')) return 'check_circle';
    if (action.includes('verified')) return 'verified_user';
    if (action.includes('deleted')) return 'delete';
    if (action.includes('updated') || action.includes('created')) return 'edit';
    return 'info';
  };

  const getActionColor = (action: string) => {
    if (action.includes('blocked') || action.includes('deleted')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    }
    if (action.includes('approved') || action.includes('verified')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    }
    if (action.includes('updated') || action.includes('created')) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} weeks ago`;
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Audit Logs</h1>
              <p className="text-gray-600 dark:text-gray-400">Track all admin actions and system changes</p>
            </div>
            <button
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Exporting audit logs...');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <MaterialSymbol name="download" size={20} />
              Export Logs
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {auditLogs.length.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MaterialSymbol name="history" className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unique Actions</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {uniqueActions.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MaterialSymbol name="category" className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin Users</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {uniqueAdmins.length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MaterialSymbol name="admin_panel_settings" className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MaterialSymbol
                    name="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by admin, action, details, user, or IP address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  {uniqueActions.map((action) => (
                    <option key={action} value={action}>
                      {action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admin Filter */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAdminFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${adminFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  All Admins
                </button>
                {uniqueAdmins.map((admin) => (
                  <button
                    key={admin.id}
                    onClick={() => setAdminFilter(admin.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${adminFilter === admin.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {admin.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredLogs.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{auditLogs.length}</span> logs
            </div>
          </div>

          {/* Audit Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <MaterialSymbol name="history" className="text-gray-400 dark:text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No audit logs found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || actionFilter !== 'all' || adminFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No audit logs available'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-[#1a1a1a] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-lg ${getActionColor(log.action).split(' ')[0]} ${getActionColor(log.action).split(' ')[1]
                        }`}
                    >
                      <MaterialSymbol
                        name={getActionIcon(log.action)}
                        className={getActionColor(log.action).split(' ')[2]}
                        size={24}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {log.adminName}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(log.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTimeAgo(log.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {log.targetUserId && (
                          <div className="flex items-center gap-1">
                            <MaterialSymbol name="person" size={16} />
                            <span>
                              Target: {log.targetUserName} ({log.targetUserId})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MaterialSymbol name="computer" size={16} />
                          <span>IP: {log.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MaterialSymbol name="fingerprint" size={16} />
                          <span>Log ID: {log.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

