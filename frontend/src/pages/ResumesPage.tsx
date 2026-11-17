import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, ArrowRight, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { Resume } from '../types';
import { api } from '../services/api';

export const ResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [targetRole, setTargetRole] = useState('AI Engineer');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const data = await api.listResumes();
      setResumes(data);
    } catch (err: any) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await api.uploadResume(file, targetRole);
      setResumes([uploaded, ...resumes]);
      navigate(`/resumes/${uploaded.id}`);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await api.deleteResume(id);
        setResumes(resumes.filter(r => r.id !== id));
      } catch (err: any) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Resumes</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and manage your resumes. We'll analyze and suggest improvements.
        </p>
      </div>

      {/* Upload Dropzone matching Reference #3 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`bg-white rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all ${
          dragOver ? 'border-niagara bg-niagara/5' : 'border-slate-300 hover:border-kimberly'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.doc"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-kimberly-dark mb-4 shadow-xs">
            {uploading ? (
              <span className="w-6 h-6 border-[3px] border-niagara border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-kimberly-dark" />
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-800">
            {uploading ? 'Analyzing resume with AI...' : 'Drag & drop your resume here'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">or</p>

          <div className="flex items-center gap-3">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-niagara"
            >
              <option value="AI Engineer">AI Engineer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Cloud / DevOps">Cloud / DevOps</option>
              <option value="Full Stack Engineer">Full Stack Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
            </select>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 bg-niagara hover:bg-[#067B80] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all"
            >
              Choose File
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            Supported formats: PDF, DOCX (Max 10MB)
          </p>
        </div>
      </div>

      {/* Uploaded Resumes List matching Reference #3 */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-700 tracking-tight">Uploaded Resumes</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-xs text-slate-500">No resumes uploaded yet. Upload your first resume above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => navigate(`/resumes/${resume.id}`)}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-kimberly/60 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-wisteria/20 text-kimberly-darker flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-niagara transition-colors">
                        {resume.filename}
                      </span>
                      {resume.is_master && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-downy/20 text-deepsea border border-downy/40">
                          Master
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span>Target: {resume.target_role}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(resume.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Analyzed Tag matching Reference #3 */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Analyzed</span>
                  </div>

                  {/* Circular Score Badge matching Reference #3 (82, 78, 75) */}
                  <div className="w-10 h-10 rounded-full border-2 border-niagara bg-niagara/5 flex items-center justify-center text-niagara font-bold text-xs shadow-xs">
                    {resume.overall_score}
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, resume.id)}
                    title="Delete resume"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="text-slate-400 group-hover:text-slate-800 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
