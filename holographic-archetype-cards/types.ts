
import React from 'react';

export type AchievementTier = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  metricLabel: string;
  metricValue: string;
  color: string;
  gradient: string;
  illustration: React.ReactNode;
}

export interface MousePosition {
  x: number;
  y: number;
}
