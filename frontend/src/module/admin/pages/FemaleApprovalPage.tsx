import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { ApprovalCard } from '../components/ApprovalCard';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { FemaleApproval } from '../types/admin.types';

import * as adminService from '../services/admin.service';

import { useAdminStats } from '../context/AdminStatsContext';

export const FemaleApprovalPage = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<FemaleApproval[]>([]);
  const [stats, setStats] = useState({ all: 0, pending: 0, approved: 0, rejected: 0, resubmit_requested: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'resubmit_requested'>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set());
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();
  const { refreshStats } = useAdminStats();
  // removed unused token from useAuth()

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getPendingFemales(filter, 1, 50);
      setApprovals(result.users);
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApprovals = useMemo(() => {
    return approvals;
  }, [approvals]);

  const handleApprove = async (userId: string) => {
    try {
      await adminService.approveFemale(userId);
      setApprovals((prev) => prev.filter(a => a.userId !== userId));
      refreshStats(); // Update sidebar count
      alert('User approved successfully');
    } catch (error) {
      alert('Approval failed');
    }
  };

  const handleBulkApprove = () => {
    selectedApprovals.forEach((userId) => {
      handleApprove(userId);
    });
    setSelectedApprovals(new Set());
    setShowBulkActions(false);
  };

  const toggleSelection = (userId: string) => {
    setSelectedApprovals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
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
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Female Approval</h1>
              <p className="text-gray-600 dark:text-gray-400">Review and approve female user registrations</p>
            </div>
            {filter === 'pending' && filteredApprovals.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <MaterialSymbol name="checklist" size={20} />
                Bulk Actions
              </button>
            )}
          </div>

          {/* Stats Summary - Now using dynamic stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Females</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.all}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <MaterialSymbol name="groups" className="text-gray-600 dark:text-gray-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <MaterialSymbol name="pending" className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.approved}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MaterialSymbol name="check_circle" className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {stats.rejected}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <MaterialSymbol name="cancel" className="text-red-600 dark:text-red-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* New Tabbed Interface */}
          <div className="mb-6 bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-1 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${filter === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <MaterialSymbol name="list" size={18} />
              All ({stats.all})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${filter === 'pending'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <MaterialSymbol name="pending" size={18} />
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${filter === 'approved'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <MaterialSymbol name="check_circle" size={18} />
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${filter === 'rejected'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <MaterialSymbol name="cancel" size={18} />
              Rejected ({stats.rejected})
            </button>
            <button
              onClick={() => setFilter('resubmit_requested')}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${filter === 'resubmit_requested'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <MaterialSymbol name="history" size={18} />
              Resubmit Needed ({stats.resubmit_requested})
            </button>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && selectedApprovals.size > 0 && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-blue-900 dark:text-blue-300 font-medium">
                {selectedApprovals.size} selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <MaterialSymbol name="check_circle" size={20} className="inline mr-1" />
                Approve Selected
              </button>
            </div>
          )}

          {/* Approval Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <MaterialSymbol name="verified_user" className="text-gray-400 dark:text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No {filter} approvals
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filter === 'pending'
                  ? 'All pending approvals have been processed'
                  : `No ${filter} applications found`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApprovals.map((approval) => (
                <div key={approval.userId} className="relative h-full">
                  {showBulkActions && filter === 'pending' && (
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedApprovals.has(approval.userId)}
                        onChange={() => toggleSelection(approval.userId)}
                        className="size-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <ApprovalCard
                    approval={approval}
                    onViewAction={() => navigate(`/admin/female-approval/${approval.userId}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

