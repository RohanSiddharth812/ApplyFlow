import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Plus, X, Sparkles, User, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const OnboardingPage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [newLocationInput, setNewLocationInput] = useState('');

  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 years)');
  const [jobTypes, setJobTypes] = useState<string[]>(['Full-time', 'Internship']);

  const [targetRoles, setTargetRoles] = useState<string[]>(['AI Engineer', 'Software Engineer', 'ML Engineer']);
  const [newRoleInput, setNewRoleInput] = useState('');

  const [skills, setSkills] = useState<string[]>(['Python', 'Machine Learning', 'GenAI', 'FastAPI', 'SQL', 'Git']);
  const [newSkillInput, setNewSkillInput] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
    if (profile) {
      setPhone(profile.phone || '+91 98765 43210');
      setLocation(profile.location || 'Hyderabad, India');
      setPreferredLocations(profile.preferred_locations?.length ? profile.preferred_locations : ['Hyderabad, India', 'Bengaluru, India', 'Remote']);
      setExperienceLevel(profile.experience_level || 'Fresher (0-1 years)');
      setJobTypes(profile.job_types?.length ? profile.job_types : ['Full-time', 'Internship']);
      setTargetRoles(profile.target_roles?.length ? profile.target_roles : ['AI Engineer', 'Software Engineer', 'ML Engineer']);
      setSkills(profile.skills?.length ? profile.skills : ['Python', 'Machine Learning', 'GenAI', 'FastAPI', 'SQL', 'Git']);
    }
  }, [user, profile]);

  const handleAddLocation = () => {
    if (newLocationInput.trim() && !preferredLocations.includes(newLocationInput.trim())) {
      setPreferredLocations([...preferredLocations, newLocationInput.trim()]);
      setNewLocationInput('');
    }
  };

  const handleAddRole = () => {
    if (newRoleInput.trim() && !targetRoles.includes(newRoleInput.trim())) {
      setTargetRoles([...targetRoles, newRoleInput.trim()]);
      setNewRoleInput('');
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const toggleJobType = (type: string) => {
    if (jobTypes.includes(type)) {
      setJobTypes(jobTypes.filter(t => t !== type));
    } else {
      setJobTypes([...jobTypes, type]);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.updateProfile({
        full_name: fullName,
        skills,
        phone,
        location,
        preferred_locations: preferredLocations,
        job_types: jobTypes,
        experience_level: experienceLevel,
        target_roles: targetRoles,
        bio: `Software Engineer specializing in ${targetRoles.join(', ')}.`
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Preferences' },
    { num: 3, label: 'Skills & Experience' },
    { num: 4, label: 'Review' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Wizard Stepper Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.num
                      ? 'bg-niagara text-white'
                      : step === s.num
                      ? 'bg-deepsea text-white ring-4 ring-niagara/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    step >= s.num ? 'text-slate-800 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    step > index + 1 ? 'bg-niagara' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Card Content matching Reference #2 */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {step === 4 ? 'Review your profile' : "Let's set up your profile"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 4
              ? 'Review everything before completing your ApplyFlow configuration.'
              : 'This helps us find and recommend the best matching opportunities for you.'}
          </p>
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rohan Siddharth"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Hyderabad, India"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Locations
              </label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {preferredLocations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-wisteria/20 text-kimberly-darker rounded-lg text-xs font-semibold"
                  >
                    {loc}
                    <button
                      type="button"
                      onClick={() => setPreferredLocations(preferredLocations.filter(l => l !== loc))}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocationInput}
                  onChange={(e) => setNewLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                  placeholder="e.g. Pune, India or Remote"
                  className="w-full max-w-xs px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara bg-white"
                >
                  <option value="Fresher (0-1 years)">Fresher (0-1 years)</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="Senior (5+ years)">Senior (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Job Type
                </label>
                <div className="flex items-center gap-4 mt-2">
                  {['Full-time', 'Internship', 'Part-time'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={jobTypes.includes(type)}
                        onChange={() => toggleJobType(type)}
                        className="rounded border-slate-300 text-niagara focus:ring-niagara"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Roles
              </label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {targetRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-downy/15 text-deepsea rounded-lg text-xs font-semibold"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => setTargetRoles(targetRoles.filter(r => r !== role))}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                  placeholder="e.g. GenAI Engineer"
                  className="w-full max-w-xs px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  + Add Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Skills & Experience */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Core Technical Skills
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                ApplyFlow automatically detects additional skills when you upload your resumes.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter(s => s !== skill))}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="e.g. Docker, PyTorch"
                  className="w-full max-w-xs px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  + Add Skill
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Name</span>
                <p className="text-sm font-semibold text-slate-800">{fullName}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Email</span>
                <p className="text-sm font-semibold text-slate-800">{email}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Location</span>
                <p className="text-sm font-semibold text-slate-800">{location || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Experience Level</span>
                <p className="text-sm font-semibold text-slate-800">{experienceLevel}</p>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Target Roles</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {targetRoles.map(r => (
                  <span key={r} className="px-2 py-0.5 bg-downy/15 text-deepsea text-xs font-semibold rounded-md">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Selected Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {skills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-niagara hover:bg-[#067B80] text-white rounded-xl text-xs font-bold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveProfile}
              className="px-7 py-2.5 bg-deepsea hover:bg-[#034445] text-white rounded-xl text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-downy" />
                  <span>Complete Profile</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
