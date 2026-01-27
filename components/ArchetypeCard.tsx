import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Badge } from '../utils/badgeSystem';

interface ArchetypeCardProps {
    achievement: Badge;
    isUnlocked?: boolean;
}

type InteractionMode = 'gyro' | 'mouse' | 'touch';

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ achievement, isUnlocked = true }) => {
    const [tiltPos, setTiltPos] = useState({ x: 50, y: 50 });
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('mouse');
    const [gyroPermissionGranted, setGyroPermissionGranted] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const gyroSmoothingRef = useRef({ x: 50, y: 50 });
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

    // Detect device type and capabilities
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const hasGyro = 'DeviceOrientationEvent' in window;

        console.log('Device detection:', { isMobile, hasGyro, userAgent: navigator.userAgent });

        if (isMobile && hasGyro) {
            setInteractionMode('gyro');
        } else if (isMobile) {
            setInteractionMode('touch');
        } else {
            setInteractionMode('mouse');
        }
    }, []);

    // Block body scroll when card is expanded
    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isExpanded]);

    // Request gyroscope permission
    const requestGyroPermission = async () => {
        console.log('Requesting gyroscope permission...');

        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            // iOS 13+ requires explicit permission
            try {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                console.log('iOS permission result:', permission);
                setGyroPermissionGranted(permission === 'granted');
                return permission === 'granted';
            } catch (error) {
                console.error('Gyroscope permission error:', error);
                return false;
            }
        } else {
            // Android Chrome - just grant permission
            console.log('Android - granting permission');
            setGyroPermissionGranted(true);
            return true;
        }
    };

    // Handle gyroscope data - ALWAYS ACTIVE when expanded
    useEffect(() => {
        if (!isExpanded || interactionMode !== 'gyro' || !gyroPermissionGranted) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            console.log('Gyro event:', { beta: event.beta, gamma: event.gamma });

            const beta = event.beta || 0;
            const gamma = event.gamma || 0;

            // Normalize to 0-100 range
            const clampedBeta = Math.max(-45, Math.min(45, beta));
            const clampedGamma = Math.max(-45, Math.min(45, gamma));

            let targetX = ((clampedGamma + 45) / 90) * 100;
            let targetY = ((clampedBeta + 45) / 90) * 100;

            // Apply smoothing - much slower and smoother now
            const smoothing = 0.05;
            gyroSmoothingRef.current.x += (targetX - gyroSmoothingRef.current.x) * smoothing;
            gyroSmoothingRef.current.y += (targetY - gyroSmoothingRef.current.y) * smoothing;

            setTiltPos({
                x: gyroSmoothingRef.current.x,
                y: gyroSmoothingRef.current.y
            });
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [isExpanded, interactionMode, gyroPermissionGranted]);

    // Handle mouse movement (desktop only, when expanded)
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (interactionMode !== 'mouse' || !isExpanded || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTiltPos({ x, y });
    }, [interactionMode, isExpanded]);

    // Handle touch start - record position and time
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
    };

    // Handle touch end - detect tap vs swipe
    const handleTouchEnd = async (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        const touch = e.changedTouches[0];
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
        const deltaTime = Date.now() - touchStartRef.current.time;

        // Consider it a tap if movement is small and time is short
        const isTap = deltaX < 10 && deltaY < 10 && deltaTime < 300;

        console.log('Touch end:', { deltaX, deltaY, deltaTime, isTap });

        if (isTap) {
            e.preventDefault();
            e.stopPropagation();

            if (!isExpanded) {
                // Expand card
                console.log('Expanding card...');
                setIsExpanded(true);

                // Request gyroscope permission if needed
                if (interactionMode === 'gyro' && !gyroPermissionGranted) {
                    console.log('Requesting permission after expansion...');
                    await requestGyroPermission();
                }
            } else {
                // Flip card
                console.log('Flipping card, current state:', isFlipped);
                setIsFlipped(prev => !prev);
            }
        }

        touchStartRef.current = null;
    };

    // Handle mouse click (desktop only)
    const handleMouseClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isExpanded) {
            console.log('Expanding card (mouse)...');
            setIsExpanded(true);
        } else {
            console.log('Flipping card (mouse), current state:', isFlipped);
            setIsFlipped(prev => !prev);
        }
    };

    // Handle close
    const handleClose = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Closing card...');
        setIsExpanded(false);
        setIsFlipped(false);
    };

    const getTierColorClass = (tier: string) => {
        switch (tier) {
            case 'Legendary': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
            case 'Epic': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
            case 'Rare': return 'text-sky-400 border-sky-500/50 bg-sky-500/10';
            default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
        }
    };

    return (
        <>
            {/* Gallery Card */}
            <div
                ref={!isExpanded ? cardRef : null}
                onClick={interactionMode === 'mouse' ? handleMouseClick : undefined}
                onTouchStart={interactionMode !== 'mouse' ? handleTouchStart : undefined}
                onTouchEnd={interactionMode !== 'mouse' ? handleTouchEnd : undefined}
                className={`relative group cursor-pointer w-full aspect-[2/3] rounded-[32px] p-px 
                    transition-all duration-300 ease-out transform hover:-translate-y-2
                    ${!isUnlocked ? 'grayscale opacity-60' : ''}
                    ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                `}
            >
                {/* Outer Border Glow */}
                {isUnlocked && (
                    <div
                        className="absolute inset-0 rounded-[32px] transition-opacity duration-500 blur-2xl opacity-0 group-hover:opacity-30 pointer-events-none"
                        style={{ backgroundColor: achievement.color }}
                    />
                )}

                {/* Card Content */}
                <div className="relative h-full w-full bg-[#0a0f1d] border border-white/5 rounded-[30px] overflow-hidden flex flex-col items-center shadow-2xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-30`} />
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                    <div className="flex-1 flex items-center justify-center relative z-10 w-full p-4 mt-2">
                        <div className="relative transform scale-90">
                            <div className="relative drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                {achievement.illustration}
                            </div>
                        </div>
                    </div>

                    <div className={`absolute top-3 right-3 z-30 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${getTierColorClass(achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1))}`}>
                        {achievement.rarity}
                    </div>

                    <div className="w-full p-5 pt-0 relative z-10 flex flex-col">
                        <h3 className="text-base font-black text-white mb-1 tracking-tight leading-none uppercase truncate">
                            {achievement.name}
                        </h3>
                        <p className="text-slate-400 text-[10px] leading-tight mb-3 font-medium min-h-[2.5em] line-clamp-2">
                            {achievement.description}
                        </p>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-3" />
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[8px] uppercase tracking-tighter text-slate-500 font-bold mb-0.5">
                                    {achievement.metricLabel}
                                </span>
                                <span className="text-sm font-black text-white">
                                    {achievement.metricValue}
                                </span>
                            </div>
                            <div className="px-2 py-1 rounded-lg border border-white/5 bg-white/5 backdrop-blur-md text-[8px] font-bold uppercase tracking-widest text-slate-400">
                                {!isUnlocked ? 'LOCKED' : `${achievement.id.substring(0, 4)}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Expanded Card */}
            {isExpanded && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    style={{ perspective: '1000px' }}
                >
                    {/* Close Button */}
                    <button
                        onClick={interactionMode === 'mouse' ? handleClose : undefined}
                        onTouchEnd={interactionMode !== 'mouse' ? handleClose : undefined}
                        className="absolute top-6 right-6 z-[60] w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Expanded Card with Flip */}
                    <div
                        ref={isExpanded ? cardRef : null}
                        onMouseMove={handleMouseMove}
                        onClick={interactionMode === 'mouse' ? handleMouseClick : undefined}
                        onTouchStart={interactionMode !== 'mouse' ? handleTouchStart : undefined}
                        onTouchEnd={interactionMode !== 'mouse' ? handleTouchEnd : undefined}
                        className="relative w-[85vw] max-w-[400px] aspect-[2/3] cursor-pointer"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: `
                                rotateX(${((tiltPos.y - 50) / 50) * -15}deg)
                                rotateY(${((tiltPos.x - 50) / 50) * 15 + (isFlipped ? 180 : 0)}deg)
                            `,
                            transition: isFlipped ? 'transform 0.2s ease-out' : 'transform 0.1s ease-out'
                        }}
                    >
                        {/* Front Side */}
                        <div
                            className="absolute inset-0 rounded-[32px] p-px"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden'
                            }}
                        >
                            {/* Outer Glow */}
                            <div
                                className="absolute inset-0 rounded-[32px] blur-3xl opacity-40 pointer-events-none"
                                style={{ backgroundColor: achievement.color }}
                            />

                            {/* Card Surface */}
                            <div className="relative h-full w-full bg-[#0a0f1d] border border-white/5 rounded-[30px] overflow-hidden flex flex-col items-center shadow-2xl">
                                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-30`} />
                                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                                {/* Holographic Layer - ALWAYS ACTIVE */}
                                {isUnlocked && (
                                    <div
                                        className="absolute inset-0 z-20 pointer-events-none opacity-100 mix-blend-color-dodge"
                                        style={{
                                            background: `
                                                radial-gradient(
                                                    circle at ${tiltPos.x}% ${tiltPos.y}%, 
                                                    rgba(255, 255, 255, ${achievement.rarity === 'legendary' ? '0.6' : '0.5'}) 0%, 
                                                    transparent 60%
                                                ),
                                                linear-gradient(
                                                    ${tiltPos.x + tiltPos.y}deg, 
                                                    transparent 0%, 
                                                    ${achievement.rarity === 'legendary' ? 'rgba(255, 220, 100, 0.4)' : 'rgba(255, 100, 200, 0.3)'} 15%, 
                                                    ${achievement.rarity === 'legendary' ? 'rgba(255, 150, 50, 0.3)' : 'rgba(100, 200, 255, 0.3)'} 30%, 
                                                    ${achievement.rarity === 'legendary' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.4)'} 45%, 
                                                    ${achievement.rarity === 'legendary' ? 'rgba(255, 150, 50, 0.3)' : 'rgba(100, 255, 200, 0.3)'} 60%, 
                                                    ${achievement.rarity === 'legendary' ? 'rgba(255, 220, 100, 0.4)' : 'rgba(200, 100, 255, 0.3)'} 75%, 
                                                    transparent 90%
                                                )
                                            `,
                                            backgroundSize: '150% 150%',
                                            transition: 'background 0.15s ease-out'
                                        }}
                                    />
                                )}

                                {/* Illustration */}
                                <div className="flex-1 flex items-center justify-center relative z-10 w-full p-8 mt-4">
                                    <div className="relative transform scale-110">
                                        {isUnlocked && (
                                            <div className="absolute inset-0 blur-3xl opacity-20 bg-white" />
                                        )}
                                        <div className="relative drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                                            {achievement.illustration}
                                        </div>
                                    </div>
                                </div>

                                {/* Tier Badge */}
                                <div className={`absolute top-4 right-4 z-30 px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getTierColorClass(achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1))}`}>
                                    {achievement.rarity}
                                </div>

                                {/* Content */}
                                <div className="w-full p-6 pt-0 relative z-10 flex flex-col">
                                    <h3 className="text-xl font-black text-white mb-2 tracking-tight leading-none uppercase">
                                        {achievement.name}
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-4 font-medium">
                                        {achievement.description}
                                    </p>
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-4" />
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                                                {achievement.metricLabel}
                                            </span>
                                            <span className="text-lg font-black text-white">
                                                {achievement.metricValue}
                                            </span>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-slate-300">
                                            TAP TO FLIP
                                        </div>
                                    </div>
                                </div>

                                {/* Shine Effect */}
                                {isUnlocked && (
                                    <div
                                        className="absolute inset-0 pointer-events-none z-30 opacity-30"
                                        style={{
                                            background: `linear-gradient(115deg, transparent 20%, white 48%, white 52%, transparent 80%)`,
                                            backgroundSize: '200% 200%',
                                            backgroundPosition: `${(tiltPos.x / 100) * 200 - 50}%`,
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Back Side */}
                        <div
                            className="absolute inset-0 rounded-[32px] p-px"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                            }}
                        >
                            <div className="relative h-full w-full bg-[#0a0f1d] border border-white/5 rounded-[30px] overflow-hidden flex flex-col p-6 shadow-2xl">
                                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-20`} />
                                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">
                                        Badge Details
                                    </h3>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                                                Achievement Name
                                            </span>
                                            <span className="text-base font-bold text-white">
                                                {achievement.name}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                                                Description
                                            </span>
                                            <span className="text-sm text-slate-300 leading-relaxed">
                                                {achievement.description}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                                                Rarity
                                            </span>
                                            <span className={`text-sm font-bold ${achievement.rarity === 'legendary' ? 'text-amber-400' : achievement.rarity === 'epic' ? 'text-purple-400' : 'text-sky-400'}`}>
                                                {achievement.rarity.toUpperCase()}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                                                {achievement.metricLabel}
                                            </span>
                                            <span className="text-2xl font-black text-white">
                                                {achievement.metricValue}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                                                Badge ID
                                            </span>
                                            <span className="text-xs font-mono text-slate-400">
                                                {achievement.id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 px-3 py-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-center text-[9px] font-bold uppercase tracking-widest text-slate-300">
                                        TAP TO FLIP BACK
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ArchetypeCard;
