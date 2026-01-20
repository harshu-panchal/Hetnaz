import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { AdminDashboardData, ActivityItem } from '../types/admin.types';
import * as adminService from '../../../core/services/admin.service';

export const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick, isCollapsed, toggleCollapse } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getDashboardStats();

      // Transform backend stats to match AdminDashboardData format
      const transformedData: AdminDashboardData = {
        stats: data.stats,
        charts: data.charts,
        recentActivity: data.recentActivity
      };

      setDashboardData(transformedData);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registered': return 'person_add';
      case 'female_approved': return 'verified_user';
      case 'withdrawal_approved': return 'account_balance_wallet';
      case 'transaction': return 'monetization_on';
      case 'user_blocked': return 'block';
      default: return 'info';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MaterialSymbol name="sync" size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MaterialSymbol name="error" size={48} className="text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Failed to load dashboard data'}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-[#f0f0f1] dark:bg-[#1d2327] overflow-x-hidden transition-colors duration-300">
      {/* Top Navbar */}
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content - Dynamic margin based on collapse state */}
      <div className={`flex-1 p-4 sm:p-6 mt-[57px] transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/admin/settings')} className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <MaterialSymbol name="settings" size={20} />
              </button>
            </div>
          </div>

          {/* Key Stats Row - Highly Compact */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              label="Total Users"
              value={dashboardData.stats.totalUsers.total.toLocaleString()}
              subValue={`${dashboardData.stats.totalUsers.male}m / ${dashboardData.stats.totalUsers.female}f`}
              icon="people"
              color="blue"
            />
            <StatCard
              label="Revenue"
              value={formatCurrency(dashboardData.stats.revenue.profit)}
              subValue="Net Profit"
              icon="trending_up"
              color="purple"
            />
            <StatCard
              label="Admin Reviews"
              value={dashboardData.stats.pendingFemaleApprovals.toString()}
              subValue="Pending Females"
              icon="verified_user"
              color="green"
              onClick={() => navigate('/admin/female-approval')}
              clickLabel="Review"
            />
            <StatCard
              label="Pending W/D"
              value={dashboardData.stats.pendingWithdrawals.toString()}
              subValue="Needs Actions"
              icon="pending"
              color="orange"
              onClick={() => navigate('/admin/withdrawals')}
              clickLabel="Process"
            />
            <StatCard
              label="Transactions"
              value={dashboardData.stats.totalTransactions.toLocaleString()}
              subValue="Total History"
              icon="receipt_long"
              color="indigo"
              onClick={() => navigate('/admin/transactions')}
              clickLabel="View"
            />
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column (Charts - Takes up 2/3) */}
            <div className="lg:col-span-2 space-y-5">
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartCard title="User Growth" subtitle="New registrations (30d)" color="blue">
                  <MiniBarChart data={dashboardData.charts.userGrowth} />
                </ChartCard>
                <ChartCard title="Revenue Trends" subtitle="Deposits vs Payouts" color="purple">
                  <MiniTrendChart data={dashboardData.charts.revenueTrends} />
                </ChartCard>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-[#151515] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <QuickActionBtn label="Manage Users" icon="people" onClick={() => navigate('/admin/users')} />
                  <QuickActionBtn label="Approve Females" icon="verified_user" onClick={() => navigate('/admin/female-approval')} />
                  <QuickActionBtn label="Process Withdrawals" icon="account_balance_wallet" onClick={() => navigate('/admin/withdrawals')} />
                  <QuickActionBtn label="Coin Economy" icon="monetization_on" onClick={() => navigate('/admin/coin-economy')} />
                </div>
              </div>
            </div>

            {/* Right Column (Activity & Lists - Takes up 1/3) */}
            <div className="space-y-5">
              {/* Recent Activity List */}
              <div className="bg-white dark:bg-[#151515] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full max-h-[500px]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#1a1a1a]/50 rounded-t-xl">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="group flex gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-default">
                      <div className={`mt-0.5 p-1.5 rounded-md self-start shrink-0 ${activity.type === 'user_registered' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        activity.type === 'female_approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          activity.type === 'withdrawal_approved' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                        <MaterialSymbol name={getActivityIcon(activity.type)} size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-200 truncate">{activity.message}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">{formatTimeAgo(activity.timestamp)} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics List */}
              <div className="bg-white dark:bg-[#151515] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1a]/50 rounded-t-xl">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Platform Metrics</h3>
                </div>
                <div className="p-3 grid grid-cols-1 gap-2">
                  {dashboardData.charts.activityMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/50">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{metric.type}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{metric.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div >
  );
};

// Sub-components for cleaner code
const StatCard = ({ label, value, subValue, icon, color, onClick, clickLabel }: any) => {
  const colorClasses: any = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50 dark:bg-green-900/20',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    yellow: 'from-yellow-400 to-yellow-600 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
  };

  return (
    <div className="relative bg-white dark:bg-[#151515] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase font-semibold text-gray-500 dark:text-gray-500 tracking-wider text-nowrap">{label}</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight">{value}</span>
        </div>
        <div className={`p-1.5 rounded-lg bg-gradient-to-br shadow-sm ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}>
          <MaterialSymbol name={icon} className="text-white" size={16} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 truncate max-w-[80px] sm:max-w-full">{subValue}</span>
        {onClick && (
          <button onClick={onClick} className={`text-[10px] font-semibold hover:underline ${colorClasses[color].split(' ').slice(2, 3).join(' ')}`}>
            {clickLabel} &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, color }: any) => {
  const colorClasses: any = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    orange: 'text-orange-600 dark:text-orange-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className="bg-white dark:bg-[#151515] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color === 'blue' ? 'from-blue-500 to-transparent' :
        color === 'purple' ? 'from-purple-500 to-transparent' :
          'from-gray-500 to-transparent'
        } opacity-20`}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className={`text-sm font-semibold flex items-center gap-2 ${colorClasses[color] || 'text-gray-900 dark:text-white'}`}>
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className={`rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-[#0a0a0a] dark:to-[#111] border border-gray-100 dark:border-gray-800/50 p-2 relative z-10`}>
        {children}
      </div>
    </div>
  );
};

