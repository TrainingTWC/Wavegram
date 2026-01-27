import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Post } from '../types';

interface ShareModalProps {
    post: Post;
    currentUser: User | null;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, currentUser, onClose }) => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sharingWithId, setSharingWithId] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            console.error('Error fetching employees:', error);
        } else if (data) {
            setEmployees(data.map((p: any) => ({
                id: p.id,
                username: p.username,
                name: p.full_name,
                avatar: p.avatar_url,
                verified: true
            })));
        }
        setLoading(false);
    };

    const handleShare = async (receiver: User) => {
        if (!currentUser) return;
        setSharingWithId(receiver.id);

        const { error } = await supabase
            .from('shares')
            .insert({
                post_id: post.id,
                sender_id: currentUser.id,
                receiver_id: receiver.id
            });

        if (error) {
            console.error('Error sharing brew:', error);
            alert('Failed to share brew. Please try again.');
        } else {
            alert(`Shared with ${receiver.name}!`);
            onClose();
        }
        setSharingWithId(null);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-[#0e0d0c]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1a1817] w-full max-w-md rounded-[2.5rem] border border-[#2c1a12] flex flex-col max-h-[80vh] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[#2c1a12] flex items-center justify-between">
                    <h2 className="text-xl font-black text-[#efebe9] tracking-tight">Share Brew</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#2c1a12] rounded-full text-[#a09a96] hover:text-[#efebe9] transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-[#0e0d0c]/50">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1817] border border-[#2c1a12] rounded-2xl px-5 py-3 text-sm focus:border-[#c29a67] outline-none text-[#efebe9] transition-all"
                    />
                </div>

                {/* Employee List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center py-10 gap-4">
                            <div className="w-8 h-8 border-2 border-[#c29a67] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-[#c29a67] uppercase tracking-widest">Calling the team...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="px-2 py-4 border border-[#c29a67]/20 rounded-2xl bg-[#c29a67]/5 mb-6">
                                <p className="text-xs text-center text-[#c29a67] font-bold uppercase tracking-widest">Share this brew with</p>
                            </div>
                            {filteredEmployees.map((emp) => (
                                <button
                                    key={emp.id}
                                    onClick={() => handleShare(emp)}
                                    disabled={sharingWithId === emp.id}
                                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[#2c1a12] transition-all group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <img src={emp.avatar} className="w-12 h-12 rounded-full border-2 border-[#c29a67]/10 object-cover" />
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-[#efebe9] group-hover:text-[#c29a67] transition-colors">{emp.name}</p>
                                        <p className="text-xs text-[#a09a96]">@{emp.username}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-[#2c1a12] flex items-center justify-center group-hover:bg-[#c29a67] group-hover:border-[#c29a67] transition-all">
                                        {sharingWithId === emp.id ? (
                                            <div className="w-4 h-4 border-2 border-[#efebe9] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:text-[#0e0d0c]"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        )}
                                    </div>
                                </button>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <p className="text-center py-10 text-[#a09a96] italic">No employees found matched your search.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Brew Context */}
                <div className="p-6 bg-[#0e0d0c] border-t border-[#2c1a12]">
                    <div className="flex items-center gap-3 opacity-60 grayscale scale-95">
                        <img src={post.avatar} className="w-8 h-8 rounded-full" />
                        <p className="text-xs text-[#a09a96] truncate">Brewing: {post.content.substring(0, 40)}...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
