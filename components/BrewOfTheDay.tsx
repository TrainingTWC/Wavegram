import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface BrewOfTheDayProps {
    currentUser: User | null;
}

const BrewOfTheDay: React.FC<BrewOfTheDayProps> = ({ currentUser }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchFeaturedBrew();
    }, []);

    const fetchFeaturedBrew = async () => {
        setLoading(true);
        const { data: brew, error } = await supabase
            .from('featured_brews')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Error fetching featured brew:', error);
        } else {
            setData(brew);
            setEditForm(brew);
        }
        setLoading(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setEditForm({ ...editForm, image_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsUploading(true);
        let finalImageUrl = editForm.image_url;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `featured/brew-${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('brew-images')
                .upload(fileName, imageFile);

            if (uploadError) {
                alert('Image upload failed: ' + uploadError.message);
                setIsUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('brew-images')
                .getPublicUrl(fileName);

            finalImageUrl = publicUrl;
        }

        const { error } = await supabase
            .from('featured_brews')
            .update({
                title: editForm.title,
                description: editForm.description,
                image_url: finalImageUrl,
                cta_text: editForm.cta_text,
                cta_link: editForm.cta_link,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        if (error) {
            alert('Failed to update featured brew: ' + error.message);
        } else {
            setData({ ...editForm, image_url: finalImageUrl });
            setIsEditing(false);
            setImageFile(null);
            setImagePreview('');
        }
        setIsUploading(false);
    };

    if (loading && !data) return (
        <div className="mx-6 my-8 p-12 bg-[#1a1817] rounded-[2.5rem] border border-[#2c1a12] animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-[#c29a67] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#a09a96] text-xs font-bold uppercase tracking-widest">Dialing in the espresso...</p>
        </div>
    );

    const isAdmin = currentUser?.username === 'twc_training';

    return (
        <div className="mx-6 my-8 p-8 bg-gradient-to-br from-[#1a1817] to-[#0e0d0c] rounded-[2.5rem] border border-[#c29a67]/30 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-[#c29a67]/60">
            {/* Background Accent */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c29a67]/5 rounded-full blur-3xl group-hover:bg-[#c29a67]/10 transition-colors duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-[#c29a67] animate-ping"></span>
                        <h3 className="text-[#c29a67] text-xs font-black uppercase tracking-[0.2em]">Barista's Choice</h3>
                    </div>
                    {isAdmin && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#c29a67] border border-[#c29a67]/30 rounded-xl hover:bg-[#c29a67] hover:text-[#0e0d0c] transition-all bg-[#0e0d0c]/50"
                        >
                            Edit Feature
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-[#a09a96] uppercase ml-2 tracking-widest">Image Preview</label>
                                <div className="group/edit-img relative w-full aspect-video md:aspect-square rounded-[2.5rem] overflow-hidden border border-[#c29a67]/20 shadow-2xl bg-[#0e0d0c]">
                                    <img
                                        src={imagePreview || editForm.image_url}
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover/edit-img:scale-[1.05]"
                                    />
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/edit-img:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        <div className="p-4 bg-[#c29a67] rounded-full text-[#0e0d0c] shadow-2xl mb-2 transform scale-75 group-hover/edit-img:scale-100 transition-transform flex items-center justify-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Click to Replace Image</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[#a09a96] uppercase ml-2 tracking-widest">Brew Title</label>
                                    <input
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        placeholder="e.g. La vien rose"
                                        className="w-full bg-[#0e0d0c]/50 border border-[#c29a67]/20 rounded-2xl px-6 py-4 text-[#efebe9] focus:border-[#c29a67] outline-none font-bold text-lg transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[#a09a96] uppercase ml-2 tracking-widest">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        placeholder="Describe the brew..."
                                        className="w-full bg-[#0e0d0c]/50 border border-[#c29a67]/20 rounded-2xl px-6 py-4 text-[#efebe9] focus:border-[#c29a67] outline-none h-32 font-medium leading-relaxed resize-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#a09a96] uppercase ml-2 tracking-widest">Button Text</label>
                                <input
                                    value={editForm.cta_text}
                                    onChange={e => setEditForm({ ...editForm, cta_text: e.target.value })}
                                    placeholder="Learn how to prepare it"
                                    className="w-full bg-[#0e0d0c]/50 border border-[#c29a67]/20 rounded-2xl px-5 py-4 text-[#efebe9] focus:border-[#c29a67] outline-none font-bold transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#a09a96] uppercase ml-2 tracking-widest">Action Link (PDF/Video)</label>
                                <input
                                    value={editForm.cta_link}
                                    onChange={e => setEditForm({ ...editForm, cta_link: e.target.value })}
                                    placeholder="e.g. https://..."
                                    className="w-full bg-[#0e0d0c]/50 border border-[#c29a67]/20 rounded-2xl px-5 py-4 text-[#efebe9] focus:border-[#c29a67] outline-none font-medium text-xs transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8 border-t border-[#2c1a12]">
                            <button
                                onClick={handleSave}
                                disabled={isUploading}
                                className="flex-1 bg-[#c29a67] text-[#0e0d0c] py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#efebe9] transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#0e0d0c] border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>Save Feature Update</span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setImagePreview('');
                                    setImageFile(null);
                                }}
                                disabled={isUploading}
                                className="flex-1 border border-[#2c1a12] text-[#a09a96] py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-[#efebe9] transition-all active:scale-95"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-4xl font-black text-[#efebe9] mb-8 tracking-tighter group-hover:text-white transition-colors">Barista's Signature</h2>

                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="relative group/img shrink-0 bg-[#0e0d0c] rounded-[2.5rem] overflow-hidden border border-[#c29a67]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                <img
                                    src={data?.image_url || "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=400&h=400&auto=format&fit=crop"}
                                    alt={data?.title}
                                    className="w-full md:w-44 h-44 object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-2xl font-black text-[#efebe9] tracking-tight mb-2">{data?.title}</h4>
                                <p className="text-[#a09a96] text-[16px] leading-relaxed font-medium">
                                    {data?.description}
                                </p>
                                <div className="flex gap-4 mt-6">
                                    <span className="text-[10px] font-black text-[#c29a67] border border-[#c29a67]/20 px-3 py-1.5 rounded-xl bg-[#c29a67]/5 uppercase tracking-wider">#ArtisanCraft</span>
                                    <span className="text-[10px] font-black text-[#efebe9]/40 border border-[#efebe9]/10 px-3 py-1.5 rounded-xl uppercase tracking-wider">#BaristaGold</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (data?.cta_link && data.cta_link !== '#') {
                                    const url = data.cta_link.startsWith('http') ? data.cta_link : `https://${data.cta_link}`;
                                    window.open(url, '_blank');
                                }
                            }}
                            className="w-full mt-10 py-5 bg-[#efebe9] text-[#0e0d0c] font-black rounded-2xl hover:bg-white transition-all transform hover:-translate-y-1 active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(239,235,233,0.3)] flex items-center justify-center gap-3 group/btn"
                        >
                            <span>{data?.cta_text || 'Learn how to prepare it'}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BrewOfTheDay;
