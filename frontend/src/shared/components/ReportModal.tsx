import { useState } from 'react';
import { MaterialSymbol } from '../../module/male/types/material-symbol';
import reportService from '../../core/services/report.service';
import { useTranslation } from '../../core/hooks/useTranslation';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportedId: string;
    userName: string;
    chatId?: string;
    onSuccess?: () => void;
}

export const ReportModal = ({
    isOpen,
    onClose,
    reportedId,
    userName,
    chatId,
    onSuccess
}: ReportModalProps) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('inappropriate_behavior');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const reasons = [
        { value: 'inappropriate_behavior', label: t('reportReasonInappropriate') || 'Inappropriate Behavior' },
        { value: 'spam', label: t('reportReasonSpam') || 'Spam' },
        { value: 'harassment', label: t('reportReasonHarassment') || 'Harassment' },
        { value: 'fake_profile', label: t('reportReasonFake') || 'Fake Profile' },
        { value: 'scamming', label: t('reportReasonScam') || 'Scamming' },
        { value: 'other', label: t('reportReasonOther') || 'Other' },
    ];

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);
            await reportService.submitReport({
                reportedId,
                reason,
                description,
                chatId
            });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-[#2d1a24] w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('reportUser') || 'Report User'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <MaterialSymbol name="close" size={24} className="text-gray-500" />
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {t('reportingUser', { name: userName }) || `You are reporting ${userName}. Please select a reason below.`}
                    </p>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('selectReason') || 'Select Reason'}
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {reasons.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => setReason(r.value)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${reason === r.value
                                                ? 'bg-primary/10 border-primary text-primary font-semibold'
                                                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span>{r.label}</span>
                                        {reason === r.value && (
                                            <MaterialSymbol name="check_circle" size={20} filled />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('descriptionOptional') || 'Description (Optional)'}
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('reportPlaceholder') || 'Tell us more about the issue...'}
                                className="w-full h-24 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-primary text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                            ) : (
                                t('submitReport') || 'Submit'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
