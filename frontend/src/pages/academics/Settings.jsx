import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Loader2 } from 'lucide-react';
import { useActiveUser } from './UserContext';

export default function Settings() {
  const { activeUser, users, setActiveUser } = useActiveUser();
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('6');
  const [saving, setSaving] = useState(false);

  // Sync state when activeUser changes
  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name);
      setBranch(activeUser.branch);
      setSemester(String(activeUser.currentSemester));
    }
  }, [activeUser]);

  // Handle save changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!activeUser) return;
    setSaving(true);

    const updatedProfile = {
      name,
      branch,
      currentSemester: parseInt(semester, 10),
    };

    try {
      const res = await fetch(`http://localhost:4000/api/academics/students/${activeUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });

      if (res.ok) {
        const data = await res.json();
        // Update context globally
        setActiveUser({
          id: activeUser.id,
          ...data
        });
        alert('Profile settings saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save profile settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (!activeUser) {
    return (
      <div className="text-center py-20 border border-slate-800 rounded-3xl bg-slate-900/10">
        <SettingsIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-400">No active profile</h3>
        <p className="text-xs text-slate-500 mt-1">Please select a student profile first!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-500" /> Account Settings
        </h1>
        <p className="text-sm text-slate-400">Customize your student profile and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Switch Profile Dropdown (Demo Mode Switcher) */}
        {users.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-slate-200 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Switch Logged-in Account (Demo Option)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select which student account to simulate for testing book handovers and requests.
            </p>
            <select
              value={activeUser?.id || ''}
              onChange={(e) => {
                const u = users.find((x) => x.id === e.target.value);
                if (u) setActiveUser(u);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.branch})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" /> Edit Profile Details
          </h2>

          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Department / Branch</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none cursor-pointer"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Notifications Mock Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl opacity-75">
          <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" /> Notifications & Sounds
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Email Notifications</h4>
                <p className="text-[10px] text-slate-500">Receive emails for incoming exchange handovers.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Trade Sound Alerts</h4>
                <p className="text-[10px] text-slate-500">Play a sound alert when a trade request status updates.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Account Mock Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl opacity-75">
          <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" /> Privacy & Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Public Contact Details</h4>
                <p className="text-[10px] text-slate-500">Expose college email to peers when trade requests are accepted.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}