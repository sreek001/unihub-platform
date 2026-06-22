'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useActiveUser } from '../UserContext';
import {
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Inbox,
  Send,
  Loader2,
  Trash2
} from 'lucide-react';

interface Textbook {
  id: string;
  title: string;
  semester: number;
  condition: string;
  status: 'Available' | 'Pending' | 'Handed_Over';
}

interface HandoverRequest {
  id: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected';
  textbook: {
    id: string;
    title: string;
    condition: string;
    semester: number;
    owner: {
      name: string;
      branch: string;
    };
  };
  requester: {
    id: string;
    name: string;
    branch: string;
  };
}

interface DigitalResource {
  id: string;
  title: string;
  semester: number;
  category: string;
}

export default function InventoryPage() {
  const { activeUser } = useActiveUser();
  const [books, setBooks] = useState<Textbook[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<HandoverRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<HandoverRequest[]>([]);
  const [uploads, setUploads] = useState<DigitalResource[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'books' | 'requests' | 'uploads'>('books');

  const fetchInventory = useCallback(async () => {
    if (!activeUser) return;
    setLoading(true);
    try {
      // 1. Fetch user's listed textbooks
      const booksRes = await fetch(`/api/textbooks?status=all`);
      if (booksRes.ok) {
        const data = await booksRes.json();
        // Filter those owned by current user
        setBooks(data.filter((b: any) => b.ownerId === activeUser.id));
      }

      // 2. Fetch incoming requests
      const incomingRes = await fetch(`/api/requests?ownerId=${activeUser.id}`);
      if (incomingRes.ok) {
        setIncomingRequests(await incomingRes.json());
      }

      // 3. Fetch outgoing requests
      const outgoingRes = await fetch(`/api/requests?requesterId=${activeUser.id}`);
      if (outgoingRes.ok) {
        setOutgoingRequests(await outgoingRes.json());
      }

      // 4. Fetch uploads
      const uploadsRes = await fetch(`/api/resources?uploaderId=${activeUser.id}`);
      if (uploadsRes.ok) {
        setUploads(await uploadsRes.json());
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [activeUser]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdateRequestStatus = async (requestId: string, status: 'Accepted' | 'Completed' | 'Rejected') => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchInventory();
      } else {
        alert('Failed to update request status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            <HelpCircle className="w-3 h-3" /> {status}
          </span>
        );
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
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">My Inventory & Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Manage books you have listed, track handovers, and review your digital vault uploads.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-4 text-sm font-semibold cursor-pointer relative transition-all ${
            activeTab === 'books' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Textbooks ({books.length})
          {activeTab === 'books' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-4 text-sm font-semibold cursor-pointer relative transition-all ${
            activeTab === 'requests' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Handover Requests ({incomingRequests.length + outgoingRequests.length})
          {activeTab === 'requests' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          className={`pb-4 text-sm font-semibold cursor-pointer relative transition-all ${
            activeTab === 'uploads' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Uploads ({uploads.length})
          {activeTab === 'uploads' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm">Fetching inventory data...</span>
        </div>
      ) : (
        <>
          {/* Tab 1: Listed Books */}
          {activeTab === 'books' && (
            <div className="space-y-4">
              {books.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl p-16 text-center bg-slate-900/10">
                  <BookOpen className="w-10 h-10 text-slate-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-300">No books listed</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">You haven't listed any textbooks yet. Head over to the Marketplace tab to list one.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {books.map((book) => {
                    const statusStyles = {
                      Available: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                      Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                      Handed_Over: 'bg-slate-850 text-slate-500 border border-slate-800',
                    };

                    // Check if there are active incoming requests for this book
                    const bookRequests = incomingRequests.filter((r) => r.textbook.id === book.id);

                    return (
                      <div 
                        key={book.id}
                        className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4"
                      >
                        {/* Book Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-wider bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                              Sem {book.semester}
                            </span>
                            <h3 className="font-bold text-slate-200 mt-2 leading-snug">{book.title}</h3>
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0 ${statusStyles[book.status]}`}>
                            {book.status === 'Handed_Over' ? 'Handed Over' : book.status}
                          </span>
                        </div>

                        {/* Incoming Requests Panel inside Book Card */}
                        {bookRequests.length > 0 && (
                          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60 space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                              <Inbox className="w-3.5 h-3.5 text-indigo-400" /> Handover Requests ({bookRequests.length})
                            </span>
                            <div className="divide-y divide-slate-900">
                              {bookRequests.map((req) => (
                                <div key={req.id} className="py-2.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                                  <div>
                                    <p className="font-semibold text-slate-350">{req.requester.name}</p>
                                    <span className="text-[10px] text-slate-500">{req.requester.branch.split(' ')[0]}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {req.status === 'Pending' ? (
                                      <>
                                        <button
                                          onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')}
                                          className="bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 font-bold px-2 py-1 rounded transition cursor-pointer"
                                        >
                                          Decline
                                        </button>
                                        <button
                                          onClick={() => handleUpdateRequestStatus(req.id, 'Accepted')}
                                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1 rounded transition cursor-pointer"
                                        >
                                          Accept
                                        </button>
                                      </>
                                    ) : req.status === 'Accepted' ? (
                                      <button
                                        onClick={() => handleUpdateRequestStatus(req.id, 'Completed')}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                                      >
                                        Confirm Handover
                                      </button>
                                    ) : (
                                      getStatusBadge(req.status)
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Requests */}
          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Incoming Requests Column */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-300 flex items-center gap-2 border-b border-slate-850 pb-2">
                  <Inbox className="w-4 h-4 text-indigo-400" /> Incoming Requests (For Your Books)
                </h2>
                {incomingRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl">
                    No incoming requests.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Book Requested</h4>
                            <p className="text-sm font-bold text-slate-200 mt-0.5">{req.textbook.title}</p>
                          </div>
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-850/50 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">Requested By:</span>
                            <p className="font-semibold text-slate-300 mt-0.5">{req.requester.name} ({req.requester.branch.split(' ')[0]})</p>
                          </div>
                          {req.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')}
                                className="bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 text-rose-455 font-bold px-3 py-1.5 rounded-lg transition text-xs cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'Accepted')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition text-xs cursor-pointer"
                              >
                                Accept Request
                              </button>
                            </div>
                          )}
                          {req.status === 'Accepted' && (
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'Completed')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                            >
                              Confirm Handover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests Column */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-300 flex items-center gap-2 border-b border-slate-850 pb-2">
                  <Send className="w-4 h-4 text-indigo-400" /> Outgoing Requests (Your Wants)
                </h2>
                {outgoingRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl">
                    You haven't requested any books.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outgoingRequests.map((req) => (
                      <div key={req.id} className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Book Requested</h4>
                            <p className="text-sm font-bold text-slate-200 mt-0.5">{req.textbook.title}</p>
                          </div>
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="pt-3 border-t border-slate-850/50 text-xs">
                          <span className="text-slate-500 font-medium">Book Owner:</span>
                          <p className="font-semibold text-slate-300 mt-0.5">{req.textbook.owner.name} ({req.textbook.owner.branch.split(' ')[0]})</p>
                          {req.status === 'Accepted' && (
                            <div className="mt-2.5 p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[11px] leading-relaxed">
                              💡 Request accepted! Contact <strong>{req.textbook.owner.name}</strong> to collect the book. They will mark the transaction as complete.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Digital Uploads */}
          {activeTab === 'uploads' && (
            <div className="space-y-4">
              {uploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl p-16 text-center bg-slate-900/10">
                  <FileText className="w-10 h-10 text-slate-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-300">No resources uploaded</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">You haven't uploaded any documents yet. Head to the Digital Vault to share lecture files.</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                        <th className="py-4 px-6">Document Title</th>
                        <th className="py-4 px-4 text-center">Semester</th>
                        <th className="py-4 px-4">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
                      {uploads.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="py-4 px-6 font-semibold flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span>{res.title}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-xs font-semibold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                              Semester {res.semester}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs text-slate-400">
                              {res.category === 'QuestionPaper' ? 'Exam Paper' : res.category === 'LabManual' ? 'Lab Manual' : 'Lecture Notes'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
