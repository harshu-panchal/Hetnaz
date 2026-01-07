import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminStats } from '../context/AdminStatsContext';

interface SubItem {
  id: string;
  label: string;
  path: string;
  isActive?: boolean;
  badgeCount?: number;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
  badgeCount?: number;
  subItems?: SubItem[];
}

export const useAdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { stats } = useAdminStats();

  // On desktop (lg+), sidebar should always be open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems: NavItem[] = useMemo(() => [
    {
      id: 'dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      isActive: location.pathname === '/admin/dashboard',
    },
    {
      id: 'users',
      icon: 'people',
      label: 'Users',
      isActive: location.pathname === '/admin/users' && !location.pathname.includes('/admin/female-approval'),
      subItems: [
        {
          id: 'all-users',
          label: 'All Users',
          path: '/admin/users',
          isActive: location.pathname === '/admin/users',
        },
        {
          id: 'female-approval',
          label: 'Female Approval',
          path: '/admin/female-approval',
          isActive: location.pathname.startsWith('/admin/female-approval'),
          badgeCount: stats.pendingFemaleApprovals,
        },
      ],
    },
    {
      id: 'reports',
      icon: 'report',
      label: 'User Reports',
      isActive: location.pathname.startsWith('/admin/reports'),
      badgeCount: stats.pendingReports,
    },
    {
      id: 'finance',
      icon: 'account_balance',
      label: 'Finance',
      subItems: [
        {
          id: 'coin-economy',
          label: 'Coin Economy',
          path: '/admin/coin-economy',
          isActive: location.pathname.startsWith('/admin/coin-economy'),
        },
        {
          id: 'withdrawals',
          label: 'Withdrawals',
          path: '/admin/withdrawals',
          isActive: location.pathname.startsWith('/admin/withdrawals'),
          badgeCount: stats.pendingWithdrawals,
        },
        {
          id: 'transactions',
          label: 'Transactions',
          path: '/admin/transactions',
          isActive: location.pathname.startsWith('/admin/transactions'),
        },
      ],
    },
    {
      id: 'settings',
      icon: 'settings',
      label: 'Settings',
      isActive: location.pathname.startsWith('/admin/settings'),
    },
    {
      id: 'logout',
      icon: 'logout',
      label: 'Logout',
    },
  ], [location.pathname, stats]);

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'all-users':
        navigate('/admin/users');
        break;
      case 'female-approval':
        navigate('/admin/female-approval');
        break;
      case 'coin-economy':
        navigate('/admin/coin-economy');
        break;
      case 'withdrawals':
        navigate('/admin/withdrawals');
        break;
      case 'transactions':
        navigate('/admin/transactions');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'logout':
        if (window.confirm('Are you sure you want to logout?')) {
          localStorage.clear(); // Clear all data
          window.location.href = '/login';
        }
        break;
      default:
        break;
    }
  };

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    navigationItems,
    handleNavigationClick,
  };
};
