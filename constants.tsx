
import React from 'react';
import { Post, User } from './types';

// No hardcoded CURRENT_USER anymore - use Supabase Auth session instead

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'twc_official',
    username: 'barista_pro',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    content: 'Just perfected the art of the perfect pour-over. The notes of blueberry and dark chocolate in this Ethiopian Yirgacheffe are absolutely stunning! ☕✨ #ThirdWaveCoffee #Wavegram',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&h=500&auto=format&fit=crop',
    likes: 85,
    shares: 12,
    createdAt: '45m',
    comments: [
      {
        id: 'c1',
        userId: 'u3',
        username: 'coffee_lover_99',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
        content: 'Drop the recipe and grind size please!',
        createdAt: '30m',
        likes: 5
      }
    ]
  },
  {
    id: 'p2',
    userId: 'u4',
    username: 'morning_ritual',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop',
    content: 'Nothing beats a fresh batch of cold brew on a sunny morning. Steeping for 18 hours makes all the difference. Who else is a fan of long steeps? 🧊☕',
    likes: 156,
    shares: 24,
    createdAt: '3h',
    comments: []
  },
  {
    id: 'p3',
    userId: 'u5',
    username: 'barista_hq',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&h=200&auto=format&fit=crop',
    content: 'Our new seasonal beans are finally here! Direct from a small farm in Costa Rica. Expect honey-like sweetness and a silky body. 🍯🇨🇷',
    image: 'https://images.unsplash.com/photo-1442154421459-335190013233?q=80&w=800&h=500&auto=format&fit=crop',
    likes: 210,
    shares: 45,
    createdAt: '5h',
    comments: []
  }
];

export const Icons = {
  Home: ({ active }: { active?: boolean }) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Search: ({ active }: { active?: boolean }) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Post: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Heart: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#ed4956" : "none"} stroke={active ? "#ed4956" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Comment: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  Share: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  ),
  More: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  ),
  Verified: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1d9bf0" stroke="white" strokeWidth="1">
      <path d="M12 2L15.09 5.26L19.47 4.53L20.2 8.91L23.46 12L20.2 15.09L19.47 19.47L15.09 20.2L12 23.46L8.91 20.2L4.53 19.47L3.8 15.09L0.54 12L3.8 8.91L4.53 4.53L8.91 5.26L12 2Z" />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  )
};