const QuickActionBtn = ({ label, icon, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-[#1a1a1a] hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-xl transition-all group">
    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-all text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
      <MaterialSymbol name={icon} size={22} />
    </div>
    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">{label}</span>
  </button>
);

const MiniBarChart = ({ data }: { data: Array<{ date: string; count: number }> }) => {
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="h-40 flex items-end gap-1 px-2 pt-4">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
          <div
            className="w-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors rounded-t-sm"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: '2px' }}
          />
          <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
            {d.count} ({d.date.split('-').slice(1).join('/')})
          </div>
        </div>
      ))}
    </div>
  );
};

const MiniTrendChart = ({ data }: { data: Array<{ date: string; deposits: number; payouts: number }> }) => {
  const max = Math.max(...data.map(d => Math.max(d.deposits, d.payouts)), 1);

  return (
    <div className="h-40 flex items-end gap-1.5 px-2 pt-4">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-end gap-[1px] group relative h-full justify-end">
          <div
            className="w-full bg-purple-500/60 rounded-t-sm"
            style={{ height: `${(d.deposits / max) * 100}%`, minHeight: d.deposits > 0 ? '2px' : '0' }}
          />
          <div
            className="w-full bg-orange-500/60 rounded-t-sm"
            style={{ height: `${(d.payouts / max) * 100}%`, minHeight: d.payouts > 0 ? '2px' : '0' }}
          />
          <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
            D: {d.deposits} / P: {d.payouts} ({d.date.split('-').slice(1).join('/')})
          </div>
        </div>
      ))}
    </div>
  );
};

