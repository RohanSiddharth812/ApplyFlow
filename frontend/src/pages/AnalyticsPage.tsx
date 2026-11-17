import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Send, Target, Award, PieChart } from 'lucide-react';
import { AnalyticsOverview } from '../types';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!data) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
      <p className="text-sm font-semibold text-slate-700">Could not load analytics data.</p>
      <p className="text-xs text-slate-400 mt-1">Please check your connection and try again.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Job Search Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Factual metrics and pipeline conversion data across your applications.
        </p>
      </div>

      {/* KPI Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Applications</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.total_applications}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Response Rate</span>
          <p className="text-2xl font-bold text-niagara mt-1">{data.response_rate}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Interview Rate</span>
          <p className="text-2xl font-bold text-kimberly mt-1">{data.interview_rate}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Offers</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{data.offer_count}</p>
        </div>
      </div>

      {/* Grid of Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-niagara" />
            <span>Applications Over Time (Last 4 Weeks)</span>
          </h3>
          <div className="space-y-3 pt-2">
            {data.applications_over_time.map((w) => (
              <div key={w.label}>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>{w.label}</span>
                  <span>{w.applications} applied</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-niagara h-2 rounded-full"
                    style={{ width: `${Math.min(100, w.applications * 15)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications by Role */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-kimberly" />
            <span>Applications by Role</span>
          </h3>
          <div className="space-y-3 pt-2">
            {Object.entries(data.applications_by_role).map(([role, count]) => (
              <div key={role}>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>{role}</span>
                  <span>{count} jobs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-kimberly h-2 rounded-full"
                    style={{ width: `${Math.min(100, count * 20)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Requested Skills vs Common Missing Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Most Requested Skills in Postings</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {data.most_requested_skills.map((s) => (
              <span
                key={s.name}
                className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <span>{s.name}</span>
                <span className="bg-emerald-200/60 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full">
                  {s.count}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Common Missing Skills to Acquire</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {data.common_missing_skills.map((s) => (
              <span
                key={s.name}
                className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <span>{s.name}</span>
                <span className="bg-amber-200/60 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full">
                  gap
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
