import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { FemaleApproval } from '../types/admin.types';
import * as adminService from '../../../core/services/admin.service';
import apiClient from '../../../core/api/client';
import { useAdminStats } from '../context/AdminStatsContext';

export const FemaleApprovalDetailPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();
    const { refreshStats } = useAdminStats();
    const [approval, setApproval] = useState<FemaleApproval | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Action states
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        const loadData = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                console.log('🔍 [FemaleApproval] Fetching user details for ID:', userId);

                // Fetch user details from backend using apiClient
                const response = await apiClient.get(`/users/${userId}`);
                const data = response.data;
                console.log('📦 [FemaleApproval] Raw API Response:', data);

                const user = data.data.user;
                console.log('👤 [FemaleApproval] Extracted user object:', user);

                // Transform to FemaleApproval format
                // Handle both nested (user.profile.name) and flat (user.name) structures
                const approvalData: FemaleApproval = {
                    userId: user.id || user._id,
                    user: {
                        id: user.id || user._id,
                        phoneNumber: user.phoneNumber,
                        name: user.profile?.name || user.name, // Support both structures
                        role: user.role,
                        isBlocked: user.isBlocked || false,
                        isVerified: user.isVerified || false,
                        createdAt: user.createdAt,
                        lastLoginAt: user.lastSeen
                    },
                    profile: {
                        age: user.profile?.age || user.age,
                        city: user.profile?.location?.city || user.city || user.location || '',
                        bio: user.profile?.bio || user.bio || '',
                        // Extract URL from photo objects
                        photos: (user.profile?.photos || user.photos || []).map((photo: any) =>
                            typeof photo === 'string' ? photo : photo.url
                        )
                    },
                    verificationDocuments: user.verificationDocuments || {},
                    approvalStatus: user.approvalStatus || 'pending',
                    submittedAt: user.createdAt
                };

                console.log('📸 [FemaleApproval] Photos extracted:', approvalData.profile.photos);
                console.log('📄 [FemaleApproval] Verification docs:', approvalData.verificationDocuments);
                console.log('✅ [FemaleApproval] Transformed approval data:', approvalData);
                setApproval(approvalData);
            } catch (error) {
                console.error('Failed to load user details:', error);
                setApproval(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [userId]);

    const handleApprove = async () => {
        if (!approval) return;
        if (!window.confirm('Are you sure you want to approve this user?')) return;

        setIsProcessing(true);
        try {
            await adminService.approveFemale(approval.userId);
            refreshStats();
            navigate('/admin/female-approval');
        } catch (error) {
            console.error(error);
            alert('Approval failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = () => {
        // Navigate to the existing rejection page which handles the reason input
        if (!approval) return;
        navigate(`/admin/female-approval/reject/${approval.userId}`);
    };

    const handleResubmitRequest = async () => {
        if (!approval) return;
        const reason = window.prompt("Enter reason for resubmitting documents:");
        if (!reason) return;

        setIsProcessing(true);
        try {
            await adminService.requestResubmit(approval.userId, reason);
            navigate('/admin/female-approval');
        } catch (error) {
            console.error(error);
            navigate('/admin/female-approval');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBlockToggle = async () => {
        if (!approval) return;
        const action = approval.user.isBlocked ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setIsProcessing(true);
        try {
            await adminService.toggleBlockUser(approval.userId);
            // Update local state
            setApproval(prev => prev ? {
                ...prev,
                user: { ...prev.user, isBlocked: !prev.user.isBlocked }
            } : null);
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action} user`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="relative flex h-full min-h-screen w-full flex-col bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden">
                <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} items={navigationItems} onItemClick={handleNavigationClick} />
                <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!approval) {
        return (
            <div className="relative flex h-full min-h-screen w-full flex-col bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden">
                <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} items={navigationItems} onItemClick={handleNavigationClick} />
                <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Request Not Found</h2>
                        <button onClick={() => navigate('/admin/female-approval')} className="mt-4 text-blue-600 hover:underline">Back to List</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
            <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} items={navigationItems} onItemClick={handleNavigationClick} />

            <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/admin/female-approval')}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                        >
                            <MaterialSymbol name="arrow_back" size={20} />
                            <span className="font-medium">Back to Approvals</span>
                        </button>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Application</h1>
                                <p className="text-gray-600 dark:text-gray-400">Review details and verification documents</p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${approval.approvalStatus === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : approval.approvalStatus === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    <MaterialSymbol name={
                                        approval.approvalStatus === 'approved'
                                            ? 'check_circle'
                                            : approval.approvalStatus === 'rejected'
                                                ? 'cancel'
                                                : 'pending'
                                    } size={18} />
                                    {approval.approvalStatus === 'approved' ? 'Approved' :
                                        approval.approvalStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
                                </span>
                                {approval.user.isBlocked && (
                                    <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium text-sm flex items-center gap-2">
                                        <MaterialSymbol name="block" size={18} />
                                        Blocked
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column: User Info & Verification */}
                        <div className="xl:col-span-2 space-y-6">

                            {/* User Card */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MaterialSymbol name="person" className="text-blue-600" />
                                    Applicant Details
                                </h2>
                                <div className="flex items-start gap-6">
                                    <div className="size-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-sm shrink-0">
                                        {approval.profile.photos && approval.profile.photos[0] ? (
                                            <img src={typeof approval.profile.photos[0] === 'string' ? approval.profile.photos[0] : approval.profile.photos[0]?.url} alt={approval.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                                {approval.user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Full Name</label>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{approval.user.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Phone Number</label>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{approval.user.phoneNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Age</label>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{approval.profile.age} Years</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">City</label>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{approval.profile.city}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Bio</label>
                                            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mt-1 text-sm leading-relaxed">
                                                {approval.profile.bio || "No bio provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Documents */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MaterialSymbol name="badge" className="text-purple-600" />
                                    Verification Documents
                                </h2>

                                <div className="space-y-6">
                                    {approval.verificationDocuments?.aadhaarCard ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-900 dark:text-white">Aadhaar Card</label>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Front Side</span>
                                            </div>
                                            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-[400px] flex items-center justify-center group relative">
                                                <img
                                                    src={approval.verificationDocuments.aadhaarCard.url}
                                                    alt="Aadhaar Card"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => window.open(approval.verificationDocuments?.aadhaarCard?.url, '_blank')}
                                                        className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium shadow-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        View Full Size
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                                            No verification documents uploaded.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Photos & Actions */}
                        <div className="space-y-6">
                            {/* Profile Photos */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MaterialSymbol name="photo_library" className="text-pink-600" />
                                    Profile Photos
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {approval.profile.photos && approval.profile.photos.map((photo, idx) => (
                                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative group">
                                            <img src={typeof photo === 'string' ? photo : photo?.url} alt={`Profile ${idx}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                    ))}
                                    {!approval.profile.photos?.length && (
                                        <p className="col-span-2 text-sm text-gray-500 text-center py-4">No profile photos.</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions Panel */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Actions</h2>
                                <div className="space-y-3">
                                    {/* Show Block/Unblock for approved users */}
                                    {approval.approvalStatus === 'approved' ? (
                                        <button
                                            onClick={handleBlockToggle}
                                            disabled={isProcessing}
                                            className={`w-full py-3 px-4 rounded-xl font-semibold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${approval.user.isBlocked
                                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
                                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                                                }`}
                                        >
                                            <MaterialSymbol
                                                name={approval.user.isBlocked ? 'lock_open' : 'block'}
                                                className="group-hover:scale-110 transition-transform"
                                            />
                                            {approval.user.isBlocked ? 'Unblock User' : 'Block User'}
                                        </button>
                                    ) : (
                                        <>
                                            {/* Show Approve/Reject/Resubmit for pending users */}
                                            <button
                                                onClick={handleApprove}
                                                disabled={isProcessing}
                                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <MaterialSymbol name="check_circle" className="group-hover:scale-110 transition-transform" />
                                                Approve Application
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={handleResubmitRequest}
                                                    disabled={isProcessing}
                                                    className="py-3 px-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-xl font-medium active:scale-95 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <MaterialSymbol name="refresh" size={24} />
                                                    <span className="text-xs">Request Resubmit</span>
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    disabled={isProcessing}
                                                    className="py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl font-medium active:scale-95 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <MaterialSymbol name="cancel" size={24} />
                                                    <span className="text-xs">Reject</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
