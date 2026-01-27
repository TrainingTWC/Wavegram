
import React, { useState, useRef, useCallback } from 'react';
import { Achievement, MousePosition } from '../types';

interface ArchetypeCardProps {
  achievement: Achievement;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ achievement }) => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case 'Legendary': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case 'Epic': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
      case 'Rare': return 'text-sky-400 border-sky-500/50 bg-sky-500/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative group cursor-pointer w-full max-w-[320px] h-[460px] rounded-[32px] p-px 
        transition-all duration-300 ease-out transform
        ${isHovering ? '-translate-y-2' : 'translate-y-0'}
      `}
    >
      {/* Outer Border Glow */}
      <div 
        className={`absolute inset-0 rounded-[32px] transition-opacity duration-500 blur-2xl opacity-0 
          group-hover:opacity-30 pointer-events-none`}
        style={{ backgroundColor: achievement.color }}
      />

      {/* Main Card Surface */}
      <div className="relative h-full w-full bg-[#0a0f1d] border border-white/5 rounded-[30px] overflow-hidden flex flex-col items-center shadow-2xl">
        
        {/* Soft Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-30`} />

        {/* Noise Layer */}
        <div className="noise-overlay" />

        {/* Holographic Layer */}
        <div 
          className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-500 mix-blend-color-dodge
            ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: `
              radial-gradient(
                circle at ${mousePos.x}% ${mousePos.y}%, 
                rgba(255, 255, 255, ${achievement.tier === 'Legendary' ? '0.25' : '0.15'}) 0%, 
                transparent 50%
              ),
              linear-gradient(
                ${mousePos.x + mousePos.y}deg, 
                transparent 0%, 
                ${achievement.tier === 'Legendary' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 100, 200, 0.1)'} 20%, 
                ${achievement.tier === 'Legendary' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 200, 255, 0.1)'} 40%, 
                ${achievement.tier === 'Legendary' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(200, 100, 255, 0.1)'} 60%, 
                transparent 80%
              )
            `,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Illustration Section */}
        <div className="flex-1 flex items-center justify-center relative z-10 w-full p-8 mt-4">
          <div className="relative group-hover:scale-110 transition-transform duration-500 ease-out">
            <div className={`absolute inset-0 blur-3xl opacity-10 bg-white group-hover:opacity-30 transition-opacity`} />
            <div className="relative drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {achievement.illustration}
            </div>
          </div>
        </div>

        {/* Top Tier Badge */}
        <div className={`absolute top-6 right-6 z-30 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${getTierColorClass(achievement.tier)}`}>
          {achievement.tier}
        </div>

        {/* Content Area */}
        <div className="w-full p-8 pt-0 relative z-10">
          <h3 className="text-2xl font-display font-bold text-white mb-2 tracking-tight leading-none">
            {achievement.name}
          </h3>
          
          <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium min-h-[32px]">
            {achievement.description}
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-6" />

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold mb-0.5">
                {achievement.metricLabel}
              </span>
              <span className="text-xl font-display font-black text-white">
                {achievement.metricValue}
              </span>
            </div>
            
            <div className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
              Ref: {achievement.id.substring(0, 8)}
            </div>
          </div>
        </div>

        {/* Global Shine sweep */}
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-25 transition-opacity duration-700"
          style={{
            background: `linear-gradient(115deg, transparent 20%, white 48%, white 52%, transparent 80%)`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${(mousePos.x / 100) * 200 - 50}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ArchetypeCard;
