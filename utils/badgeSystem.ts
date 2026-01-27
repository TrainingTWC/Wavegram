
import React from 'react';
import {
    Coffee, Wind, MessageSquare, Heart,
    Star, Mic, Clapperboard, Repeat, Target,
    Trophy, Flame, Gem, PenTool, Smartphone,
    Zap, Crown, Medal, Landmark, Sparkles, Orbit
} from 'lucide-react';

export interface Badge {
    id: string;
    name: string;
    description: string;
    emoji: string;
    metricLabel: string;
    metricValue: string;
    color: string;
    gradient: string;
    illustration: React.ReactNode;
    requirement: (stats: UserStats) => boolean;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
    totalBrews: number;
    totalSips: number;
    totalComments: number;
    totalShares: number;
    sharesReceived: number;
}

export const BADGES: Badge[] = [
    // COMMON BADGES (Easy to earn)
    {
        id: 'first_brew',
        name: 'First Brew',
        description: 'Shared your first coffee moment',
        emoji: '☕',
        metricLabel: 'Moment',
        metricValue: '1/1',
        color: '#94a3b8', // Slate-400 equivalent hex roughly
        gradient: 'from-slate-500/10 to-slate-400/5',
        illustration: React.createElement(Coffee, { className: "w-20 h-20 text-slate-300" }),
        requirement: (stats) => stats.totalBrews >= 1,
        rarity: 'common'
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Received 5 sips on your brews',
        emoji: '🦋',
        metricLabel: 'Sips',
        metricValue: '5',
        color: '#94a3b8',
        gradient: 'from-slate-500/10 to-slate-400/5',
        illustration: React.createElement(Wind, { className: "w-20 h-20 text-slate-300" }),
        requirement: (stats) => stats.totalSips >= 5,
        rarity: 'common'
    },
    {
        id: 'conversationalist',
        name: 'Conversationalist',
        description: 'Received 3 comments',
        emoji: '💬',
        metricLabel: 'Replies',
        metricValue: '3',
        color: '#94a3b8',
        gradient: 'from-slate-500/10 to-slate-400/5',
        illustration: React.createElement(MessageSquare, { className: "w-20 h-20 text-slate-300" }),
        requirement: (stats) => stats.totalComments >= 3,
        rarity: 'common'
    },
    {
        id: 'coffee_lover',
        name: 'Coffee Lover',
        description: 'Posted 5 brews',
        emoji: '❤️',
        metricLabel: 'Brews',
        metricValue: '5',
        color: '#94a3b8',
        gradient: 'from-slate-500/10 to-slate-400/5',
        illustration: React.createElement(Heart, { className: "w-20 h-20 text-slate-300" }),
        requirement: (stats) => stats.totalBrews >= 5,
        rarity: 'common'
    },

    // RARE BADGES (Moderate difficulty)
    {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Received 25 sips',
        emoji: '⭐',
        metricLabel: 'Sips',
        metricValue: '25',
        color: '#38bdf8', // Sky-400
        gradient: 'from-sky-500/20 to-blue-600/20',
        illustration: React.createElement(Star, { className: "w-20 h-20 text-sky-400" }),
        requirement: (stats) => stats.totalSips >= 25,
        rarity: 'rare'
    },
    {
        id: 'community_voice',
        name: 'Community Voice',
        description: 'Posted 10 brews',
        emoji: '📢',
        metricLabel: 'Brews',
        metricValue: '10',
        color: '#38bdf8',
        gradient: 'from-sky-500/20 to-blue-600/20',
        illustration: React.createElement(Mic, { className: "w-20 h-20 text-sky-400" }),
        requirement: (stats) => stats.totalBrews >= 10,
        rarity: 'rare'
    },
    {
        id: 'crowd_pleaser',
        name: 'Crowd Pleaser',
        description: 'Received 10 comments',
        emoji: '🎭',
        metricLabel: 'Applause',
        metricValue: '10',
        color: '#38bdf8',
        gradient: 'from-sky-500/20 to-blue-600/20',
        illustration: React.createElement(Clapperboard, { className: "w-20 h-20 text-sky-400" }),
        requirement: (stats) => stats.totalComments >= 10,
        rarity: 'rare'
    },
    {
        id: 'share_worthy',
        name: 'Share Worthy',
        description: 'Your brews were shared 5 times',
        emoji: '🔄',
        metricLabel: 'Echoes',
        metricValue: '5',
        color: '#38bdf8',
        gradient: 'from-sky-500/20 to-blue-600/20',
        illustration: React.createElement(Repeat, { className: "w-20 h-20 text-sky-400" }),
        requirement: (stats) => stats.sharesReceived >= 5,
        rarity: 'rare'
    },
    {
        id: 'dedicated_barista',
        name: 'Dedicated Barista',
        description: 'Posted 20 brews',
        emoji: '🎯',
        metricLabel: 'Target',
        metricValue: '20',
        color: '#38bdf8',
        gradient: 'from-sky-500/20 to-blue-600/20',
        illustration: React.createElement(Target, { className: "w-20 h-20 text-sky-400" }),
        requirement: (stats) => stats.totalBrews >= 20,
        rarity: 'rare'
    },

    // EPIC BADGES (Challenging)
    {
        id: 'espresso_expert',
        name: 'Espresso Expert',
        description: 'Received 50 sips',
        emoji: '🏆',
        metricLabel: 'Impact',
        metricValue: '50',
        color: '#a855f7', // Purple-500
        gradient: 'from-purple-500/20 to-fuchsia-600/20',
        illustration: React.createElement(Trophy, { className: "w-20 h-20 text-purple-400" }),
        requirement: (stats) => stats.totalSips >= 50,
        rarity: 'epic'
    },
    {
        id: 'viral_brew',
        name: 'Viral Brew',
        description: 'Received 100 sips',
        emoji: '🔥',
        metricLabel: 'Heat',
        metricValue: '100+',
        color: '#a855f7',
        gradient: 'from-purple-500/20 to-fuchsia-600/20',
        illustration: React.createElement(Flame, { className: "w-20 h-20 text-purple-400" }),
        requirement: (stats) => stats.totalSips >= 100,
        rarity: 'epic'
    },
    {
        id: 'engagement_master',
        name: 'Engagement Master',
        description: 'Received 25 comments',
        emoji: '💎',
        metricLabel: 'Gems',
        metricValue: '25',
        color: '#a855f7',
        gradient: 'from-purple-500/20 to-fuchsia-600/20',
        illustration: React.createElement(Gem, { className: "w-20 h-20 text-purple-400" }),
        requirement: (stats) => stats.totalComments >= 25,
        rarity: 'epic'
    },
    {
        id: 'prolific_creator',
        name: 'Prolific Creator',
        description: 'Posted 50 brews',
        emoji: '✍️',
        metricLabel: 'Folios',
        metricValue: '50',
        color: '#a855f7',
        gradient: 'from-purple-500/20 to-fuchsia-600/20',
        illustration: React.createElement(PenTool, { className: "w-20 h-20 text-purple-400" }),
        requirement: (stats) => stats.totalBrews >= 50,
        rarity: 'epic'
    },
    {
        id: 'influencer',
        name: 'Influencer',
        description: 'Your brews were shared 15 times',
        emoji: '📱',
        metricLabel: 'Ping',
        metricValue: '15',
        color: '#a855f7',
        gradient: 'from-purple-500/20 to-fuchsia-600/20',
        illustration: React.createElement(Smartphone, { className: "w-20 h-20 text-purple-400" }),
        requirement: (stats) => stats.sharesReceived >= 15,
        rarity: 'epic'
    },
    {
        id: 'triple_threat',
        name: 'Triple Threat',
        description: '30 brews, 75 sips, and 20 comments',
        emoji: '⚡',
        metricLabel: 'Power',
        metricValue: '3X',
        color: '#a855f7',
        gradient: 'from-purple-500/20 to-fuchsia-600/20',
        illustration: React.createElement(Zap, { className: "w-20 h-20 text-purple-400" }),
        requirement: (stats) => stats.totalBrews >= 30 && stats.totalSips >= 75 && stats.totalComments >= 20,
        rarity: 'epic'
    },

    // LEGENDARY BADGES (Very difficult)
    {
        id: 'coffee_legend',
        name: 'Coffee Legend',
        description: 'Received 200 sips',
        emoji: '👑',
        metricLabel: 'Legacy',
        metricValue: '200+',
        color: '#fbbf24', // Amber-400
        gradient: 'from-amber-500/30 to-orange-600/30',
        illustration: React.createElement(Crown, { className: "w-20 h-20 text-amber-400" }),
        requirement: (stats) => stats.totalSips >= 200,
        rarity: 'legendary'
    },
    {
        id: 'master_barista',
        name: 'Master Barista',
        description: 'Posted 100 brews',
        emoji: '🎖️',
        metricLabel: 'Honor',
        metricValue: '100',
        color: '#fbbf24',
        gradient: 'from-amber-500/30 to-orange-600/30',
        illustration: React.createElement(Medal, { className: "w-20 h-20 text-amber-400" }),
        requirement: (stats) => stats.totalBrews >= 100,
        rarity: 'legendary'
    },
    {
        id: 'community_pillar',
        name: 'Community Pillar',
        description: '75 brews, 150 sips, and 50 comments',
        emoji: '🏛️',
        metricLabel: 'Status',
        metricValue: 'ELIT',
        color: '#fbbf24',
        gradient: 'from-amber-500/30 to-orange-600/30',
        illustration: React.createElement(Landmark, { className: "w-20 h-20 text-amber-400" }),
        requirement: (stats) => stats.totalBrews >= 75 && stats.totalSips >= 150 && stats.totalComments >= 50,
        rarity: 'legendary'
    },
    {
        id: 'taste_maker',
        name: 'Taste Maker',
        description: 'Your brews were shared 30 times',
        emoji: '🌟',
        metricLabel: 'Spark',
        metricValue: '30',
        color: '#fbbf24',
        gradient: 'from-amber-500/30 to-orange-600/30',
        illustration: React.createElement(Sparkles, { className: "w-20 h-20 text-amber-400" }),
        requirement: (stats) => stats.sharesReceived >= 30,
        rarity: 'legendary'
    },
    {
        id: 'wavegram_elite',
        name: 'Wavegram Elite',
        description: '100 brews, 250 sips, 75 comments, and 25 shares',
        emoji: '💫',
        metricLabel: 'Cosmos',
        metricValue: '∞',
        color: '#fbbf24',
        gradient: 'from-amber-500/30 to-orange-600/30',
        illustration: React.createElement(Orbit, { className: "w-20 h-20 text-amber-400" }),
        requirement: (stats) =>
            stats.totalBrews >= 100 &&
            stats.totalSips >= 250 &&
            stats.totalComments >= 75 &&
            stats.sharesReceived >= 25,
        rarity: 'legendary'
    }
];

export const calculateEarnedBadges = (stats: UserStats): Badge[] => {
    return BADGES.filter(badge => badge.requirement(stats));
};

export const getBadgeCountByRarity = (earnedBadges: Badge[]) => {
    return {
        common: earnedBadges.filter(b => b.rarity === 'common').length,
        rare: earnedBadges.filter(b => b.rarity === 'rare').length,
        epic: earnedBadges.filter(b => b.rarity === 'epic').length,
        legendary: earnedBadges.filter(b => b.rarity === 'legendary').length,
    };
};
