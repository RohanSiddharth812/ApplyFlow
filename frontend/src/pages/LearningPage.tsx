import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Circle, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { LearningHubOverview } from '../types';
import { api } from '../services/api';

export const LearningPage: React.FC = () => {
  const [data, setData] = useState<LearningHubOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      const res = await api.getLearningRoadmap();
      setData(res);
    } catch (err: any) {
      console.error('Error fetching learning roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleItem = async (itemId: string) => {
    try {
      await api.toggleLearningItem(itemId);
      await fetchRoadmap();
    } catch (err: any) {
      alert('Error updating item: ' + err.message);
    }
  };

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
      <p className="text-sm font-semibold text-slate-700">Could not load learning data.</p>
      <p className="text-xs text-slate-400 mt-1">Please check your connection and try again.</p>
      <button onClick={fetchRoadmap} className="mt-4 px-4 py-2 bg-niagara text-white text-xs font-bold rounded-xl">Retry</button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Learning Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Targeted 30-day curriculum based on identified skill gaps from job descriptions and your resumes.
        </p>
      </div>

      {/* YOUR SKILL GAPS matching Section 21 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-niagara" />
            <span>Your Skill Gaps</span>
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            Calculated across 20+ active job postings
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {data.skill_gaps.map((gap) => (
            <div
              key={gap.skill}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-slate-800">{gap.skill}</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-deepsea">
                  {gap.gap_percentage}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Missing Gap</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-DAY LEARNING ROADMAPS matching Section 21 */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-slate-800">
          30-Day Curated Learning Roadmaps
        </h2>

        {data.roadmap.map((path) => (
          <div
            key={path.id}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{path.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Target Skill: {path.target_skill}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-48">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-deepsea">{path.progress_percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-niagara h-2 rounded-full transition-all duration-500"
                    style={{ width: `${path.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Weekly Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {path.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    item.is_completed
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-emerald-600 shrink-0"
                  >
                    {item.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      {item.week_title}
                    </span>
                    <h4 className={`text-xs font-bold mt-0.5 ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.topic}
                    </h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
