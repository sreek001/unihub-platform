import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Tag, User, HelpCircle, Loader2 } from 'lucide-react';
import { useActiveUser } from './UserContext';

// Centralized config file containing the active production URL
import API_BASE_URL from '../../config/api';

const CATEGORIES = [
  'All',
  'Computer Science and Engineering',
  'AI and Data Science Engineering',
  'Electrical and Electronics Engineering',
  'Electronics and Communication Engineering',
  'Electronics and Biomedical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Robotics and Automation Engineering',
  'Basic Science & Humanities'
];

export default function Marketplace() {
  const { activeUser } = useActiveUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('Computer Science and Engineering');

  // Fetch books from backend
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/academics/textbooks`);
      if (res.ok) {
        const data = await res.json();
        // Defensive handling for wrapped objects or raw array responses
        const parsedBooks = Array.isArray(data) ? data : (data.textbooks || data.books || []);
        setBooks(parsedBooks);
      }
    } catch (err) {
      console.error('Failed to fetch textbooks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // 🌟 ULTIMATE DEFENSIVE SEARCH FILTER MATRIX (Fixes the toLowerCase crash permanently)
  const filteredBooks = (Array.isArray(books) ? books : []).filter((book) => {
    if (!book) return false;

    // Convert everything to string safely and fall back to empty string if undefined/null
    const titleText = String(book.title || '').toLowerCase();
    const authorText = String(book.author || '').toLowerCase();
    const descriptionText = String(book.description || '').toLowerCase();
    const currentSearchQuery = String(searchQuery || '').toLowerCase();

    const matchesSearch =
      titleText.includes(currentSearchQuery) ||
      authorText.includes(currentSearchQuery) ||
      descriptionText.includes(currentSearchQuery);

    // Support schema structures matching both 'category' or 'subject' property bindings
    const bookCategory = book.category || book.subject || '';
    const matchesCategory = selectedCategory === 'All' || bookCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle list new book
  const handleListBook = async (e) => {
    e.preventDefault();
    if (!title || !author || !price) return;
    if (!activeUser) {
      alert('Please select a student profile in the sidebar first!');
      return;
    }

    setSubmitting(true);
    const newBook = {
      id: `book-${Date.now()}`,
      title,
      author,
      description,
      price: parseInt(price, 10) || 0,
      condition,
      category,
      ownerId: activeUser.id,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/academics/textbooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });

      if (res.ok) {
        // Reset form
        setTitle('');
        setAuthor('');
        setDescription('');
        setPrice('');
        setCondition('Good');
        setCategory('Computer Science and Engineering');
        setIsModalOpen(false);
        fetchBooks();
      }
    } catch (err) {
      console.error('Failed to list book', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle request handover
  const handleRequestHandover = async (bookId) => {
    if (!activeUser) {
      alert('Please select a student profile in the sidebar first!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/academics/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `req-${Date.now()}`,
          textbookId: bookId,
          buyerId: activeUser.id,
        }),
      });

      if (res.ok) {
        fetchBooks();
      }
    } catch (err) {
      console.error('Failed to request book', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-blue-900/[0.05]">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" /> Textbook Marketplace
          </h1>
          <p className="text-sm text-slate-500 font-medium">Buy, sell, or trade textbooks with peers on campus.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 active:scale-95 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Sell a Textbook
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 rounded-2xl">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 border border-slate-300/80 text-slate-900 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-400 outline-none transition shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${selectedCategory === cat
                  ? 'bg-blue-50/80 text-blue-900 border border-blue-200/50 shadow-sm'
                  : 'text-slate-500 hover:text-blue-700 border border-transparent'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading textbooks from cloud cluster...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-blue-900/[0.12] rounded-3xl bg-white/40">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500">No books found</h3>
          <p className="text-xs text-slate-400 mt-1">Try tweaking your search query or listing a new book.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isOwner = activeUser && book.ownerId === activeUser.id;
            const bookCategory = book.category || book.subject || 'General';
            return (
              <div
                key={book.id}
                className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/[0.03]"
              >
                <div className="space-y-4">
                  {/* Category and Condition */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wider line-clamp-1 max-w-[180px]">
                      <Tag className="w-3 h-3 flex-shrink-0" /> {bookCategory}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${book.condition === 'Like New' || book.condition === 'Good'
                          ? 'bg-teal-50 text-teal-700 border-teal-200/40'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                      {book.condition || 'Good'}
                    </span>
                  </div>

                  {/* Title and Author */}
                  <div>
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-900 transition duration-300 line-clamp-1">
                      {book.title || 'Untitled Book'}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">by {book.author || 'Unknown'}</p>
                  </div>

                  {/* Description */}
                  {book.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{book.description}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {/* Price */}
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Price</span>
                    <span className="text-lg font-bold text-blue-900">₹{book.price || 0}</span>
                  </div>

                  {/* Owner Info & Action */}
                  <div className="flex items-center gap-2">
                    {book.status === 'Available' || !book.status ? (
                      isOwner ? (
                        <span className="text-[11px] font-bold text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          Your Listing
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestHandover(book.id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 text-white rounded-xl text-xs font-bold border border-transparent shadow-sm transition-all cursor-pointer"
                        >
                          Request Handover
                        </button>
                      )
                    ) : (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${book.status === 'Requested' || book.status === 'Handed Over'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/40'
                            : book.status === 'Accepted'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/40'
                              : 'bg-teal-50 text-teal-700 border-teal-200/40'
                          }`}
                      >
                        {book.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sell Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl border border-blue-900/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" /> List a Textbook
            </h2>

            <form onSubmit={handleListBook} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-blue-900/[0.12] rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Author</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cormen"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-white border border-blue-900/[0.12] rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border border-blue-900/[0.12] rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Brief info about edition, notes, or highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 bg-white border border-blue-900/[0.12] rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-blue-900/[0.12] rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none cursor-pointer focus:border-blue-500/40"
                  >
                    {CATEGORIES.slice(1).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-white border border-blue-900/[0.12] rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none cursor-pointer focus:border-blue-500/40"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 active:scale-95 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} List Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}