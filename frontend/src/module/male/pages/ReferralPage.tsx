import { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { BottomNavigation } from '../components/BottomNavigation';
import { useMaleNavigation } from '../hooks/useMaleNavigation';

export const ReferralPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { appSettings } = useGlobalState();
    const { navigationItems, handleNavigationClick } = useMaleNavigation();
    const [copied, setCopied] = useState(false);

    const referralId = user?.referralId || 'MATCH101';
    const referralCount = user?.referralCount || 0;
    const rewardAmount = appSettings?.referral?.rewardAmount || 200;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareMessage = `Hey! Join me on MatchMint and find amazing connections. Use my referral ID: ${referralId} during signup to get a special bonus! 🚀`;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join MatchMint',
                text: shareMessage,
                url: window.location.origin,
            });
        } else {
            handleCopy();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
            <MaleTopNavbar title={t('Refer & Earn')} />

            <main className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Reward Card */}
                <div className="bg-gradient-to-br from-primary to-yellow-500 rounded-3xl p-6 text-slate-900 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <MaterialSymbol name="redeem" size={120} />
                    </div>
                    <div className="relative">
                        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">{t('Invite & Get')}</h2>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-5xl font-black">{rewardAmount}</span>
                            <span className="text-xl font-bold uppercase">{t('Coins')}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed opacity-90 max-w-[80%]">
                            {t('Earn')} {rewardAmount} {t('coins for every friend who registers using your referral ID.')}
                        </p>
                    </div>
                </div>

                {/* Referral Code Card */}
                <div className="bg-white dark:bg-[#342d18] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4 text-center">
                        {t('Your Unique Referral ID')}
                    </p>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-black/20 p-4 rounded-xl border-2 border-dashed border-primary/30">
                        <span className="text-2xl font-black tracking-widest text-primary font-mono">{referralId}</span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm active:scale-95 transition-all shadow-sm"
                        >
                            <MaterialSymbol name={copied ? 'done' : 'content_copy'} size={20} />
                            {copied ? t('Copied') : t('Copy')}
                        </button>
                    </div>
                </div>

                {/* How it works */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white px-1">{t('How it Works')}</h3>
                    <div className="space-y-3">
                        {[
                            { icon: 'share', title: t('Share your ID'), desc: t('Send your referral ID to your friends.') },
                            { icon: 'person_add', title: t('Friend Registers'), desc: t('They enter your ID during the signup process.') },
                            { icon: 'payments', title: t('Get Rewarded'), desc: `${t('You receive')} ${rewardAmount} ${t('coins instantly upon their successful registration!')}` }
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4 bg-white dark:bg-[#342d18] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <MaterialSymbol name={step.icon} size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{step.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Referral History */}
                <div className="bg-white dark:bg-[#342d18] rounded-2xl p-6 shadow-sm text-center border border-gray-100 dark:border-white/5">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-full mb-4">
                        <MaterialSymbol name="group" className="text-blue-500" size={32} />
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{referralCount}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('Total Successful Referrals')}</p>
                </div>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="w-full py-4 bg-primary text-slate-900 font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    <MaterialSymbol name="share" size={24} />
                    {t('SHARE WITH FRIENDS')}
                </button>
            </main>

            <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
        </div>
    );
};
