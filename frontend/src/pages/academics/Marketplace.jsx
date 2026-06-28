import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Tag, User, HelpCircle, Loader2 } from 'lucide-react';
import { useActiveUser } from './UserContext';

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
      const res = await fetch('http://localhost:4000/api/academics/textbooks');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
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

  // Filtered books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
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
      price: parseInt(price, 10),
      condition,
      category,
      ownerId: activeUser.id,
    };

    try {
      const res = await fetch('http://localhost:4000/api/academics/textbooks', {
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
      const res = await fetch('http://localhost:4000/api/academics/handover', {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-500" /> Textbook Marketplace
          </h1>
          <p className="text-sm text-slate-400">Buy, sell, or trade textbooks with peers on campus.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Sell a Textbook
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, author, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Loading textbooks from Supabase...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
          <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">No books found</h3>
          <p className="text-xs text-slate-500 mt-1">Try tweaking your search query or listing a new book.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isOwner = activeUser && book.ownerId === activeUser.id;
            return (
              <div
                key={book.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/[0.02]"
              >
                <div className="space-y-4">
                  {/* Category and Condition */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      <Tag className="w-3 h-3" /> {book.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        book.condition === 'Like New'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : book.condition === 'Good'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : book.condition === 'Fair'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {book.condition}
                    </span>
                  </div>

                  {/* Title and Author */}
                  <div>
                    <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition duration-300">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">by {book.author}</p>
                  </div>

                  {/* Description */}
                  {book.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{book.description}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  {/* Price */}
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Price</span>
                    <span className="text-lg font-black text-indigo-400">₹{book.price}</span>
                  </div>

                  {/* Owner Info & Action */}
                  <div className="flex items-center gap-2">
                    {book.status === 'Available' ? (
                      isOwner ? (
                        <span className="text-[11px] font-semibold text-slate-500 italic bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800">
                          Your Listing
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestHandover(book.id)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
                        >
                          Request Handover
                        </button>
                      )
                    ) : (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                          book.status === 'Requested'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : book.status === 'Accepted'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" /> List a Textbook
            </h2>

            <form onSubmit={handleListBook} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Author</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cormen"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Brief info about edition, notes, or highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500/50"
                  >
                    {CATEGORIES.slice(1).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500/50"
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
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
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