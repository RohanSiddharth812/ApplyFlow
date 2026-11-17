import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Determine topbar title based on route
  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Job Search Dashboard';
    if (path.startsWith('/onboarding')) return 'Profile Setup';
    if (path.startsWith('/resumes')) return 'Resume Center';
    if (path.startsWith('/jobs')) return 'Find Jobs';
    if (path.startsWith('/applications')) return 'Application Tracker';
    if (path.startsWith('/learning')) return 'Learning Hub & Skill Gaps';
    if (path.startsWith('/interviews')) return 'Mock Interview Prep';
    if (path.startsWith('/analytics')) return 'Search & Application Analytics';
    if (path.startsWith('/settings')) return 'Account Settings';
    return '';
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-full h-full">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={getTitle()}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
