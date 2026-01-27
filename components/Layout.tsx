import React from 'react';
import { Icons } from '../constants';
import { NavigationTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onLogout: () => void;
  unreadCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, unreadCount = 0 }) => {
  return (
    <div className="min-h-screen bg-[#0e0d0c] text-[#efebe9] flex flex-col md:flex-row justify-center">
      {/* Desktop Side Nav */}
      <nav className="hidden md:flex flex-col items-center py-6 w-20 fixed left-0 top-0 bottom-0 bg-[#0e0d0c] z-20 border-r border-[#2c1a12]">
        <div className="mb-10 cursor-pointer group px-4" onClick={() => setActiveTab(NavigationTab.HOME)}>
          <img
            src="/logo.png"
            alt="Wavegram"
            className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex flex-col gap-8 flex-1">
          <button onClick={() => setActiveTab(NavigationTab.HOME)} className={`${activeTab === NavigationTab.HOME ? 'text-white' : 'text-neutral-500'} hover:text-white transition-colors`}>
            <Icons.Home active={activeTab === NavigationTab.HOME} />
          </button>
          <button onClick={() => setActiveTab(NavigationTab.SEARCH)} className={`${activeTab === NavigationTab.SEARCH ? 'text-white' : 'text-neutral-500'} hover:text-white transition-colors`}>
            <Icons.Search active={activeTab === NavigationTab.SEARCH} />
          </button>
          <button onClick={() => setActiveTab(NavigationTab.POST)} className={`${activeTab === NavigationTab.POST ? 'text-white' : 'text-neutral-500'} hover:text-white transition-colors`}>
            <Icons.Post />
          </button>
          <button onClick={() => setActiveTab(NavigationTab.ACTIVITY)} className={`${activeTab === NavigationTab.ACTIVITY ? 'text-white' : 'text-neutral-500'} hover:text-white transition-colors relative`}>
            <Icons.Heart />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0e0d0c]" />
            )}
          </button>
          <button onClick={() => setActiveTab(NavigationTab.PROFILE)} className={`${activeTab === NavigationTab.PROFILE ? 'text-white' : 'text-neutral-500'} hover:text-white transition-colors`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </button>
        </div>

        <button
          onClick={onLogout}
          className="mt-auto mb-6 p-3 text-neutral-500 hover:text-red-400 transition-colors transform hover:scale-110"
          title="Sign Out"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-[640px] border-x border-[#2c1a12] pb-20 md:pb-0 min-h-screen bg-[#0e0d0c]">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0e0d0c]/95 backdrop-blur-md border-t border-[#2c1a12] h-16 flex justify-around items-center z-20 px-4">
        <button onClick={() => setActiveTab(NavigationTab.HOME)} className={`${activeTab === NavigationTab.HOME ? 'text-white' : 'text-neutral-500'}`}>
          <Icons.Home active={activeTab === NavigationTab.HOME} />
        </button>
        <button onClick={() => setActiveTab(NavigationTab.SEARCH)} className={`${activeTab === NavigationTab.SEARCH ? 'text-white' : 'text-neutral-500'}`}>
          <Icons.Search active={activeTab === NavigationTab.SEARCH} />
        </button>
        <button onClick={() => setActiveTab(NavigationTab.POST)} className={`${activeTab === NavigationTab.POST ? 'text-white' : 'text-neutral-500'}`}>
          <Icons.Post />
        </button>
        <button onClick={() => setActiveTab(NavigationTab.ACTIVITY)} className={`${activeTab === NavigationTab.ACTIVITY ? 'text-white' : 'text-neutral-500'} relative`}>
          <Icons.Heart />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0e0d0c]" />
          )}
        </button>
        <button onClick={() => setActiveTab(NavigationTab.PROFILE)} className={`${activeTab === NavigationTab.PROFILE ? 'text-white' : 'text-neutral-500'}`}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </button>
        <button onClick={onLogout} className="text-neutral-500 hover:text-red-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
