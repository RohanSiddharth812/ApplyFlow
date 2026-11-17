import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, Send, Sparkles, CheckCircle2, AlertCircle,
  MapPin, Clock, Briefcase, ExternalLink, FileText, Info
} from 'lucide-react';
import { JobDetail } from '../types';
import { api } from '../services/api';
import { CircularProgress } from '../components/ui/CircularProgress';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'match' | 'company' | 'similar'>('overview');

  useEffect(() => {
    if (id) {
      fetchJobDetail(id);
    }
  }, [id]);

  const fetchJobDetail = async (jobId: string) => {
    try {
      const data = await api.getJob(jobId);
      setJob(data);
      if (data.match_analysis) {
        setActiveTab('match');
      }
    } catch (err: any) {
      console.error('Error fetching job detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      const res = await api.toggleSaveJob(job.id);
      setJob({ ...job, is_saved: res.saved });
    } catch (err: any) {
      alert('Error saving job: ' + err.message);
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

  if (!job) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
        <p className="text-sm text-slate-500">Job position not found.</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-niagara text-white rounded-xl text-xs font-bold"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const match = job.match_analysis;

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Action Buttons matching Reference #6 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to results</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleSave}
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
              job.is_saved
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${job.is_saved ? 'fill-amber-500' : ''}`} />
            <span>{job.is_saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/applications/new/${job.id}`)}
            className="px-5 py-2 bg-deepsea hover:bg-[#034445] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-downy" />
            <span>Prepare Application</span>
          </button>
        </div>
      </div>

      {/* Main Job Header Card matching Reference #6 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 shrink-0">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Briefcase className="w-6 h-6 text-kimberly" />
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{job.company}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {job.employment_type}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {job.posted_date}
              </span>
              {job.salary_range && (
                <>
                  <span>•</span>
                  <span className="font-bold text-emerald-600">{job.salary_range}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs matching Reference #6 */}
        <div className="flex border-b border-slate-200 mt-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'match', label: 'Match Analysis' },
            { key: 'company', label: 'Company' },
            { key: 'similar', label: 'Similar Jobs' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-niagara text-niagara'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: MATCH ANALYSIS matching Reference #6 */}
      {activeTab === 'match' && match && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          {/* Circular 92% Gauge + Match Breakdown matching Reference #6 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 92% Circle */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-100">
              <CircularProgress
                score={match.overall_match}
                maxScore={100}
                size={160}
                strokeWidth={12}
                label="Match Score"
                subtext="Strong match! You meet most of the requirements."
                color="#08979D"
              />
            </div>

            {/* Right Match columns: Why You Match & Missing / Improve */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 pl-0 lg:pl-4">
              {/* Why You Match */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Why You Match</span>
                </h4>
                <div className="space-y-2">
                  {match.why_match.map((skill) => (
                    <div key={skill} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing / Improve */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Missing / Improve</span>
                </h4>
                <div className="space-y-2">
                  {match.missing_skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Experience Gap Banner matching Reference #6 */}
          {match.experience_gap && (
            <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-sky-900 block">Experience Gap</span>
                <p className="text-xs text-sky-800 mt-0.5 leading-relaxed">
                  {match.experience_gap}
                </p>
              </div>
            </div>
          )}

          {/* Recommended Resume Card matching Section 11 */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-kimberly">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Recommended Resume for this Job</span>
                <span className="text-xs font-bold text-slate-800">
                  {match.recommended_resume_name || 'Rohan_Resume_AI.pdf'}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-downy/15 text-deepsea font-bold text-xs rounded-full border border-downy/30">
              Match: {match.overall_match}%
            </span>
          </div>
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Job Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Required Core Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map((s) => (
                <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Multi-Source Deduplication section matching Section 13 */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-2">
              Sources ({job.sources_count} found, 1 unique canonical job)
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <span>{src.source_name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: COMPANY */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">About {job.company}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {job.company} is a leading global technology company specializing in artificial intelligence, software infrastructure, and innovative consumer applications.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-sm pt-4">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Headquarters</span>
              <span className="text-xs font-semibold text-slate-800">Global Offices</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Careers Portal</span>
              <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-niagara hover:underline">
                Official Site &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SIMILAR JOBS */}
      {activeTab === 'similar' && (
        <div className="space-y-3">
          {job.similar_jobs.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/jobs/${s.id}`)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-800">{s.title}</h4>
                <p className="text-[11px] text-slate-500">{s.company} • {s.location}</p>
              </div>
              <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
