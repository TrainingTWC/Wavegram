
import React, { useState } from 'react';
import { ACHIEVEMENTS } from './constants';
import ArchetypeCard from './components/ArchetypeCard';
import { AchievementTier } from './types';
import { Sparkles, Share2, Filter, Coffee } from 'lucide-react';

const App: React.FC = () => {
  const [activeTier, setActiveTier] = useState<AchievementTier | 'All'>('All');

  const filteredAchievements = activeTier === 'All' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.tier === activeTier);

  return (
    <div className="min-h-screen pb-32 px-6 sm:px-12 bg-[#030712] selection:bg-amber-500/30">
      {/* Navigation / Header */}
      <header className="max-w-7xl mx-auto py-12 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-800/50 mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-extrabold tracking-tight text-white leading-none">
              Wavegram
            </h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Achievement Registry</span>
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
            <Filter className="w-3 h-3 text-slate-500" />
            {(['All', 'Common', 'Rare', 'Epic', 'Legendary'] as const).map(tier => (
              <button 
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
                  ${activeTier === tier ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
              >
                {tier}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-slate-800 hidden lg:block" />
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 transition-all rounded-full text-xs font-bold text-black group">
            <Share2 className="w-3.5 h-3.5" />
            Share Collection
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto">
        <section className="mb-20 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              Barista Season 1 • v2.0
            </div>
            <h2 className="text-5xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter leading-[0.85]">
              Claim Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">Milestones.</span>
            </h2>
            <p className="max-w-lg text-slate-400 text-lg leading-relaxed">
              Explore the 20 legendary achievements of Wavegram. Each card 
              reacts to your resonance with custom holographic physics.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <span className="text-4xl font-display font-black text-white">{filteredAchievements.length}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Achievements Unlocked</span>
          </div>
        </section>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {filteredAchievements.map((achievement) => (
            <ArchetypeCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto mt-32 py-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-slate-500 text-[11px] font-medium tracking-wide gap-4">
        <p>© 2024 WAVEGRAM ELITE REGISTRY. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors uppercase">Terms of Resonance</a>
          <a href="#" className="hover:text-white transition-colors uppercase">Privacy Protocol</a>
          <a href="#" className="hover:text-white transition-colors uppercase">API Documentation</a>
        </div>
      </footer>

      {/* Floating Status */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="px-6 py-4 bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Global Rank</span>
            <span className="text-sm font-display font-black text-white">#0,442</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Experience</span>
            <span className="text-sm font-display font-black text-white">12,450 XP</span>
          </div>
          <button className="ml-4 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black rounded-xl text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-600/20">
            Claim Rewards
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
