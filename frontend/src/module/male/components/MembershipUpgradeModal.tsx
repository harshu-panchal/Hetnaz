/**
 * Membership Upgrade Modal - Celebration for tier upgrades
 * @purpose: Display celebration animation when user upgrades membership tier
 */

import { useEffect, useState, useRef } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface MembershipUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    newTier: 'silver' | 'gold' | 'platinum';
    previousTier?: string;
}

// Confetti particle interface
interface Particle {
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
    size: number;
    velocityX: number;
    velocityY: number;
}

export const MembershipUpgradeModal = ({ isOpen, onClose, newTier, previousTier }: MembershipUpgradeModalProps) => {
    const { t } = useTranslation();
    const [particles, setParticles] = useState<Particle[]>([]);
    const [showBadge, setShowBadge] = useState(false);
    const animationFrameRef = useRef<number>();
    const containerRef = useRef<HTMLDivElement>(null);

    // Tier-specific configurations with translation support
    const tierConfig = {
        silver: {
            icon: 'star',
            gradient: 'from-gray-400 via-gray-300 to-gray-500',
            bgGradient: 'from-gray-600/90 to-gray-800/90',
            textColor: 'text-gray-300',
            particleColors: ['#C0C0C0', '#A8A8A8', '#D3D3D3', '#808080', '#FFFFFF'],
            celebrationIntensity: 1,
            titleKey: 'silverMemberTitle',
            subtitleKey: 'silverMemberSubtitle',
            titleFallback: 'Silver Member!',
            subtitleFallback: 'Welcome to the Silver tier',
        },
        gold: {
            icon: 'workspace_premium',
            gradient: 'from-yellow-400 via-yellow-300 to-orange-400',
            bgGradient: 'from-yellow-600/90 to-orange-700/90',
            textColor: 'text-yellow-300',
            particleColors: ['#FFD700', '#FFA500', '#FFDF00', '#F4C430', '#DAA520'],
            celebrationIntensity: 1.5,
            titleKey: 'goldMemberTitle',
            subtitleKey: 'goldMemberSubtitle',
            titleFallback: 'Gold Member!',
            subtitleFallback: "You're now a Gold member",
        },
        platinum: {
            icon: 'diamond',
            gradient: 'from-purple-400 via-blue-400 to-cyan-400',
            bgGradient: 'from-purple-700/90 via-blue-800/90 to-cyan-800/90',
            textColor: 'text-cyan-300',
            particleColors: ['#E5E4E2', '#A0D6E8', '#9370DB', '#87CEEB', '#FFFFFF', '#DDA0DD'],
            celebrationIntensity: 2,
            titleKey: 'platinumMemberTitle',
            subtitleKey: 'platinumMemberSubtitle',
            titleFallback: 'Platinum Member!',
            subtitleFallback: "You've achieved the highest tier!",
        },
    };


    const config = tierConfig[newTier] || tierConfig.silver;

    // Get translated text with fallbacks
    const title = t(config.titleKey) !== config.titleKey ? t(config.titleKey) : config.titleFallback;
    const subtitle = t(config.subtitleKey) !== config.subtitleKey ? t(config.subtitleKey) : config.subtitleFallback;
    const upgradedFromText = t('upgradedFrom') !== 'upgradedFrom' ? t('upgradedFrom') : 'Upgraded from';
    const awesomeText = t('awesome') !== 'awesome' ? t('awesome') : 'Awesome!';


    // Generate confetti particles
    const generateParticles = () => {
        const newParticles: Particle[] = [];
        const count = Math.floor(60 * config.celebrationIntensity);

        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                y: -10 - Math.random() * 20,
                rotation: Math.random() * 360,
                color: config.particleColors[Math.floor(Math.random() * config.particleColors.length)],
                size: 6 + Math.random() * 8,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: 2 + Math.random() * 3,
            });
        }

        setParticles(newParticles);
    };

    // Animate particles
    useEffect(() => {
        if (!isOpen) return;

        // Generate initial particles
        generateParticles();

        // Show badge with delay
        const badgeTimer = setTimeout(() => setShowBadge(true), 500);

        // Animate particles falling
        const animate = () => {
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    y: p.y + p.velocityY,
                    x: p.x + p.velocityX,
                    rotation: p.rotation + 3,
                    velocityY: p.velocityY + 0.1, // gravity
                })).filter(p => p.y < 110)
            );
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            clearTimeout(badgeTimer);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isOpen]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setShowBadge(false);
            setParticles([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient} backdrop-blur-sm`} />

            {/* Close button at top right */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Close"
            >
                <MaterialSymbol name="close" size={24} />
            </button>

            {/* Confetti particles */}
            <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="absolute transition-none"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            transform: `rotate(${particle.rotation}deg)`,
                            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div
                className="relative z-10 flex flex-col items-center text-center px-8"
                onClick={e => e.stopPropagation()}
            >
                {/* Badge Icon with Animation */}
                <div
                    className={`relative mb-6 transition-all duration-700 ease-out ${showBadge
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-50 opacity-0 translate-y-8'
                        }`}
                >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-full blur-2xl opacity-60 animate-pulse`}
                        style={{ width: 160, height: 160, left: -20, top: -20 }} />

                    {/* Badge circle */}
                    <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-2xl ${newTier === 'platinum' ? 'animate-pulse' : ''
                        }`}>
                        {/* Inner shine */}
                        <div className="absolute inset-2 rounded-full bg-white/20" />

                        {/* Icon */}
                        <MaterialSymbol
                            name={config.icon as any}
                            size={64}
                            className="text-white drop-shadow-lg"
                        />
                    </div>

                    {/* Rotating ring for platinum */}
                    {newTier === 'platinum' && (
                        <div className="absolute inset-0 w-32 h-32 border-4 border-dashed border-white/30 rounded-full animate-spin"
                            style={{ animationDuration: '8s' }} />
                    )}
                </div>

                {/* Title */}
                <h1
                    className={`text-4xl font-bold text-white mb-2 transition-all duration-500 delay-300 ${showBadge ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                >
                    🎉 {title}
                </h1>

                {/* Subtitle */}
                <p
                    className={`text-lg ${config.textColor} mb-8 transition-all duration-500 delay-500 ${showBadge ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                >
                    {subtitle}
                </p>

                {/* Previous tier info */}
                {previousTier && previousTier !== newTier && (
                    <p
                        className={`text-sm text-white/60 mb-6 transition-all duration-500 delay-700 ${showBadge ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {upgradedFromText} <span className="capitalize">{previousTier}</span>
                    </p>
                )}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full backdrop-blur-sm transition-all duration-500 delay-700 ${showBadge ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                >
                    {awesomeText}
                </button>
            </div>
        </div>
    );
};

export default MembershipUpgradeModal;
