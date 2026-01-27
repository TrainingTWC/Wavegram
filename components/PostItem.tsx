
import React from 'react';
import { Post, Comment } from '../types';
import { Icons } from '../constants';

interface PostItemProps {
  post: Post;
  isOwner?: boolean;
  onLike: (id: string) => void;
  onComment: (post: Post) => void;
  onShare: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, isOwner, onLike, onComment, onShare, onEdit, onDelete }) => {
  const [showComments, setShowComments] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="border-b border-[#2c1a12] p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex gap-4">
        {/* Left column: Avatar and thread line */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={post.avatar}
            alt={post.username}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#c29a67]/20 shadow-lg"
          />
          {post.comments.length > 0 && (
            <div className="w-[2px] grow bg-[#2c1a12] rounded-full my-1"></div>
          )}
          {post.comments.length > 0 && (
            <div className="flex -space-x-4 mt-1">
              {post.comments.slice(0, 2).map((c, i) => (
                <img key={i} src={c.avatar} className="w-5 h-5 rounded-full border-2 border-[#0e0d0c]" />
              ))}
            </div>
          )}
        </div>

        {/* Right column: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[16px] text-[#efebe9] hover:text-[#c29a67] transition-colors cursor-pointer tracking-tight">{post.username}</span>
              <Icons.Verified />
              <span className="text-[#a09a96] text-xs font-medium uppercase tracking-wider ml-1">{post.createdAt}</span>
            </div>
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-[#a09a96] hover:text-[#c29a67] transition-colors p-1"
                >
                  <Icons.More />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1817] border border-[#2c1a12] rounded-2xl shadow-2xl overflow-hidden z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit?.(post);
                        }}
                        className="w-full px-6 py-4 text-left text-sm font-bold text-[#efebe9] hover:bg-[#c29a67]/10 hover:text-[#c29a67] transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Edit Brew
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onDelete?.(post.id);
                        }}
                        className="w-full px-6 py-4 text-left text-sm font-bold text-[#ff4b4b] hover:bg-[#ff4b4b]/10 transition-colors flex items-center gap-3 border-t border-[#2c1a12]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete Brew
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

          {post.image && (
            <div className="rounded-xl overflow-hidden border border-[#2c1a12] mb-4 bg-[#0e0d0c]">
              <img src={post.image} alt="post content" className="w-full object-contain max-h-[500px]" />
            </div>
          )}

          <div className="flex items-center gap-5 text-neutral-400 mt-1">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 transition-transform active:scale-90 ${post.isLiked ? 'text-[#ed4956]' : 'hover:text-white'}`}
            >
              <Icons.Heart active={post.isLiked} />
            </button>
            <button
              onClick={() => onComment(post)}
              className="flex items-center gap-1.5 hover:text-white"
            >
              <Icons.Comment />
            </button>
            <button
              onClick={() => onShare(post)}
              className="flex items-center gap-1.5 hover:text-white"
            >
              <Icons.Share />
            </button>
          </div>

          <div className="mt-3 text-[14px] text-neutral-500 flex items-center gap-2">
            {post.likes > 0 && <span>{post.likes} likes</span>}
            {post.likes > 0 && post.comments.length > 0 && <span>•</span>}
            {post.comments.length > 0 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:text-[#c29a67] transition-colors flex items-center gap-1 font-medium"
              >
                {post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ${showComments ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Render Comments */}
          {post.comments.length > 0 && showComments && (
            <div className="mt-6 space-y-4 border-l-2 border-[#2c1a12] ml-2 pl-6 animate-in slide-in-from-top-4 duration-300">

              {post.comments.map((comment) => (
                <div key={comment.id} className="bg-[#1a1817]/40 p-4 rounded-2xl border border-[#2c1a12]/50">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={comment.avatar} className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-xs text-[#efebe9]">@{comment.username}</span>
                    <span className="text-[10px] text-[#a09a96] uppercase tracking-wider">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm text-[#efebe9]/90 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostItem;
