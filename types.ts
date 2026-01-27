
export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  createdAt: string;
  isLiked?: boolean;
}

export enum NavigationTab {
  HOME = 'home',
  SEARCH = 'search',
  POST = 'post',
  ACTIVITY = 'activity',
  PROFILE = 'profile'
}
