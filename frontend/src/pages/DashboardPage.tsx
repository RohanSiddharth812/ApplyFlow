import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Users, TrendingUp, ShieldCheck, Sparkles, MapPin, Briefcase,
  ArrowRight, FileText, Bookmark
} from 'lucide-react';
import { Job, Resume } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsData, resumesData] = await Promise.all([
          api.listJobs({ tab: 'recommended' }),
          api.listResumes(),
        ]);
        setRecommendedJobs(jobsData.slice(0, 4));
        setResumes(resumesData);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Applications', value: '24', icon: Send, color: 'text-niagara', bg: 'bg-niagara/10' },
    { label: 'Interviews', value: '4', icon: Users, color: 'text-kimberly', bg: 'bg-kimberly/10' },
    { label: 'Response Rate', value: '18%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Profile Strength', value: '82%', icon: ShieldCheck, color: 'text-deepsea', bg: 'bg-downy/20' },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Greeting matching Section 6 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          {getGreeting()}, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your job search progress and personalized recommendations.
        </p>
      </div>

      {/* KPI Stats Cards matching Section 6 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  {st.label}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 block">
                  {st.value}
                </span>
              </div>
              <div className={`w-11 h-11 rounded-xl ${st.bg} ${st.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* RECOMMENDED FOR YOU section matching Section 6 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-niagara" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Recommended For You
            </h2>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="text-xs font-bold text-niagara hover:underline flex items-center gap-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : recommendedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No recommendations yet.</p>
            <p className="text-xs text-slate-400 mt-1">Upload a resume and complete your profile to get personalized job recommendations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-kimberly/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
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
                          <Briefcase className="w-5 h-5 text-kimberly" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-niagara transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600">{job.company}</p>
                      </div>
                    </div>

                    {job.match_percentage && (
                      <span className="px-2.5 py-1 bg-[#E0F7F6] text-deepsea font-bold text-xs rounded-full border border-[#BCEFEB] shrink-0">
                        {job.match_percentage}% Match
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span>{job.employment_type}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(job.required_skills || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    {job.posted_date}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job.id}`);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Job
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/applications/new/${job.id}`);
                      }}
                      className="px-3.5 py-1.5 bg-deepsea hover:bg-[#034445] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                    >
                      Apply / Prepare
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Resume Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-wisteria/20 text-kimberly-darker flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {resumes.length} Active Resumes Configured
            </h3>
            <p className="text-xs text-slate-500">
              Your primary resume has an ATS Compatibility score of 85/100.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/resumes')}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl self-start sm:self-center"
        >
          Manage Resumes &rarr;
        </button>
      </div>
    </div>
  );
};
