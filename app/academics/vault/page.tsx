'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useActiveUser } from '../UserContext';
import { 
  Plus, 
  Search, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink,
  User, 
  Check, 
  Loader2, 
  X,
  AlertCircle
} from 'lucide-react';

interface DigitalResource {
  id: string;
  title: string;
  semester: number;
  category: 'Notes' | 'QuestionPaper' | 'LabManual';
  url: string;
  uploaderId: string;
  uploader: {
    id: string;
    name: string;
    branch: string;
  };
}

export default function VaultPage() {
  const { activeUser } = useActiveUser();
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSem, setNewSem] = useState('1');
  const [newCategory, setNewCategory] = useState('Notes');
  const [mockFileName, setMockFileName] = useState('');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/resources', window.location.origin);
      if (selectedSemester !== 'all') {
        url.searchParams.set('semester', selectedSemester);
      }
      if (selectedCategory !== 'all') {
        url.searchParams.set('category', selectedCategory);
      }
      if (searchQuery) {
        url.searchParams.set('search', searchQuery);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      } else {
        setError('Failed to fetch digital resources');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading resources');
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, selectedCategory, searchQuery]);

  useEffect(() => {
    // Add debounce to search if needed, but since it's local development, immediate load is fine.
    fetchResources();
  }, [fetchResources]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !newTitle.trim()) return;

    setSubmitting(true);
    setError(null);

    // Formulate a mock file URL
    const fileBase = mockFileName.trim() || `${newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    const mockUrl = `/docs/${fileBase}`;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          semester: parseInt(newSem, 10),
          category: newCategory,
          url: mockUrl,
          uploaderId: activeUser.id,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewSem('1');
        setNewCategory('Notes');
        setMockFileName('');
        setIsModalOpen(false);
        fetchResources();
      } else {
        setError('Failed to upload resource details');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { label: 'All Resources', value: 'all' },
    { label: 'Lecture Notes', value: 'Notes' },
    { label: 'Question Papers', value: 'QuestionPaper' },
    { label: 'Lab Manuals', value: 'LabManual' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Digital vault</h1>
          <p className="text-slate-400 text-sm mt-1">Browse, view and download lecture notes, previous question papers, and lab files.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Filters Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 lg:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Semester Select Filter */}
        <div className="flex items-center gap-2 lg:justify-end">
          <label className="text-xs text-slate-400 font-medium shrink-0">Filter Semester:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer w-32"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vault Resource Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm">Searching vaults...</span>
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl p-16 text-center">
          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No resources found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            {searchQuery || selectedSemester !== 'all' || selectedCategory !== 'all'
              ? "No digital assets match your filter criteria. Try resetting filters."
              : "The digital vault is currently empty. Be the first to share notes!"}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Document Title</th>
                  <th className="py-4 px-4 text-center">Semester</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Shared By</th>
                  <th className="py-4 px-6 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
                {resources.map((res) => {
                  // Category color badges
                  const catBadges = {
                    Notes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                    QuestionPaper: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                    LabManual: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
                  };

                  return (
                    <tr 
                      key={res.id} 
                      className="hover:bg-slate-800/30 transition-all duration-200 group"
                    >
                      {/* Title */}
                      <td className="py-4.5 px-6 font-semibold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-xs md:max-w-md">{res.title}</span>
                      </td>

                      {/* Semester */}
                      <td className="py-4.5 px-4 text-center">
                        <span className="text-xs font-semibold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                          S{res.semester}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4.5 px-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${catBadges[res.category] || ''}`}>
                          {res.category === 'QuestionPaper' ? 'Exam Paper' : res.category === 'LabManual' ? 'Lab Manual' : 'Lecture Notes'}
                        </span>
                      </td>

                      {/* Shared By */}
                      <td className="py-4.5 px-4 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs">{res.uploader.name}</span>
                        </div>
                      </td>

                      {/* Download Action */}
                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={() => alert(`Starting download for ${res.title}.\nPath: ${res.url}`)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-indigo-600 hover:border-indigo-500 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="View/Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Upload Academic Material
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpload} className="space-y-4 mt-4">
              {/* Document Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compiler Design Syllabus Unit 1 Notes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Grid (Semester & Category) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Semester</label>
                  <select
                    value={newSem}
                    onChange={(e) => setNewSem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="Notes">Lecture Notes</option>
                    <option value="QuestionPaper">Question Paper</option>
                    <option value="LabManual">Lab Manual</option>
                  </select>
                </div>
              </div>

              {/* Mock File Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">File Name (Mock Upload)</label>
                <input
                  type="text"
                  placeholder="e.g. ml-lecture-notes.pdf"
                  value={mockFileName}
                  onChange={(e) => setMockFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <span className="text-[10px] text-slate-500 block mt-1">This mocks actual storage. Files will be simulated locally.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
