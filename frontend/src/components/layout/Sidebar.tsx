import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Briefcase,
  Send,
  GraduationCap,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile Setup', path: '/onboarding', icon: UserCheck },
    { name: 'My Resumes', path: '/resumes', icon: FileText },
    { name: 'Find Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Applications', path: '/applications', icon: Send },
    { name: 'Learning Hub', path: '/learning', icon: GraduationCap },
    { name: 'Mock Interviews', path: '/interviews', icon: Sparkles },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-[#544669] text-white flex flex-col h-full border-r border-[#433754] select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-niagara to-downy flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">ApplyFlow</span>
            <span className="text-[10px] text-white/60 tracking-wider uppercase font-semibold">AI Assistant</span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-white/15 text-white shadow-sm font-semibold border-l-4 border-downy pl-2.5'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4 text-downy shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/10 bg-[#4A3E5D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-wisteria to-kimberly flex items-center justify-center text-white font-bold text-sm shrink-0 border border-white/20">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Rohan Siddharth'}
              </p>
              <p className="text-[11px] text-white/60 truncate">
                {user?.email || 'rohan@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-white/60 hover:text-rose-300 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
