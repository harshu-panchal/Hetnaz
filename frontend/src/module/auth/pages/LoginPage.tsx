import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { normalizePhoneNumber } from '../../../core/utils/phoneNumber';
import { loginWithOtp } from '../services/auth.service';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<{ phone: string }>({
    phone: '',
  });
  const [errors, setErrors] = useState<{ phone?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: { phone?: string } = {};

    if (!formData.phone?.trim()) {
      newErrors.phone = t('Phone number is required');
    } else {
      try {
        // Attempt to normalize - will throw if invalid
        normalizePhoneNumber(formData.phone);
      } catch (error: any) {
        newErrors.phone = t('Please enter a valid phone number');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setApiError(null);
      try {
        // Normalize phone number (handles +91, 91, or 10-digit input)
        const normalizedPhone = normalizePhoneNumber(formData.phone);
        await loginWithOtp(normalizedPhone);
        navigate('/otp-verification', {
          state: { mode: 'login', phoneNumber: normalizedPhone }
        });
      } catch (err: any) {
        setApiError(err.message || t('Login request failed'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (value: string) => {
    // Allow user to type freely, we'll validate on submit
    // Remove non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    setFormData({ phone: cleaned });
    if (errors.phone) {
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent tracking-tight">
            MatchMint
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Welcome Back')}</h2>
          <p className="text-gray-500 font-medium">{t('Login to continue your journey')}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-pink-100/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Phone Input */}
            <div className="space-y-3">
              <label htmlFor="phone" className="block text-sm font-bold text-gray-700 ml-1">
                {t('Phone Number')}
              </label>
              <div className="relative group transition-all duration-300">
                <div className={`flex items-center bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${errors.phone ? 'border-red-400' : 'border-gray-100 group-hover:border-pink-200 focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10'}`}>
                  <div className="flex items-center gap-2 pl-4 pr-3 py-4 bg-gray-50/50 border-r border-gray-100">
                    <img
                      src="https://flagcdn.com/w40/in.png"
                      srcSet="https://flagcdn.com/w80/in.png 2x"
                      width="24"
                      className="rounded-sm shadow-sm opacity-90"
                      alt="India Flag"
                    />
                    <span className="text-gray-900 font-black text-lg tracking-tight">+91</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent text-gray-900 text-lg font-bold placeholder:text-gray-300 placeholder:font-medium focus:outline-none"
                    placeholder="Mobile"
                    maxLength={10}
                  />
                  {formData.phone && (
                    <button
                      type="button"
                      onClick={() => setFormData({ phone: '' })}
                      className="pr-4 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <MaterialSymbol name="cancel" size={24} filled />
                    </button>
                  )}
                </div>
                {errors.phone && (
                  <div className="flex items-center gap-1.5 mt-2 ml-1 text-red-500 animate-in fade-in slide-in-from-top-1">
                    <MaterialSymbol name="error" size={16} filled />
                    <p className="text-xs font-bold leading-none">{errors.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Text */}
            <p className="text-sm text-gray-600 text-center">
              {t('We will send you a verification code to continue')} {/* TRANSLATE */}
            </p>

            {apiError && (
              <div className="text-red-500 text-sm text-center">
                {apiError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? t('Sending Code...') : t('Continue')} {/* TRANSLATE BUTTON TEXT */}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('Do not have an account?')}{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-pink-600 font-semibold hover:text-pink-700"
              >
                {t('Sign Up')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

