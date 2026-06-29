import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, FileText, Download, User, Loader2 } from 'lucide-react';
import { useActiveUser } from './UserContext';

const TYPES = ['All', 'Notes', 'Lab Manual', 'Question Paper', 'Syllabus Book'];
const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

export default function Vault() {
  const { activeUser } = useActiveUser();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Notes');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('3');
  const [file, setFile] = useState(null); // Local PDF file state

  // Fetch resources from backend
  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/academics/vault');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || res.type === selectedType;
    const matchesSemester = selectedSemester === 'All' || String(res.semester) === selectedSemester;
    return matchesSearch && matchesType && matchesSemester;
  });

  // Handle upload resource
  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!title || !subject || !file) {
      alert('Please fill out all fields and select a PDF file!');
      return;
    }
    if (!activeUser) {
      alert('Please select a student profile first!');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload the PDF file to Express backend /api/academics/upload
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('http://localhost:4000/api/academics/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload PDF file to the server');
      }

      const uploadData = await uploadRes.json();
      const uploadedFileUrl = uploadData.url;

      // 2. Submit document metadata with the uploaded file URL
      const newResource = {
        id: `doc-${Date.now()}`,
        title,
        type,
        subject,
        semester: parseInt(semester, 10),
        link: uploadedFileUrl,
        uploaderId: activeUser.id,
      };

      const res = await fetch('http://localhost:4000/api/academics/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource),
      });

      if (res.ok) {
        // Reset form
        setTitle('');
        setSubject('');
        setFile(null);
        setSemester('3');
        setType('Notes');
        setIsModalOpen(false);
        fetchResources();
      }
    } catch (err) {
      console.error('Failed to upload resource', err);
      alert(err.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-500" /> Digital Vault
          </h1>
          <p className="text-sm text-slate-400">Share or download digital syllabus records, lecture notes, and question banks.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Upload a PDF Document
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by note title, subject, or uploader name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition"
          />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
          {/* Type filters */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Resource Type</span>
            <div className="flex gap-2 overflow-x-auto py-1">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedType === t
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Semester filter */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Semester</span>
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {SEMESTERS.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                    selectedSemester === sem
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resources grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Loading digital resources from Supabase...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">No resources found</h3>
          <p className="text-xs text-slate-500 mt-1">Try tweaking your search filters or uploading new lecture notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/[0.02]"
            >
              <div className="space-y-4">
                {/* Type and Semester */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" /> {res.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded-full border border-slate-800">
                    Sem {res.semester}
                  </span>
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition duration-300">
                    {res.title}
                  </h3>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">{res.subject}</p>
                </div>
              </div>

              {/* Uploader and Download */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span className="truncate max-w-[120px]" title={res.uploaderName}>
                    {res.uploaderName}
                  </span>
                </div>
                <a
                  href={res.link ? (res.link.startsWith('http://') || res.link.startsWith('https://') ? res.link : `https://${res.link}`) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" /> Upload a PDF Document
            </h2>

            <form onSubmit={handleUploadResource} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1 to 5 Lecture Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Document Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500/50"
                  >
                    {TYPES.slice(1).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500/50"
                  >
                    {SEMESTERS.slice(1).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real File Upload Input */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Upload PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none focus:border-indigo-500/50 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}