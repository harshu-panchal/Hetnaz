/**
 * Report Service - Handling User Reports
 * @purpose: Communication with the backend report API
 */

import apiClient from '../api/client';

export interface ReportData {
    reportedId: string;
    reason: string;
    description?: string;
    chatId?: string;
}

export const submitReport = async (data: ReportData) => {
    const response = await apiClient.post('/users/report', data);
    return response.data;
};

export const getAdminReports = async (params?: { status?: string, page?: number, limit?: number }) => {
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
};

export const updateReportStatus = async (reportId: string, status: string, adminAction: string) => {
    const response = await apiClient.patch(`/admin/reports/${reportId}`, { status, adminAction });
    return response.data;
};

export default {
    submitReport,
    getAdminReports,
    updateReportStatus
};
