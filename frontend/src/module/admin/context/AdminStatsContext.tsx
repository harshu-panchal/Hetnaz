import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as adminService from '../../../core/services/admin.service';

interface AdminStats {
    pendingWithdrawals: number;
    pendingFemaleApprovals: number;
    pendingReports: number;
}

interface AdminStatsContextType {
    stats: AdminStats;
    refreshStats: () => Promise<void>;
}

const AdminStatsContext = createContext<AdminStatsContextType | undefined>(undefined);

export const AdminStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<AdminStats>({
        pendingWithdrawals: 0,
        pendingFemaleApprovals: 0,
        pendingReports: 0,
    });

    const refreshStats = useCallback(async () => {
        try {
            const data = await adminService.getDashboardStats();
            setStats({
                pendingWithdrawals: data.stats.pendingWithdrawals || 0,
                pendingFemaleApprovals: data.stats.pendingFemaleApprovals || 0,
                pendingReports: data.stats.pendingReports || 0,
            });
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        }
    }, []);

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    return (
        <AdminStatsContext.Provider value={{ stats, refreshStats }}>
            {children}
        </AdminStatsContext.Provider>
    );
};

export const useAdminStats = () => {
    const context = useContext(AdminStatsContext);
    if (context === undefined) {
        throw new Error('useAdminStats must be used within an AdminStatsProvider');
    }
    return context;
};
