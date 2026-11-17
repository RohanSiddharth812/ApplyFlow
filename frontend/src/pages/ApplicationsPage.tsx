import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Send, Clock, CheckCircle2, ChevronDown, MoreVertical,
  ExternalLink, FileText, Eye, Edit2
} from 'lucide-react';
import { Application } from '../types';
import { api } from '../services/api';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Applied');
  const [timeRange, setTimeRange] = useState('3months');

  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.listApplications(activeTab !== 'all' ? activeTab : undefined);
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    try {
      const updated = await api.updateApplication(selectedApp.id, newStatus);
      setApplications(applications.map(a => (a.id === selectedApp.id ? updated : a)));
      setStatusModalOpen(false);
      setSelectedApp(null);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Status counts
  const totalCount = applications.length;
  const appliedCount = applications.filter(a => a.status === 'Applied').length;
  const assessmentCount = applications.filter(a => a.status === 'Assessment').length;
  const interviewCount = applications.filter(a => a.status === 'Interview').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;
  const offerCount = applications.filter(a => a.status === 'Offer').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F7F6] text-deepsea text-xs font-bold border border-[#BCEFEB]">
            <CheckCircle2 className="w-3.5 h-3.5 text-niagara" />
            Applied
          </span>
        );
      case 'Assessment':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            Assessment
          </span>
        );
      case 'Interview':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
            Interview
          </span>
        );
      case 'Offer':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            🎉 Offer
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching Reference #9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and manage your application pipeline across top companies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-niagara"
          >
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs matching Reference #9 */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200">
        {[
          { key: 'all', label: 'All', count: totalCount },
          { key: 'applied', label: 'Applied', count: appliedCount },
          { key: 'assessment', label: 'Assessment', count: assessmentCount },
          { key: 'interview', label: 'Interview', count: interviewCount },
          { key: 'offer', label: 'Offer', count: offerCount },
          { key: 'rejected', label: 'Rejected', count: rejectedCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-deepsea text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications Table matching Reference #9 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No applications found in this tab.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-4 px-4 py-2 bg-niagara text-white text-xs font-bold rounded-xl"
            >
              Find Jobs to Apply
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Applied On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Company with logo */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
                          {app.company_logo ? (
                            <img
                              src={app.company_logo}
                              alt={app.company}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Briefcase className="w-4 h-4 text-kimberly" />
                          )}
                        </div>
                        <span className="font-bold text-slate-800">{app.company}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {app.job_title}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {new Date(app.applied_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setNewStatus(app.status);
                          setStatusModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Updating Status */}
      {statusModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Update Status: {selectedApp.company}
              </h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Application Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-niagara bg-white"
              >
                <option value="Applied">Applied</option>
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-deepsea text-white rounded-xl text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
