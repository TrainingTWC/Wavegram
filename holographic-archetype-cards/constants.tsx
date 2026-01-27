
import React from 'react';
import { Achievement } from './types';
import { 
  Coffee, Wind, MessageSquare, Heart, 
  Star, Mic, Clapperboard, Repeat, Target, 
  Trophy, Flame, Gem, PenTool, Smartphone, 
  Zap, Crown, Medal, Landmark, Sparkles, Orbit 
} from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  // TIER 1: COMMON
  {
    id: 'first_brew',
    name: 'First Brew',
    description: 'Shared your first coffee moment',
    tier: 'Common',
    metricLabel: 'Moment',
    metricValue: '1/1',
    color: '#94a3b8',
    gradient: 'from-slate-500/10 to-slate-400/5',
    illustration: <Coffee className="w-20 h-20 text-slate-300" />
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Received 5 sips on your brews',
    tier: 'Common',
    metricLabel: 'Sips',
    metricValue: '5',
    color: '#94a3b8',
    gradient: 'from-slate-500/10 to-slate-400/5',
    illustration: <Wind className="w-20 h-20 text-slate-300" />
  },
  {
    id: 'conversationalist',
    name: 'Conversationalist',
    description: 'Received 3 comments',
    tier: 'Common',
    metricLabel: 'Replies',
    metricValue: '3',
    color: '#94a3b8',
    gradient: 'from-slate-500/10 to-slate-400/5',
    illustration: <MessageSquare className="w-20 h-20 text-slate-300" />
  },
  {
    id: 'coffee_lover',
    name: 'Coffee Lover',
    description: 'Posted 5 brews',
    tier: 'Common',
    metricLabel: 'Brews',
    metricValue: '5',
    color: '#94a3b8',
    gradient: 'from-slate-500/10 to-slate-400/5',
    illustration: <Heart className="w-20 h-20 text-slate-300" />
  },
  // TIER 2: RARE
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Received 25 sips',
    tier: 'Rare',
    metricLabel: 'Sips',
    metricValue: '25',
    color: '#38bdf8',
    gradient: 'from-sky-500/20 to-blue-600/20',
    illustration: <Star className="w-20 h-20 text-sky-400" />
  },
  {
    id: 'community_voice',
    name: 'Community Voice',
    description: 'Posted 10 brews',
    tier: 'Rare',
    metricLabel: 'Brews',
    metricValue: '10',
    color: '#38bdf8',
    gradient: 'from-sky-500/20 to-blue-600/20',
    illustration: <Mic className="w-20 h-20 text-sky-400" />
  },
  {
    id: 'crowd_pleaser',
    name: 'Crowd Pleaser',
    description: 'Received 10 comments',
    tier: 'Rare',
    metricLabel: 'Applause',
    metricValue: '10',
    color: '#38bdf8',
    gradient: 'from-sky-500/20 to-blue-600/20',
    illustration: <Clapperboard className="w-20 h-20 text-sky-400" />
  },
  {
    id: 'share_worthy',
    name: 'Share Worthy',
    description: 'Your brews were shared 5 times',
    tier: 'Rare',
    metricLabel: 'Echoes',
    metricValue: '5',
    color: '#38bdf8',
    gradient: 'from-sky-500/20 to-blue-600/20',
    illustration: <Repeat className="w-20 h-20 text-sky-400" />
  },
  {
    id: 'dedicated_barista',
    name: 'Dedicated Barista',
    description: 'Posted 20 brews',
    tier: 'Rare',
    metricLabel: 'Target',
    metricValue: '20',
    color: '#38bdf8',
    gradient: 'from-sky-500/20 to-blue-600/20',
    illustration: <Target className="w-20 h-20 text-sky-400" />
  },
  // TIER 3: EPIC
  {
    id: 'espresso_expert',
    name: 'Espresso Expert',
    description: 'Received 50 sips',
    tier: 'Epic',
    metricLabel: 'Impact',
    metricValue: '50',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-600/20',
    illustration: <Trophy className="w-20 h-20 text-purple-400" />
  },
  {
    id: 'viral_brew',
    name: 'Viral Brew',
    description: 'Received 100 sips',
    tier: 'Epic',
    metricLabel: 'Heat',
    metricValue: '100+',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-600/20',
    illustration: <Flame className="w-20 h-20 text-purple-400" />
  },
  {
    id: 'engagement_master',
    name: 'Engagement Master',
    description: 'Received 25 comments',
    tier: 'Epic',
    metricLabel: 'Gems',
    metricValue: '25',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-600/20',
    illustration: <Gem className="w-20 h-20 text-purple-400" />
  },
  {
    id: 'prolific_creator',
    name: 'Prolific Creator',
    description: 'Posted 50 brews',
    tier: 'Epic',
    metricLabel: 'Folios',
    metricValue: '50',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-600/20',
    illustration: <PenTool className="w-20 h-20 text-purple-400" />
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Your brews were shared 15 times',
    tier: 'Epic',
    metricLabel: 'Ping',
    metricValue: '15',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-600/20',
    illustration: <Smartphone className="w-20 h-20 text-purple-400" />
  },
  {
    id: 'triple_threat',
    name: 'Triple Threat',
    description: '30 brews, 75 sips, 20 comments',
    tier: 'Epic',
    metricLabel: 'Power',
    metricValue: '3X',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-600/20',
    illustration: <Zap className="w-20 h-20 text-purple-400" />
  },
  // TIER 4: LEGENDARY
  {
    id: 'coffee_legend',
    name: 'Coffee Legend',
    description: 'Received 200 sips',
    tier: 'Legendary',
    metricLabel: 'Legacy',
    metricValue: '200+',
    color: '#fbbf24',
    gradient: 'from-amber-500/30 to-orange-600/30',
    illustration: <Crown className="w-20 h-20 text-amber-400" />
  },
  {
    id: 'master_barista',
    name: 'Master Barista',
    description: 'Posted 100 brews',
    tier: 'Legendary',
    metricLabel: 'Honor',
    metricValue: '100',
    color: '#fbbf24',
    gradient: 'from-amber-500/30 to-orange-600/30',
    illustration: <Medal className="w-20 h-20 text-amber-400" />
  },
  {
    id: 'community_pillar',
    name: 'Community Pillar',
    description: '75 brews, 150 sips, 50 comments',
    tier: 'Legendary',
    metricLabel: 'Status',
    metricValue: 'ELITE',
    color: '#fbbf24',
    gradient: 'from-amber-500/30 to-orange-600/30',
    illustration: <Landmark className="w-20 h-20 text-amber-400" />
  },
  {
    id: 'taste_maker',
    name: 'Taste Maker',
    description: 'Your brews were shared 30 times',
    tier: 'Legendary',
    metricLabel: 'Spark',
    metricValue: '30',
    color: '#fbbf24',
    gradient: 'from-amber-500/30 to-orange-600/30',
    illustration: <Sparkles className="w-20 h-20 text-amber-400" />
  },
  {
    id: 'wavegram_elite',
    name: 'Wavegram Elite',
    description: '100 brews, 250 sips, 75 comments, 25 shares',
    tier: 'Legendary',
    metricLabel: 'Cosmos',
    metricValue: '∞',
    color: '#fbbf24',
    gradient: 'from-amber-500/30 to-orange-600/30',
    illustration: <Orbit className="w-20 h-20 text-amber-400" />
  }
];
