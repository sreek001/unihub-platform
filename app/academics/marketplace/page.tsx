'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useActiveUser } from '../UserContext';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Tag, 
  User, 
  Check, 
  Loader2, 
  X,
  AlertCircle
} from 'lucide-react';

interface Textbook {
  id: string;
  title: string;
  semester: number;
  condition: string;
  status: 'Available' | 'Pending' | 'Handed_Over';
  ownerId: string;
  owner: {
    id: string;
    name: string;
    branch: string;
  };
}

export default function MarketplacePage() {
  const { activeUser } = useActiveUser();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSem, setNewBookSem] = useState('1');
  const [newBookCondition, setNewBookCondition] = useState('Good');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch available books (status=Available)
      const url = new URL('/api/textbooks', window.location.origin);
      // We want to show both Available and Pending books on the marketplace, 
      // but exclude Handed_Over books.
      url.searchParams.set('status', 'all'); 
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        // Filter out Handed_Over books for the marketplace
        const activeBooks = data.filter((b: Textbook) => b.status !== 'Handed_Over');
        setTextbooks(activeBooks);
      } else {
        setError('Failed to fetch textbooks');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleRequestHandover = async (textbookId: string) => {
    if (!activeUser) return;
    setError(null);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textbookId,
          requesterId: activeUser.id,
        }),
      });

      if (res.ok) {
        // Refresh list
        fetchBooks();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to request textbook');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to request handover');
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !newBookTitle.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/textbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBookTitle,
          semester: parseInt(newBookSem, 10),
          condition: newBookCondition,
          ownerId: activeUser.id,
        }),
      });

      if (res.ok) {
        setNewBookTitle('');
        setNewBookSem('1');
        setNewBookCondition('Good');
        setIsModalOpen(false);
        fetchBooks();
      } else {
        setError('Failed to list textbook');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBooks = textbooks.filter((book) => {
    const matchesSem = selectedSemester === 'all' || book.semester.toString() === selectedSemester;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.owner.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSem && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Physical Textbook Marketplace</h1>
          <p className="text-slate-400 text-sm mt-1">Browse textbooks listed by other students for free in-person handovers.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          List New Book
        </button>
      </div>

      {/* Filters Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search books or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Semester Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedSemester('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              selectedSemester === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            All Semesters
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                selectedSemester === sem.toString()
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              Sem {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm">Loading textbooks...</span>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl p-16 text-center">
          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No textbooks found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            {searchQuery || selectedSemester !== 'all' 
              ? "We couldn't find any books matching your active filters. Try resetting them."
              : "No textbooks have been listed yet. Be the first to list a book!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isOwner = activeUser && book.ownerId === activeUser.id;
            
            // Condition colors
            const condColor = 
              book.condition === 'New' || book.condition === 'Like New'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : book.condition === 'Good'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

            return (
              <div 
                key={book.id}
                className="group flex flex-col bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 hover:shadow-xl hover:shadow-slate-950/20 transition-all duration-300"
              >
                {/* Book Details */}
                <div className="flex-1 space-y-4">
                  {/* Semester and Condition Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                      Semester {book.semester}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${condColor}`}>
                      {book.condition}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                  </div>

                  {/* Owner info */}
                  <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-300 truncate leading-none">{book.owner.name}</p>
                      <span className="text-[9px] text-slate-500 font-medium truncate block mt-0.5">{book.owner.branch.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-4 border-t border-slate-800/60">
                  {isOwner ? (
                    <div className="text-center py-2 text-xs font-semibold text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
                      Listed by you
                    </div>
                  ) : book.status === 'Pending' ? (
                    <div className="text-center py-2 text-xs font-semibold text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      Requested / Handover Pending
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestHandover(book.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Request Handover
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                List Textbook
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddBook} className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorithms (CLRS) 3rd Edition"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Grid (Semester & Condition) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Semester</label>
                  <select
                    value={newBookSem}
                    onChange={(e) => setNewBookSem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                  <select
                    value={newBookCondition}
                    onChange={(e) => setNewBookCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
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
                  List Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
