
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import PostItem from './components/PostItem';
import CreatePostModal from './components/CreatePostModal';
import BrewOfTheDay from './components/BrewOfTheDay';
import { Post, NavigationTab, Comment, User } from './types';
import { INITIAL_POSTS } from './constants';
import { supabase } from './services/supabaseClient';
import Auth from './components/Auth';
import ShareModal from './components/ShareModal';
import ArchetypeCard from './components/ArchetypeCard';
import SkeletonLoader from './components/SkeletonLoader';
import { BADGES, calculateEarnedBadges, Badge } from './utils/badgeSystem';
import { App as CapacitorApp } from '@capacitor/app';
import logo from './src/assets/login_logo.png';


const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>(() => {
    const cached = localStorage.getItem('cachedPosts');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(!posts.length);
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    return (localStorage.getItem('activeTab') as NavigationTab) || NavigationTab.HOME;
  });
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState<Post | null>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<Post | null>(null);
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [profileView, setProfileView] = useState<'brews' | 'badges'>('brews');
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Notification States
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastViewedInteractions, setLastViewedInteractions] = useState(
    parseInt(localStorage.getItem('lastViewedInteractions') || '0', 10)
  );
  // Ref to track latest view time for async operations to avoid race conditions
  const lastViewedRef = React.useRef(lastViewedInteractions);
  const touchStartY = React.useRef(0);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('cachedPosts', JSON.stringify(posts));
    }
  }, [posts]);

  // Back Button Handling
  useEffect(() => {
    let backListener: any;
    const setupBackListener = async () => {
      backListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (isPostModalOpen) {
          setIsPostModalOpen(false);
        } else if (selectedPostForComment || selectedPostForShare || selectedPostForEdit) {
          setSelectedPostForComment(null);
          setSelectedPostForShare(null);
          setSelectedPostForEdit(null);
        } else if (activeTab !== NavigationTab.HOME) {
          setActiveTab(NavigationTab.HOME);
        } else {
          CapacitorApp.exitApp();
        }
      });
    };
    setupBackListener();
    return () => {
      if (backListener) backListener.remove();
    };
  }, [activeTab, isPostModalOpen, selectedPostForComment, selectedPostForShare, selectedPostForEdit]);

  // Handle Auth Session
  useEffect(() => {
    // Check for hardcoded Training Team session first
    const mockSession = localStorage.getItem('bc_mock_session');
    if (mockSession === 'training_team_active') {
      setSession({ user: { id: '77777777-7777-7777-7777-777777777777' } });
      setCurrentUser({
        id: '77777777-7777-7777-7777-777777777777',
        username: 'twc_training',
        name: 'TWC Training Team',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=training',
        verified: true
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    } else if (data) {
      setCurrentUser({
        id: data.id,
        username: data.username,
        name: data.full_name,
        avatar: data.avatar_url,
        verified: true
      });
      // loading will be set to false by fetchPosts which is triggered by currentUser change
    } else {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    localStorage.removeItem('bc_mock_session');
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
    setIsLogoutModalOpen(false);
  };

  const handleActivityClick = (postId: string) => {
    setActiveTab(NavigationTab.HOME);
    setHighlightedPostId(postId);

    // Scroll to post after a short delay to ensure tab switch completes
    setTimeout(() => {
      const postElement = document.getElementById(`post-${postId}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedPostId(null), 3000);
    }, 100);
  };

  const handleUserClick = (userId: string) => {
    setViewedUserId(userId);
    setActiveTab(NavigationTab.PROFILE);
  };

  const fetchPosts = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          full_name,
          username,
          avatar_url
        ),
        comments (
          id,
          content,
          created_at,
          user_id,
          avatar,
          username
        ),
        likes (user_id),
        shares (id, sender_id, receiver_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setPosts(INITIAL_POSTS); // Fallback
    } else if (postsData) {
      // Map Supabase data to our Post interface
      const mappedPosts: Post[] = postsData.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        // Use full name from profile as the display name (per user request)
        username: p.profiles?.full_name || p.username || 'Unknown Barista',
        avatar: p.avatar,
        content: p.content,
        image: p.image,
        likes: p.likes_count,
        shares: (p.shares || []).length,
        createdAt: new Date(p.created_at).toLocaleDateString(),
        isLiked: (p.likes || []).some((l: any) => l.user_id === currentUser?.id),
        comments: p.comments.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          username: c.username,
          avatar: c.avatar,
          content: c.content,
          createdAt: new Date(c.created_at).toLocaleDateString(),
          likes: 0
        }))
      }));
      setPosts(mappedPosts);
      fetchActivity();
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Setup Realtime Subscriptions
  useEffect(() => {
    if (!currentUser) return;

    console.log('Setting up real-time subscriptions...');

    // Subscribe to posts changes
    const postsSubscription = supabase
      .channel('posts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Posts change detected:', payload);
          fetchPosts();
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsSubscription = supabase
      .channel('comments-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          console.log('Comments change detected:', payload);
          fetchPosts();
        }
      )
      .subscribe();

    // Subscribe to likes changes
    const likesSubscription = supabase
      .channel('likes-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        (payload) => {
          console.log('Likes change detected:', payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      postsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
    };
  }, [currentUser, fetchPosts]);

  // Handle Tab changes
  useEffect(() => {
    if (activeTab === NavigationTab.POST) {
      setIsPostModalOpen(true);
      setActiveTab(NavigationTab.HOME);
    }
    if (activeTab === NavigationTab.ACTIVITY) {
      fetchActivity();
    }
  }, [activeTab]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiking = !post.isLiked;

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: isLiking,
          likes: isLiking ? p.likes + 1 : Math.max(0, p.likes - 1)
        };
      }
      return p;
    }));

    if (isLiking) {
      // Add record to likes table
      await supabase.from('likes').insert({ post_id: postId, user_id: currentUser.id });
      // Increment count on posts table
      await supabase.rpc('increment_likes', { post_id_val: postId });
    } else {
      // Remove record from likes table
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUser.id);
      // Decrement count on posts table
      await supabase.rpc('decrement_likes', { post_id_val: postId });
    }
  };

  const handleNewPost = async (content: string, image?: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          content,
          image,
          likes_count: 0
        }
      ]);

    if (error) {
      console.error('FAILED_TO_CREATE_POST', error);
      alert(`Failed to share your brew: ${error.message}`);
    } else {
      fetchPosts();
      setIsPostModalOpen(false);
    }
  };

  const handleUpdatePost = async (content: string, image?: string) => {
    if (!selectedPostForEdit || !currentUser) return;

    const { error } = await supabase
      .from('posts')
      .update({
        content,
        image: image || selectedPostForEdit.image
      })
      .eq('id', selectedPostForEdit.id);

    if (error) {
      console.error('FAILED_TO_UPDATE_POST', error);
      alert(`Failed to update your brew: ${error.message}`);
    } else {
      fetchPosts();
      setSelectedPostForEdit(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;

    if (!window.confirm('Are you sure you want to delete this brew? This cannot be undone.')) {
      return;
    }

    try {
      // Manual cascade: Delete related data first
      const { error: shareError } = await supabase.from('shares').delete().eq('post_id', postId);
      if (shareError) console.warn('App: Error deleting shares (might be empty, ignoring):', shareError);

      const { error: likeError } = await supabase.from('likes').delete().eq('post_id', postId);
      if (likeError) console.warn('App: Error deleting likes (might be empty, ignoring):', likeError);

      const { error: commentError } = await supabase.from('comments').delete().eq('post_id', postId);
      if (commentError) console.warn('App: Error deleting comments (might be empty, ignoring):', commentError);

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      // Refresh local state optimistically
      setPosts(prev => prev.filter(p => p.id !== postId));
      fetchPosts();
      fetchActivity();
    } catch (error: any) {
      console.error('FAILED_TO_DELETE_POST', error);
      alert(`Failed to delete your brew. Error: ${error.message}`);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPostForComment || !commentText.trim() || !currentUser) return;

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: selectedPostForComment.id,
          user_id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          content: commentText
        }
      ]);

    if (error) {
      console.error('FAILED_TO_ADD_COMMENT', error);
      alert(`Failed to post your reply: ${error.message}`);
    } else {
      setCommentText('');
      setSelectedPostForComment(null);
      fetchPosts();
      fetchActivity();
    }
  };

  const fetchActivity = async () => {
    if (!currentUser) return;
    setActivityLoading(true);

    try {
      // 1. Fetch user's posts
      const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select('id, content')
        .eq('user_id', currentUser.id);

      if (postsError) throw postsError;

      if (!userPosts || userPosts.length === 0) {
        setActivities([]);
        setActivityLoading(false);
        return;
      }

      const postIds = userPosts.map(p => p.id);
      const postMap = userPosts.reduce((acc, p) => ({ ...acc, [p.id]: p.content }), {});

      // 2. Fetch shares where current user is the receiver
      const { data: sharesData, error: sharesError } = await supabase
        .from('shares')
        .select('*')
        .eq('receiver_id', currentUser.id);

      // 3. Get extra post content for shared posts (optional if we already have it)
      const sharedPostIds = (sharesData || []).map(s => s.post_id);
      const missingPostIds = sharedPostIds.filter(id => !postMap[id]);

      if (missingPostIds.length > 0) {
        const { data: extraPosts } = await supabase
          .from('posts')
          .select('id, content')
          .in('id', missingPostIds);

        (extraPosts || []).forEach(p => {
          postMap[p.id] = p.content;
        });
      }

      // 4. Fetch likes on user's posts
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('*')
        .in('post_id', postIds);

      // 5. Fetch comments on user's posts
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .in('post_id', postIds);

      // 6. Fetch profiles for all unique actors
      const actorIds = [...new Set([
        ...(likesData || []).map(l => l.user_id),
        ...(commentsData || []).map(c => c.user_id),
        ...(sharesData || []).map(s => s.sender_id)
      ])];

      let profilesMap: Record<string, any> = {};

      if (actorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', actorIds);

        profilesMap = (profilesData || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      }

      const allActivity: any[] = [];
      let newUnreadCount = 0;

      const processActivity = (item: any, type: string, actorId: string, content?: string) => {
        // Skip own activities
        if (actorId === currentUser.id) return;

        // Check if created_at exists. If not, default to 0 (old) to avoid "always new" on refresh
        const hasTimestamp = !!item.created_at;
        const timestamp = new Date(item.created_at || 0);

        // Debug log (can remove later)
        // console.log(`Activity: ${type}, Time: ${timestamp.getTime()}, LastViewed: ${lastViewedRef.current}, New? ${timestamp.getTime() > lastViewedRef.current}`);

        // Check if this activity is newer than our last visit (counts Likes, Comments, AND Shares)
        if (hasTimestamp && timestamp.getTime() > lastViewedRef.current) {
          newUnreadCount++;
        }

        const profile = profilesMap[actorId];
        allActivity.push({
          id: `${type}-${item.id}`,
          type,
          actorName: profile?.full_name || profile?.username || 'A barista',
          actorUsername: profile?.username || 'unknown',
          actorAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${actorId}`,
          postContent: postMap[item.post_id] || 'your brew',
          postId: item.post_id,
          timestamp,
          content // for comments
        });
      };

      (sharesData || []).forEach((share: any) => processActivity(share, 'share', share.sender_id));
      (likesData || []).forEach((like: any) => processActivity(like, 'like', like.user_id));
      (commentsData || []).forEach((comment: any) => processActivity(comment, 'comment', comment.user_id, comment.content));

      setActivities(allActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

      // If we are currently viewing the activity tab, keep unread count at 0
      if (activeTab === NavigationTab.ACTIVITY) {
        setUnreadCount(0);
      } else {
        setUnreadCount(newUnreadCount);
      }
    } catch (err) {
      console.error('FAILED_TO_FETCH_ACTIVITY', err);
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch viewed user profile when viewedUserId changes
  useEffect(() => {
    if (viewedUserId && viewedUserId !== currentUser?.id) {
      const fetchViewedUser = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', viewedUserId)
          .single();

        if (data) {
          setViewedUser({
            id: data.id,
            username: data.username,
            name: data.full_name,
            avatar: data.avatar_url,
            verified: true
          });
        }
      };
      fetchViewedUser();
    } else {
      setViewedUser(null);
    }
  }, [viewedUserId, currentUser]);

  function setTabWrapper(tab: NavigationTab) {
    if (tab === NavigationTab.PROFILE) {
      setViewedUserId(null); // Reset to own profile when clicking Profile icon
    }
    if (tab === NavigationTab.ACTIVITY) {
      setUnreadCount(0);

      // Calculate max timestamp from current activities to handle clock skew
      // (Server time might be ahead of local client time)
      const latestActivityTime = activities.length > 0
        ? Math.max(...activities.map(a => a.timestamp.getTime()))
        : 0;

      const now = Date.now();
      const lastViewed = Math.max(now, latestActivityTime);

      setLastViewedInteractions(lastViewed);
      lastViewedRef.current = lastViewed;
      localStorage.setItem('lastViewedInteractions', lastViewed.toString());
    }
    setActiveTab(tab);
  }

  const renderContent = () => {
    if (loading && activeTab === NavigationTab.HOME) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#c29a67] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#a09a96] font-medium animate-pulse">Frothing the milk...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case NavigationTab.HOME:
        const handleTouchStart = (e: React.TouchEvent) => {
          const scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
          if (scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
          }
        };

        const handleTouchMove = (e: React.TouchEvent) => {
          const scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
          if (scrollTop === 0 && touchStartY.current > 0) {
            const touchY = e.touches[0].clientY;
            const rawDistance = touchY - touchStartY.current;

            // Apply logarithmic damping so it feels more "natural"
            const dampedDistance = Math.max(0, Math.min(Math.log10(1 + rawDistance / 100) * 150, 120));
            setPullDistance(dampedDistance);

            // Prevent browser pull-to-refresh if we're handling it
            if (rawDistance > 10) {
              if (e.cancelable) e.preventDefault();
            }
          }
        };

        const handleTouchEnd = async (e: React.TouchEvent) => {
          const isTriggered = pullDistance > 70;
          if (isTriggered && !isRefreshing) {
            setIsRefreshing(true);

            // Minimum 3-4 pulses duration (approx 2s) + Network request
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000));
            // Haptic feedback placeholder if we were native
            await Promise.all([fetchPosts(true), fetchActivity(), minTimePromise]);

            // Force reload to fetch latest deployment from GitHub (OTA Update)
            // State is already persisted in localStorage, so user context is preserved.
            window.location.reload();
          }
          setPullDistance(0);
          touchStartY.current = 0;
        };

        return (
          <div
            className="flex-1 flex flex-col items-center overflow-y-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pull to Refresh Indicator - Spacer only since header is fixed */}
            <div style={{ height: isRefreshing ? '60px' : `${pullDistance}px`, transition: 'height 0.3s' }} />

            <div className="fixed top-0 z-50 flex justify-center items-center py-2 pt-[max(env(safe-area-inset-top)+8px,24px)] bg-[#0e0d0c]/98 backdrop-blur-xl border-b border-[#2c1a12] w-full max-w-[640px]">
              <div className={`h-14 flex items-center transition-all duration-200 ${isRefreshing ? 'animate-pulse-fast' : ''}`} style={{
                filter: (pullDistance > 0 && !isRefreshing) ? `grayscale(${Math.max(0, 1 - pullDistance / 100)}) opacity(${Math.min(1, 0.5 + (pullDistance / 200))})` : 'none',
                transform: `scale(${Math.min(1.2, 1 + (pullDistance / 500))})`
              }}>
                <img src={logo} alt="Wavegram" className="h-full object-contain" />
              </div>
            </div>
            <div className="w-full max-w-2xl px-4 pt-24 space-y-8 pb-32">
              <BrewOfTheDay currentUser={currentUser} />
              <div className="space-y-0">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    id={`post-${post.id}`}
                    className={`transition-all duration-300 ${highlightedPostId === post.id
                      ? 'ring-2 ring-[#c29a67] ring-offset-2 ring-offset-[#0e0d0c] rounded-3xl'
                      : ''
                      }`}
                  >
                    <PostItem
                      post={post}
                      isOwner={post.userId === currentUser.id}
                      onLike={handleLike}
                      onComment={(p) => setSelectedPostForComment(p)}
                      onShare={(p) => setSelectedPostForShare(p)}
                      onEdit={(p) => setSelectedPostForEdit(p)}
                      onDelete={handleDeletePost}
                      onUserClick={handleUserClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case NavigationTab.PROFILE:
        const isViewingOwnProfile = !viewedUserId || viewedUserId === currentUser.id;
        const targetUser = isViewingOwnProfile ? currentUser : viewedUser;

        if (!targetUser) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#c29a67] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#a09a96] mt-4 font-medium">Brewing profile...</p>
            </div>
          );
        }

        // Filter brews for the target user
        const userPostsList = posts.filter(p => p.userId === targetUser.id);
        const totalBrews = userPostsList.length;
        const totalSips = userPostsList.reduce((sum, p) => sum + (p.likes || 0), 0);

        const userStats = {
          totalBrews,
          totalSips,
          totalComments: userPostsList.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
          totalShares: 0,
          sharesReceived: userPostsList.reduce((sum, p) => sum + (p.shares || 0), 0)
        };

        const earnedBadges = calculateEarnedBadges(userStats);
        const nextBadge = BADGES.find(b => !earnedBadges.some(eb => eb.id === b.id));

        const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file || !currentUser) return;

          const fileExt = file.name.split('.').pop();
          const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('brew-images')
            .upload(filePath, file);

          if (uploadError) {
            alert(`Upload failed: ${uploadError.message}`);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('brew-images')
            .getPublicUrl(filePath);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', currentUser.id);

          if (updateError) {
            alert(`Update failed: ${updateError.message}`);
          } else {
            setCurrentUser({ ...currentUser, avatar: publicUrl });
            fetchPosts(true); // Refresh posts to show new avatar
          }
        };

        return (
          <div className="flex-1 flex flex-col items-center">
            {/* Profile Header */}
            <div className="fixed top-0 z-50 flex justify-center items-center py-2 pt-[max(env(safe-area-inset-top)+8px,24px)] bg-[#0e0d0c]/98 backdrop-blur-xl border-b border-[#2c1a12] w-full max-w-[640px]">
              <div className="h-14 flex items-center">
                <img src={logo} alt="Wavegram" className="h-full object-contain" />
              </div>
            </div>

            <div className="w-full max-w-2xl px-4 pt-24 pb-32">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-[#efebe9]">{targetUser.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[#a09a96]">@{targetUser.username}</span>
                    {targetUser.verified && (
                      <span className="px-2 py-0.5 bg-[#c29a67]/10 text-[#c29a67] text-[10px] font-bold rounded-full border border-[#c29a67]/20 uppercase tracking-wider">Verified Barista</span>
                    )}
                  </div>
                </div>
                <div className="relative group">
                  <img src={targetUser.avatar} className="w-20 h-20 rounded-full border-2 border-[#c29a67]/20 object-cover" />
                  {isViewingOwnProfile && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div
                  onClick={() => setProfileView('brews')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all active:scale-95 ${profileView === 'brews'
                    ? 'bg-[#c29a67]/20 border-[#c29a67] shadow-[0_0_20px_rgba(194,154,103,0.1)]'
                    : 'bg-[#1a1817] border-[#2c1a12] hover:border-[#c29a67]/50'
                    }`}
                >
                  <div className={`text-xl font-bold ${profileView === 'brews' ? 'text-[#c29a67]' : 'text-[#efebe9]'}`}>
                    {totalBrews}
                  </div>
                  <div className="text-[10px] text-[#a09a96] uppercase font-bold tracking-widest mt-1">Brews</div>
                </div>

                <div className="bg-[#1a1817] p-4 rounded-2xl border border-[#2c1a12] text-center opacity-50 cursor-not-allowed">
                  <div className="text-xl font-bold text-[#efebe9]">{totalSips}</div>
                  <div className="text-[10px] text-[#a09a96] uppercase font-bold tracking-widest mt-1">Sips</div>
                </div>

                <div
                  onClick={() => setProfileView('badges')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all active:scale-95 bg-gradient-to-br from-[#c29a67]/10 to-transparent ${profileView === 'badges'
                    ? 'bg-[#c29a67]/20 border-[#c29a67] shadow-[0_0_20px_rgba(194,154,103,0.1)]'
                    : 'bg-[#1a1817] border-[#2c1a12] hover:border-[#c29a67]/50'
                    }`}
                >
                  <div className="text-xl font-bold text-[#c29a67]">{earnedBadges.length}</div>
                  <div className="text-[10px] text-[#a09a96] uppercase font-bold tracking-widest mt-1">Badges</div>
                </div>
              </div>

              {profileView === 'badges' ? (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[#efebe9] font-bold mb-4 flex items-center gap-2">
                    <span>🏆 Earned Achievements</span>
                    <span className="text-xs font-normal text-[#a09a96] bg-[#2c1a12] px-2 py-1 rounded-full">{earnedBadges.length} / {BADGES.length}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BADGES.map((badge) => {
                      const isUnlocked = earnedBadges.some(b => b.id === badge.id);
                      return (
                        <div key={badge.id} className="flex justify-center w-full">
                          <div className="w-full max-w-[280px]">
                            <ArchetypeCard achievement={badge} isUnlocked={isUnlocked} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {nextBadge && (
                    <div className="mt-6 bg-[#1a1817]/40 p-4 rounded-2xl border border-[#2c1a12] flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#0e0d0c] border border-[#2c1a12] flex items-center justify-center opacity-50 text-2xl grayscale">
                        {nextBadge.emoji}
                      </div>
                      <div>
                        <p className="text-[#a09a96] text-xs uppercase font-bold tracking-widest mb-0.5">Next Goal</p>
                        <p className="text-[#efebe9] font-bold text-sm">{nextBadge.name}</p>
                        <p className="text-[#a09a96] text-xs">{nextBadge.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="border-b border-[#2c1a12] flex mb-6">
                    <button className="px-6 py-3 text-sm font-bold text-[#c29a67] border-b-2 border-[#c29a67]">
                      Your Brews
                    </button>
                    {/* Placeholder for future tabs like 'Your Sips' or 'Saved' */}
                    <button className="px-6 py-3 text-sm font-bold text-[#a09a96]/50 cursor-not-allowed">
                      Sips
                    </button>
                  </div>

                  <div className="space-y-6 w-full pb-32">
                    {userPostsList.map((post) => (
                      <PostItem
                        key={post.id}
                        post={post}
                        isOwner={post.userId === currentUser.id}
                        onLike={handleLike}
                        onComment={(p) => setSelectedPostForComment(p)}
                        onShare={(p) => setSelectedPostForShare(p)}
                        onEdit={(p) => setSelectedPostForEdit(p)}
                        onDelete={handleDeletePost}
                        onUserClick={handleUserClick}
                      />
                    ))}

                    {userPostsList.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-[#a09a96] mb-4">No brews shared yet.</p>
                        {isViewingOwnProfile && (
                          <button
                            onClick={() => setIsPostModalOpen(true)}
                            className="px-6 py-2 bg-[#c29a67] text-[#0e0d0c] font-bold rounded-xl hover:bg-[#d4aa7d] transition-colors"
                          >
                            Brew your first cup
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case NavigationTab.ACTIVITY:
        return (
          <div className="flex-1 flex flex-col items-center">
            <div className="fixed top-0 z-50 flex justify-center items-center py-2 pt-[max(env(safe-area-inset-top)+8px,24px)] bg-[#0e0d0c]/98 backdrop-blur-xl border-b border-[#2c1a12] w-full max-w-[640px]">
              <div className="h-14 flex items-center">
                <img src={logo} alt="Wavegram" className="h-full object-contain" />
              </div>
            </div>
            <div className="w-full max-w-2xl px-4 pt-24 space-y-4 pb-32">
              {activityLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-[#c29a67] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#a09a96] font-medium">Checking the office buzz...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-20 bg-[#1a1817]/30 rounded-3xl border border-[#2c1a12]/50 backdrop-blur-sm">
                  <p className="text-[#a09a96] font-medium italic">No office buzz yet. Share a brew to get the conversation started! ☕️</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.postId)}
                    className="bg-[#1a1817]/40 p-5 rounded-3xl border border-[#2c1a12]/50 backdrop-blur-sm hover:border-[#c29a67]/30 transition-all group cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex gap-4">
                      <img src={activity.actorAvatar} className="w-12 h-12 rounded-2xl border border-[#2c1a12] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[#efebe9] font-bold text-sm truncate">
                            {activity.actorName}
                            <span className="text-[#a09a96] font-medium ml-2">
                              {activity.type === 'like' ? 'sipped your brew' :
                                activity.type === 'comment' ? 'replied to you' :
                                  'shared a brew with you'}
                            </span>
                          </p>
                          <span className="text-[10px] text-[#a09a96] uppercase tracking-wider shrink-0">
                            {activity.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        {activity.type === 'comment' && (
                          <p className="text-[#efebe9]/80 text-sm mb-3 line-clamp-2 bg-[#0e0d0c]/40 p-3 rounded-xl border border-[#2c1a12]/30 italic">
                            "{activity.content}"
                          </p>
                        )}
                        <p className="text-[11px] text-[#a09a96] truncate">
                          On: <span className="text-[#c29a67]/70 italic">{activity.postContent}</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-center p-2 bg-[#2c1a12]/30 rounded-xl group-hover:bg-[#c29a67]/10 transition-colors">
                        {activity.type === 'like' ? (
                          <svg className="w-5 h-5 text-[#ff4b4b]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        ) : activity.type === 'comment' ? (
                          <svg className="w-5 h-5 text-[#c29a67]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-[#efebe9]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-500">
            <p className="text-lg">Coming soon...</p>
          </div>
        );
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  const handleMockLogin = () => {
    setSession({ user: { id: '77777777-7777-7777-7777-777777777777' } });
    setCurrentUser({
      id: '77777777-7777-7777-7777-777777777777',
      username: 'twc_training',
      name: 'TWC Training Team',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=training',
      verified: true
    });
  };

  if (!session || !currentUser) {
    return <Auth onLoginSuccess={handleMockLogin} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setTabWrapper}
      onLogout={handleLogout}
      unreadCount={unreadCount}
    >
      {renderContent()}

      {isPostModalOpen && currentUser && (
        <CreatePostModal
          user={currentUser}
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={handleNewPost}
        />
      )}

      {selectedPostForEdit && currentUser && (
        <CreatePostModal
          user={currentUser}
          initialData={{
            content: selectedPostForEdit.content,
            image: selectedPostForEdit.image
          }}
          onClose={() => setSelectedPostForEdit(null)}
          onSubmit={handleUpdatePost}
        />
      )}

      {selectedPostForComment && (
        <div className="fixed inset-0 bg-[#0e0d0c]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#1a1817] w-full max-w-xl rounded-3xl border border-[#2c1a12] flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2c1a12] flex items-center justify-between bg-[#1a1817]">
              <h2 className="text-xl font-bold tracking-tight">Reply to Brew</h2>
              <button
                onClick={() => setSelectedPostForComment(null)}
                className="p-2 hover:bg-[#2c1a12] rounded-full transition-colors text-[#a09a96] hover:text-[#efebe9]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#1a1817]">
              <div className="flex gap-4">
                <img src={selectedPostForComment.avatar} className="w-12 h-12 rounded-full border border-[#c29a67]/20" />
                <div>
                  <div className="font-bold text-[#efebe9]">@{selectedPostForComment.username}</div>
                  <div className="mt-2 text-[#efebe9]/80 leading-relaxed">{selectedPostForComment.content}</div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <img src={currentUser.avatar} className="w-12 h-12 rounded-full border border-[#c29a67]/20" />
                <textarea
                  autoFocus
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this brew..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[17px] resize-none min-h-[120px] p-0 placeholder-[#a09a96]/50 text-[#efebe9]"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#2c1a12] flex justify-end bg-[#1a1817]">
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-[#efebe9] text-[#0e0d0c] font-black px-8 py-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all shadow-lg active:scale-95"
              >
                Sip Together
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedPostForShare && (
        <ShareModal
          post={selectedPostForShare}
          currentUser={currentUser}
          onClose={() => setSelectedPostForShare(null)}
        />
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-[#0e0d0c]/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="bg-[#1a1817] w-full max-w-sm rounded-[2.5rem] border border-[#2c1a12] p-8 shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#efebe9] mb-2 tracking-tight">Closing the Lounge?</h3>
              <p className="text-[#a09a96] text-sm leading-relaxed mb-8">
                Are you sure you want to log out of your session? You'll need to sign back in to see the latest brews.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="bg-[#2c1a12]/50 text-[#efebe9] font-bold py-4 rounded-2xl hover:bg-[#2c1a12] transition-all active:scale-95 border border-white/5"
                >
                  Wait, stay
                </button>
                <button
                  onClick={confirmLogout}
                  className="bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                  Yes, logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );


};

export default App;
