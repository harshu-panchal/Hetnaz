import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { requestSignupOtp } from '../services/auth.service';
import { useAuth } from '../../../core/context/AuthContext';
import { useTranslation } from '../../../core/hooks/useTranslation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LocationState {
    mode: 'login' | 'signup';
    phoneNumber: string;
    signupData?: any; // Full payload for signup resend
}

export const OtpVerificationPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const state = location.state as LocationState;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!state?.phoneNumber || !state?.mode) {
            navigate('/login');
            return;
        }

        // OTP AUTO-BYPASS FOR TEST NUMBERS
        const bypassNumbers = ['911234567899', '911234567895'];
        if (bypassNumbers.includes(state.phoneNumber)) {
            console.log('🛡️ Bypass number detected, auto-filling OTP...');
            setOtp(['1', '2', '3', '4', '5', '6']);
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [state, navigate]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            prev?.focus();
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setIsLoading(true);
        setError(null);
        try {
            if (state.mode === 'login') {
                await axios.post(`${API_URL}/auth/login-request`, { phoneNumber: state.phoneNumber });
            } else {
                if (state.signupData) {
                    await requestSignupOtp(state.signupData);
                } else {
                    console.warn("Resend not available for signup without persistent data.");
                    setError("Please go back and try signing up again to resend OTP.");
                    return;
                }
            }

            setTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;

        setIsLoading(true);
        setError(null);

        try {
            // OTP BYPASS (123456) - Active for development
            // Current validation logic is maintained in the backend

            const endpoint = state.mode === 'login'
                ? `${API_URL}/auth/login-verify`
                : `${API_URL}/auth/signup-verify`;

            const payload = {
                phoneNumber: state.phoneNumber,
                otp: code
            };

            const response = await axios.post(endpoint, payload);

            if (response.data.token && response.data.data.user) {
                // CRITICAL: Clear all old user data from localStorage before login
                const savedLanguage = localStorage.getItem('user_language');
                localStorage.clear();
                if (savedLanguage) {
                    localStorage.setItem('user_language', savedLanguage); // Preserve language preference
                }

                login(response.data.token, response.data.data.user);

                // Navigation based on role
                const user = response.data.data.user;
                if (user.role === 'female') {
                    if (user.approvalStatus !== 'approved') {
                        navigate('/verification-pending');
                    } else {
                        navigate('/female/dashboard');
                    }
                } else if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/male/discover');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('invalidOTP'));
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-verify effect for bypass numbers
    useEffect(() => {
        const bypassNumbers = ['911234567899', '911234567895'];
        if (state?.phoneNumber && bypassNumbers.includes(state.phoneNumber) && !isLoading && !error) {
            console.log('⚡ Auto-verifying for bypass number');
            const bypassTimeout = setTimeout(() => {
                const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                handleVerify(fakeEvent);
            }, 500);
            return () => clearTimeout(bypassTimeout);
        }
    }, [state?.phoneNumber, isLoading, error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                        <MaterialSymbol name="lock" className="text-pink-600" size={24} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {t('verifyYourPhone')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                        {t('enterOTPSentTo')} <span className="text-gray-900 font-bold">
                            +91 {state?.phoneNumber?.startsWith('91') ? state.phoneNumber.slice(2) : state?.phoneNumber}
                        </span>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleVerify}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                                    Enter 6-digit code
                                </label>
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(e.target, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="w-12 h-12 text-center text-xl border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 border-2"
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center">{error}</div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || otp.join('').length !== 6}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-gray-400"
                                >
                                    {isLoading ? t('loading') : t('verify')}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={handleResend}
                                disabled={timer > 0 || isLoading}
                                className="text-sm font-medium text-pink-600 hover:text-pink-500 disabled:text-gray-400"
                            >
                                {timer > 0 ? `${t('resendIn')} ${timer}s` : t('resendOTP')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
