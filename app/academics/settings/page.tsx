'use client';

import React, { useState, useEffect } from 'react';
import { useActiveUser } from '../UserContext';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Check, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { activeUser, setActiveUser } = useActiveUser();

  // Profile Form States
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('1');

  // Preferences Toggles (Simulated local state)
  const [emailNotify, setEmailNotify] = useState(true);
  const [uploadNotify, setUploadNotify] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('dark');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync profile state when activeUser changes
  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name);
      setBranch(activeUser.branch);
      setSemester(activeUser.currentSemester.toString());
    }
  }, [activeUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/users/${activeUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          branch,
          currentSemester: parseInt(semester, 10),
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        // Update context
        setActiveUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile settings saved successfully!' });
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Failed to save settings' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error connecting to database' });
    } finally {
      setSaving(false);
    }
  };

  if (!activeUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-500 animate-spin-slow" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure your student profile, trade preferences, and notifications.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column navigation cards */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Settings Sections</h3>
            <a href="#profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-650 text-white shadow-lg shadow-indigo-600/10">
              <User className="w-4 h-4" /> Student Profile
            </a>
            <a href="#notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-colors">
              <Bell className="w-4 h-4" /> Notifications
            </a>
            <a href="#privacy" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-colors">
              <Shield className="w-4 h-4" /> Security & Privacy
            </a>
            <a href="#display" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-colors">
              <Palette className="w-4 h-4" /> Appearance
            </a>
          </div>

          {/* Quick Info card */}
          <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl text-xs text-slate-500 leading-relaxed">
            🎓 <strong>Note:</strong> Editing your name, department, or semester updates your user record globally. All textbooks and files you list will show your updated name.
          </div>
        </div>

        {/* Right column forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Message */}
          {message && (
            <div className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-455'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Section 1: Profile */}
          <div id="profile" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-250 border-b border-slate-850 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Student Profile Settings
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-1.5">Department / Branch</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-1.5">Current Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Submit Profile */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Mock Notifications */}
          <div id="notifications" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-250 border-b border-slate-850 pb-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" /> Notifications & Alerts
            </h2>

            <div className="space-y-4 text-sm">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="font-semibold text-slate-200">Email Trade Requests</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Receive email notifications when other students request your textbooks.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotify}
                  onChange={(e) => setEmailNotify(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="font-semibold text-slate-200">Upload Status Approvals</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Receive notifications when your uploaded materials are verified.</p>
                </div>
                <input
                  type="checkbox"
                  checked={uploadNotify}
                  onChange={(e) => setUploadNotify(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="font-semibold text-slate-200">Sound Effects</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Play dynamic audio clicks when clicking buttons or submitting requests.</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Privacy */}
          <div id="privacy" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-250 border-b border-slate-850 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> Security & Privacy
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="font-semibold text-slate-200">Expose Handover Details</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Reveal your contact email to verified peers during accepted textbook handovers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Display */}
          <div id="display" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-250 border-b border-slate-850 pb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" /> Display & Theme
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-1.5">Theme Preference</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="dark">Vibrant Dark Mode (Default)</option>
                <option value="light">Classic Light Mode (Simulated)</option>
                <option value="system">Follow System Settings</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
