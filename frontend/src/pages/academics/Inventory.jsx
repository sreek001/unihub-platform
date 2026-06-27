import React, { useState, useEffect } from 'react';
import { FolderHeart, BookOpen, Inbox, Check, CheckCircle2, Clock, Trash2, Mail, Loader2 } from 'lucide-react';
import { useActiveUser } from './UserContext';

export default function Inventory() {
  const { activeUser } = useActiveUser();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'requests'
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  // Fetch student's books and requests
  const loadInventoryData = async () => {
    if (!activeUser) return;
    setLoading(true);
    try {
      // 1. Fetch all textbooks
      const booksRes = await fetch('http://localhost:4000/api/academics/textbooks');
      if (booksRes.ok) {
        const allBooks = await booksRes.json();
        // Filter books owned by this user
        setBooks(allBooks.filter((b) => b.ownerId === activeUser.id));
      }

      // 2. Fetch handover requests for this user
      const reqRes = await fetch(`http://localhost:4000/api/academics/handover?studentId=${activeUser.id}`);
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [activeUser]);

  // Handle delete book listing
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  // Handle update request status (Accept / Complete)
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/academics/handover/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadInventoryData();
      }
    } catch (err) {
      console.error('Failed to update request status', err);
    }
  };

  if (!activeUser) {
    return (
      <div className="text-center py-20 border border-slate-800 rounded-3xl bg-slate-900/10">
        <FolderHeart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-400">No active profile</h3>
        <p className="text-xs text-slate-500 mt-1">Please select a simulated student profile at the bottom of the sidebar first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderHeart className="w-6 h-6 text-indigo-500" /> My Inventory
        </h1>
        <p className="text-sm text-slate-400">Manage your active textbook listings and track handover requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'listings'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Listings ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'requests'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Handover Requests ({requests.incoming.length + requests.outgoing.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Loading your inventory...</p>
        </div>
      ) : activeTab === 'listings' ? (
        /* LISTINGS TAB */
        books.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No active listings</h3>
            <p className="text-xs text-slate-500 mt-1">List drawing notebooks or syllabus books in the Marketplace to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-lg">
                      {book.type || 'Textbook'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        book.status === 'Available'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : book.status === 'Requested'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : book.status === 'Accepted'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-750'
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{book.title}</h3>
                    <p className="text-xs text-slate-400">by {book.author}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Price</span>
                    <span className="text-sm font-black text-indigo-400">
                      {book.price === 0 ? 'FREE' : `₹${book.price}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="p-2 bg-slate-800/60 hover:bg-rose-500/15 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* REQUESTS TAB */
        <div className="space-y-8">
          {/* Incoming Requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Incoming Requests (For your items)</h3>
            {requests.incoming.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                No incoming requests yet. When students ask for your listed books, they will show up here.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.incoming.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{req.textbookTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Requested by: <span className="text-slate-300 font-semibold">{req.buyerName}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Accept Request
                        </button>
                      ) : req.status === 'Accepted' ? (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Completed')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm Handover
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Outgoing Requests (Your requests)</h3>
            {requests.outgoing.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                You have not requested any books yet.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.outgoing.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{req.textbookTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Owner: <span className="text-slate-300 font-semibold">{req.ownerName}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                      {req.status === 'Pending' ? (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Approval
                        </span>
                      ) : req.status === 'Accepted' ? (
                        <div className="flex flex-col items-end gap-1 text-right bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-3 py-1 rounded-xl flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Request Accepted
                          </span>
                          <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                            <p className="font-semibold text-slate-200">Owner Contact Info:</p>
                            <p>📧 Email: <span className="text-indigo-400">{req.ownerEmail}</span></p>
                            <p>📞 Phone: <span className="text-indigo-400">{req.ownerPhone}</span></p>
                            <p className="text-[10px] text-slate-500 italic mt-1.5">
                              {req.textbookPrice === 0 
                                ? 'Meet the owner on campus to collect your free item!'
                                : `Meet the owner on campus to pay ₹${req.textbookPrice} in person.`
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Received
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}