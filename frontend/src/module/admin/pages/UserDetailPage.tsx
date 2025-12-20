// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { AdminUser } from '../types/admin.types';

// Mock data - replace with actual API call
const mockUsers: Record<string, AdminUser> = {
  '1': {
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
      bio: 'Love traveling and photography. Always up for new adventures!',
      photos: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
      ],
    },
  },
  '2': {
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
      bio: 'Fitness enthusiast and food lover. Always up for new adventures!',
      photos: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC81hkr7IkYx1ryaWF6XEKAw50xyRvJBGMogrF-zD5ChG66QAopPNWZvczWXWXasmarotX6xfLiXqIGT-HGa4N4mpnfl6tHPN16fBm5L0ebBFFR6YnfhOhNpt_PXB-rNdw4iozv00ERuqlCKno-B1P2UZ6g-dU5YY4Or_m3Xdgk4_MrxVK9o6Uz70Vr_fXQdMhSrjjCl7s_yQE_R1O9FNwroQqdfSFv6kiO76qVxmnHDhLrYwRWtfdSdegsNjAzgAdgkUZgUomw2j8',
      ],
    },
  },
};

export const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmBlock, setShowConfirmBlock] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (userId) {
      // TODO: API call to fetch user details
      setUser(mockUsers[userId] || null);
    }
  }, [userId]);

  if (!user) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden">
        <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          items={navigationItems}
          onItemClick={handleNavigationClick}
        />
        <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <MaterialSymbol name="person_off" className="text-gray-400 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The user you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBlockToggle = () => {
    if (showConfirmBlock) {
      // TODO: API call to block/unblock user
      setUser({ ...user, isBlocked: !user.isBlocked });
      setShowConfirmBlock(false);
      console.log(`User ${user.id} ${!user.isBlocked ? 'blocked' : 'unblocked'}`);
    } else {
      setShowConfirmBlock(true);
    }
  };

  const handleVerifyToggle = () => {
    // TODO: API call to verify user
    setUser({ ...user, isVerified: !user.isVerified });
    console.log(`User ${user.id} ${!user.isVerified ? 'verified' : 'unverified'}`);
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      // TODO: API call to delete user
      console.log(`User ${user.id} deleted`);
      navigate('/admin/users');
    } else {
      setShowConfirmDelete(true);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <MaterialSymbol name="arrow_back" size={20} />
              <span className="font-medium">Back to Users</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Details</h1>
          </div>

          {/* User Profile Card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center gap-6">
                <div className="size-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                    {user.isVerified && (
                      <MaterialSymbol name="verified" className="text-white" size={28} filled />
                    )}
                  </div>
                  <p className="text-blue-100 text-lg">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'male'
                          ? 'bg-blue-500/30 text-white backdrop-blur-sm'
                          : 'bg-pink-500/30 text-white backdrop-blur-sm'
                        }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)} User
                    </span>
                    {user.isBlocked ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/30 text-white backdrop-blur-sm">
                        <MaterialSymbol name="block" size={16} className="mr-1" />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/30 text-white backdrop-blur-sm">
                        <MaterialSymbol name="check_circle" size={16} className="mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6">
              {user.profile && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MaterialSymbol name="person" className="text-blue-600 dark:text-blue-400" size={24} />
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Age</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{user.profile.age} years</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">City</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{user.profile.city}</p>
                    </div>
                    {user.profile.bio && (
                      <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bio</p>
                        <p className="text-base text-gray-900 dark:text-white leading-relaxed">{user.profile.bio}</p>
                      </div>
                    )}
                    {user.profile.photos && user.profile.photos.length > 0 && (
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Photos</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {user.profile.photos.map((photo, index) => (
                            <div
                              key={index}
                              className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow"
                            >
                              <img
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MaterialSymbol name="account_circle" className="text-blue-600 dark:text-blue-400" size={24} />
                  Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">User ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{user.id}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">{user.email}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Registered</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Login</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(user.lastLoginAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleBlockToggle}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg ${user.isBlocked
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                    }`}
                >
                  <MaterialSymbol name={user.isBlocked ? 'lock_open' : 'block'} size={20} />
                  {user.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={handleVerifyToggle}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg ${user.isVerified
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                >
                  <MaterialSymbol name={user.isVerified ? 'verified' : 'verified_user'} size={20} />
                  {user.isVerified ? 'Mark Unverified' : 'Verify User'}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
                >
                  <MaterialSymbol name="delete" size={20} />
                  Delete User
                </button>
              </div>
            </div>
          </div>

          {/* Confirmation Modals */}
          {showConfirmDelete && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <MaterialSymbol name="warning" className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to permanently delete <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          )}

          {showConfirmBlock && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-full ${user.isBlocked ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <MaterialSymbol
                      name="warning"
                      className={user.isBlocked ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                      size={24}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Confirm {user.isBlocked ? 'Unblock' : 'Block'}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to {user.isBlocked ? 'unblock' : 'block'} <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmBlock(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBlockToggle}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${user.isBlocked
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'} User
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

