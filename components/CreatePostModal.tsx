import React, { useState } from 'react';
import { User } from '../types';
import { generatePostContent } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

interface CreatePostModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (content: string, image?: string) => void;
  initialData?: {
    content: string;
    image?: string;
  };
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ user, onClose, onSubmit, initialData }) => {
  const [content, setContent] = useState(initialData?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const isEditing = !!initialData;

  const handleGenerate = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    const result = await generatePostContent(aiTopic);
    setContent(result);
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrewSubmit = async () => {
    setIsUploading(true);
    let finalImageUrl = '';

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `brews/${fileName}`;

      const { data, error } = await supabase.storage
        .from('brew-images')
        .upload(filePath, imageFile);

      if (error) {
        console.error('FAILED_TO_UPLOAD_IMAGE', error);
        alert(`Failed to upload image: ${error.message}`);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('brew-images')
          .getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    onSubmit(content, finalImageUrl);
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0e0d0c]/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-[#1a1817] w-full max-w-xl rounded-[2.5rem] border border-[#2c1a12] flex flex-col max-h-[92vh] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-8">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2c1a12] flex justify-between items-center bg-[#1a1817]">
          <button
            onClick={onClose}
            className="text-[#a09a96] hover:text-[#efebe9] transition-all font-bold text-sm uppercase tracking-widest active:scale-95"
          >
            Cancel
          </button>
          <div className="flex flex-col items-center">
            <span className="font-black text-[#efebe9] text-xl tracking-tight">
              {isEditing ? 'Edit Brew' : 'New Brew'}
            </span>
            <div className="h-1 w-8 bg-[#c29a67] rounded-full mt-1 opacity-50"></div>
          </div>
          <div className="w-16"></div>
        </div>

        <div className="px-8 py-8 overflow-y-auto custom-scrollbar">
          {/* User & Input Area */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center gap-3">
              <img src={user.avatar} className="w-14 h-14 rounded-full border-2 border-[#c29a67]/30 object-cover shadow-xl" />
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#c29a67]/20 to-transparent rounded-full min-h-[40px]"></div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-[#efebe9] text-lg tracking-tight">@{user.username}</span>
                <span className="text-xs font-bold text-[#c29a67] bg-[#c29a67]/10 px-3 py-1 rounded-full border border-[#c29a67]/20 uppercase tracking-widest">
                  {isEditing ? 'Refining' : 'Drafting'}
                </span>
              </div>

              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your coffee thoughts..."
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium leading-relaxed resize-none min-h-[160px] p-0 placeholder-[#a09a96]/30 text-[#efebe9]"
              />

              {imagePreview && (
                <div className="group relative mt-6 rounded-[2rem] overflow-hidden border border-[#2c1a12] shadow-2xl bg-[#0e0d0c]">
                  <img src={imagePreview} className="w-full object-contain max-h-[320px] transition-transform duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-full hover:bg-black text-white transition-all transform hover:scale-110 shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}

              <div className="mt-8 flex items-center gap-6">
                <label className="group flex items-center gap-2 cursor-pointer text-[#a09a96] hover:text-[#c29a67] transition-all">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="p-3 bg-[#2c1a12] rounded-2xl group-hover:bg-[#c29a67]/10 transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">
                    {imagePreview ? 'Change Photo' : 'Add Photo'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* AI Section Card */}
          <div className="mt-12 group transition-all duration-300">
            <div className="bg-gradient-to-br from-[#2c1a12] to-[#1a1817] rounded-[2rem] p-8 border border-[#c29a67]/10 shadow-inner group-hover:border-[#c29a67]/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#c29a67]/10 rounded-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c29a67" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                </div>
                <h4 className="text-xs font-black text-[#c29a67] uppercase tracking-[0.2em]">Brew with Gemini assistant</h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. A review of Third Wave's latest roast"
                  className="flex-1 bg-[#0e0d0c]/50 border border-[#c29a67]/10 rounded-2xl px-5 py-4 text-sm focus:border-[#c29a67] outline-none text-[#efebe9] placeholder-[#a09a96]/20 transition-all font-medium"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiTopic}
                  className="bg-[#c29a67] text-[#0e0d0c] text-sm font-black px-8 py-4 rounded-2xl hover:bg-[#d4b48d] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_10px_20px_-5px_rgba(194,154,103,0.3)] active:scale-95 shrink-0"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#0e0d0c] border-t-transparent rounded-full animate-spin" />
                      Roasting Draft...
                    </div>
                  ) : 'Generate Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[#2c1a12] flex justify-end bg-[#1a1817]">
          <button
            onClick={handleBrewSubmit}
            disabled={!content.trim() || isUploading}
            className="group relative bg-[#efebe9] text-[#0e0d0c] font-black px-12 py-4 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all shadow-[0_20px_40px_-10px_rgba(239,235,233,0.2)] active:scale-95 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-3 border-[#0e0d0c] border-t-transparent rounded-full animate-spin" />
                <span>{isEditing ? 'Updating...' : 'Brewing...'}</span>
              </>
            ) : (
              <>
                <span>{isEditing ? 'Update Brew' : 'Brew Now'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
