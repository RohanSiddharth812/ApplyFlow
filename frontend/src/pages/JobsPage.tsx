import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bookmark, MapPin, Briefcase, Clock, Sparkles, Filter } from 'lucide-react';
import { Job } from '../types';
import { api } from '../services/api';

const INDIA_LOCATION_SUGGESTIONS = [
  'Ahmedabad', 'Bengaluru', 'Bangalore', 'Bhubaneswar', 'Chandigarh', 'Chennai',
  'Coimbatore', 'Delhi NCR', 'Gurugram', 'Gurgaon', 'Guwahati', 'Hyderabad',
  'Indore', 'Jaipur', 'Kochi', 'Kolkata', 'Lucknow', 'Mumbai', 'Mysuru',
  'Noida', 'Pune', 'Thiruvananthapuram', 'Visakhapatnam', 'Remote',
];

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [indiaOnly, setIndiaOnly] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'internships' | 'saved'>('all');

  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.listJobs({
        query: query || undefined,
        role: selectedRole !== 'All' ? selectedRole : undefined,
        location: selectedLocation !== 'All' ? selectedLocation : undefined,
        india_only: indiaOnly,
        experience: selectedExperience !== 'All' ? selectedExperience : undefined,
        tab: activeTab,
      });
      setJobs(data);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeTab, selectedRole, selectedLocation, indiaOnly, selectedExperience]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    try {
      const res = await api.toggleSaveJob(jobId);
      setJobs(jobs.map(j => (j.id === jobId ? { ...j, is_saved: res.saved } : j)));
    } catch (err: any) {
      alert('Error updating saved job: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters Card matching Reference #5 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Top Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for jobs, companies, or keywords..."
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
          />
        </form>

        {/* Filter Dropdowns row matching Reference #5 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-niagara"
            >
              <option value="All">All Roles</option>
              <option value="AI Engineer">AI Engineer</option>
              <option value="ML">Machine Learning</option>
              <option value="Software">Software Engineer</option>
              <option value="Backend">Backend Developer</option>
              <option value="Data Science">Data Scientist</option>
              <option value="Cloud">Cloud / DevOps</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Location</label>
            <input
              list="india-location-suggestions"
              value={selectedLocation === 'All' ? '' : selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value || 'All')}
              placeholder="Any Indian city"
              aria-label="Filter jobs by location"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-niagara"
            />
            <datalist id="india-location-suggestions">
              {INDIA_LOCATION_SUGGESTIONS.map((place) => <option key={place} value={place} />)}
            </datalist>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Experience</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-niagara"
            >
              <option value="All">All Experience</option>
              <option value="Fresher">Fresher (0-1 yrs)</option>
              <option value="1-2">1-2 years</option>
              <option value="1-3">1-3 years</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchJobs}
              className="w-full py-2 bg-niagara hover:bg-[#067B80] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={indiaOnly}
            onChange={(e) => setIndiaOnly(e.target.checked)}
            className="rounded border-slate-300 text-niagara focus:ring-niagara"
          />
          India-based jobs only
          <span className="font-normal text-slate-400">(includes remote roles marked for India)</span>
        </label>
      </div>

      {/* Tabs Row matching Reference #5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 rounded-xl">
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All Jobs' },
            { key: 'recommended', label: 'Recommended' },
            { key: 'internships', label: 'Internships' },
            { key: 'saved', label: 'Saved' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-niagara text-niagara'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-semibold text-slate-400 pr-2">
          Showing {jobs.length} open opportunities
        </div>
      </div>

      {/* Job Cards List matching Reference #5 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No jobs found matching your criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the filters or searching for different keywords.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:border-kimberly/50 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Logo and Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-niagara transition-colors">
                      {job.title}
                    </h3>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {job.company}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span>{job.employment_type}</span>
                    <span>•</span>
                    <span>{job.posted_date}</span>
                    {job.salary_range && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600">{job.salary_range}</span>
                      </>
                    )}
                  </div>

                  {/* Skills tags matching Reference #5 */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.required_skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Match Badge & Buttons matching Reference #5 */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Match percentage pill e.g. 92% Match */}
                {job.match_percentage && (
                  <span className="px-3 py-1 bg-[#E0F7F6] text-deepsea font-bold text-xs rounded-full border border-[#B8ECEB] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-niagara" />
                    {job.match_percentage}% Match
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="px-4 py-2 bg-[#055B5C] hover:bg-[#034445] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  View Job
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleSave(e, job.id)}
                  title={job.is_saved ? 'Remove saved job' : 'Save job'}
                  className={`p-2 rounded-xl border transition-colors ${
                    job.is_saved
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${job.is_saved ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
