import { useState, useEffect } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import reportService from '../../../core/services/report.service';
import adminService from '../../../core/services/admin.service';

interface AdminReport {
    _id: string;
    reporterId: {
        _id: string;
        profile: { name: string };
        phoneNumber: string;
        role: string;
    };
    reportedId: {
        _id: string;
        profile: { name: string };
        phoneNumber: string;
        role: string;
    };
    reason: string;
    description: string;
    status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
    adminAction: 'none' | 'warned' | 'temporarily_blocked' | 'permanently_blocked';
    createdAt: string;
}

export const ReportsManagementPage = () => {
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');
    const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchReports();
    }, [page, statusFilter]);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const data = await reportService.getAdminReports({ status: statusFilter, page, limit: 20 });
            setReports(data.data.reports);
            setTotal(data.data.pagination.total);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (reportId: string, status: string, action: string) => {
        try {
            await reportService.updateReportStatus(reportId, status, action);
            alert('Action taken successfully');
            fetchReports();
        } catch (error) {
            console.error('Failed to update report:', error);
            alert('Failed to update report');
        }
    };

    const handleBlockUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to block this user permanently?')) return;
        try {
            await adminService.toggleBlockUser(userId);
            alert('User blocked successfully');
            fetchReports();
        } catch (error) {
            console.error('Failed to block user:', error);
            alert('Failed to block user');
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden">
            <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                items={navigationItems}
                onItemClick={handleNavigationClick}
            />

            <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Reports</h1>
                            <p className="text-gray-600 dark:text-gray-400">Review and act on user-submitted reports</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-sm dark:text-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="action_taken">Action Taken</option>
                                <option value="dismissed">Dismissed</option>
                                <option value="all">All Reports</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-20 text-center shadow-sm border border-gray-100 dark:border-gray-800">
                            <MaterialSymbol name="report_off" size={64} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No reports found matching your criteria</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reporter</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reported User</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {reports.map((report) => (
                                            <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900 dark:text-white capitalize">{report.reporterId?.profile?.name || 'Unknown'}</span>
                                                        <span className="text-xs text-gray-500">{report.reporterId?.role} • {report.reporterId?.phoneNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900 dark:text-white capitalize">{report.reportedId?.profile?.name || 'Unknown'}</span>
                                                        <span className="text-xs text-gray-500">{report.reportedId?.role} • {report.reportedId?.phoneNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 uppercase">
                                                        {report.reason.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={report.description}>
                                                        {report.description || 'No description provided'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full uppercase ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        report.status === 'action_taken' ? 'bg-red-100 text-red-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {report.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {report.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(report._id, 'dismissed', 'none')}
                                                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                                                    title="Dismiss Report"
                                                                >
                                                                    <MaterialSymbol name="close" size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(report._id, 'action_taken', 'warned')}
                                                                    className="p-2 text-yellow-500 hover:text-yellow-600 transition-colors"
                                                                    title="Warn User"
                                                                >
                                                                    <MaterialSymbol name="warning" size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(report._id, 'action_taken', 'permanently_blocked')}
                                                                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                                                    title="Block User"
                                                                >
                                                                    <MaterialSymbol name="block" size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleBlockUser(report.reportedId?._id)}
                                                                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                                                    title="Force Block Account"
                                                                >
                                                                    <MaterialSymbol name="person_off" size={20} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {total > 20 && (
                        <div className="flex items-center justify-end gap-2 mt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1a1a1a]"
                            >
                                <MaterialSymbol name="chevron_left" size={20} />
                            </button>
                            <span className="text-sm font-medium dark:text-white">Page {page} of {Math.ceil(total / 20)}</span>
                            <button
                                disabled={page >= Math.ceil(total / 20)}
                                onClick={() => setPage(page + 1)}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1a1a1a]"
                            >
                                <MaterialSymbol name="chevron_right" size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
