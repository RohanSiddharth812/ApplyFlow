import React from 'react';
import { Menu, Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu, title }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search jobs, skills, or resumes..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara transition-all"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Mock Mode indicator badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-downy/10 text-deepsea border border-downy/30 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-niagara" />
          <span>AI Engine Active</span>
        </div>

        {/* Notifications */}
        <button
          title="Notifications"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-niagara absolute top-2 right-2 ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-kimberly text-white font-semibold flex items-center justify-center text-xs shadow-sm">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            {user?.full_name?.split(' ')[0] || 'Rohan'}
          </span>
        </div>
      </div>
    </header>
  );
};
