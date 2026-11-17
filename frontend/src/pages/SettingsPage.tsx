import React, { useState } from 'react';
import { Settings, Shield, Sparkles, Database, Check, Server, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Rohan Siddharth');
  const [location, setLocation] = useState(profile?.location || 'Hyderabad, India');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await api.updateProfile({
        full_name: fullName,
        location: location
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account, AI engine preferences, and integrations.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-niagara" />
          <span>User Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-niagara"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              disabled
              value={user?.email || 'rohan@example.com'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-niagara"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-deepsea hover:bg-[#034445] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
          >
            {saved ? <Check className="w-4 h-4 text-downy" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved!' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* AI Engine & Provider Settings */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-niagara" />
          <span>AI Engine Configuration</span>
        </h3>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-800 block">Configured on the server</span>
          <p className="text-[11px] text-slate-500 mt-1">
            AI mode and provider credentials are controlled by the backend environment. Set USE_MOCK_AI, AI_API_KEY, and AI_MODEL in backend/.env; secret keys are never stored in this browser.
          </p>
        </div>
      </div>

      {/* System Status & Adapters */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Server className="w-4 h-4 text-kimberly" />
          <span>Integrations & Storage</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Job listings</span>
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">Demo feed</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Document Storage</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Local Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
