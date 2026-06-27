'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useActiveUser } from '../UserContext';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Loader2, 
  X, 
  Check, 
  AlertCircle,
  Camera,
  Archive
} from 'lucide-react';

interface LostFoundPost {
  id: string;
  category: 'Lost' | 'Found';
  itemName: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  contactInfo?: string;
  image?: string;
  status: 'Available' | 'Claim pending' | 'Claimed' | 'Ready for pickup';
  postedAt: string;
}

export default function LostFoundPage() {
  const { activeUser } = useActiveUser();
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<'Lost' | 'Found'>('Lost');
  const [newItemName, setNewItemName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('Library Commons');
  const [customLocation, setCustomLocation] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newContactInfo, setNewContactInfo] = useState('');
  const [newImageLink, setNewImageLink] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch posts
      const postsRes = await fetch('/api/lostfound/posts');
      let fetchedPosts: LostFoundPost[] = [];
      if (postsRes.ok) {
        const data = await postsRes.json();
        if (data.success) {
          fetchedPosts = data.posts;
        }
      }

      // 2. Fetch locations
      const locRes = await fetch('/api/lostfound/locations');
      if (locRes.ok) {
        const data = await locRes.json();
        if (data.success) {
          const names = data.locations.map((l: any) => l.name);
          setLocations(names);
          // Set default selected location in form if loaded
          if (names.length > 0 && !newLocation) {
            setNewLocation(names[0]);
          }
        }
      }

      setPosts(fetchedPosts);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to Lost & Found services.');
    } finally {
      setLoading(false);
    }
  }, [newLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pre-fill email when activeUser changes
  useEffect(() => {
    if (activeUser) {
      setNewEmail(`${activeUser.name.toLowerCase().replace(/[^a-z]+/g, '')}@campus.edu`);
    }
  }, [activeUser]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newDescription.trim() || !newEmail.trim()) return;

    setSubmitting(true);
    setError(null);

    const finalLocation = newLocation === 'Other Area' && customLocation.trim() 
      ? customLocation.trim() 
      : newLocation;

    // Use default category images if no custom image link is supplied
    let finalImage = newImageLink.trim();
    if (!finalImage) {
      finalImage = newCategory === 'Lost'
        ? 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&q=80' // key ring
        : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'; // blue backpack
    }

    try {
      const res = await fetch('/api/lostfound/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          itemName: newItemName,
          description: newDescription,
          location: finalLocation,
          contactEmail: newEmail,
          contactPhone: newPhone || undefined,
          contactInfo: newContactInfo || undefined,
          image: finalImage,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewItemName('');
        setNewDescription('');
        setNewPhone('');
        setNewContactInfo('');
        setNewImageLink('');
        setCustomLocation('');
        loadData();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to submit post.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/lostfound/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/lostfound/posts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadData();
      } else {
        alert('Failed to delete post.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || post.location === selectedLocation;
    const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Claim pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Ready for pickup':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Claimed':
        return 'bg-slate-800 text-slate-500 border border-slate-700';
      default:
        return 'bg-slate-805 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Archive className="w-6 h-6 text-indigo-500" /> Lost & Found Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">Report lost belongings, claim found items, and manage campus recovery reports.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Report Lost/Found
        </button>
      </div>

      {/* Filters Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 md:col-span-1">
          {['All', 'Lost', 'Found'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-250'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Location Filter */}
        <div className="relative md:col-span-1">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-350 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="All">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative md:col-span-1">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-350 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Claim pending">Claim pending</option>
            <option value="Ready for pickup">Ready for pickup</option>
            <option value="Claimed">Claimed</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main listings Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm">Searching belongings index...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl p-16 text-center">
          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No postings found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">No items match your active search terms or categories. Try resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isUploader = activeUser && post.contactEmail.toLowerCase().includes(activeUser.name.toLowerCase().replace(/[^a-z]+/g, ''));
            const dateStr = new Date(post.postedAt).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });

            return (
              <div 
                key={post.id}
                className="group flex flex-col bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:shadow-xl hover:shadow-slate-950/20 transition-all duration-300"
              >
                {/* Image header */}
                <div className="h-44 bg-slate-950 relative overflow-hidden">
                  {post.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={post.image} 
                      alt={post.itemName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  {/* Category Pill */}
                  <span className={`absolute top-3 left-3 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow ${
                    post.category === 'Lost'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {post.category}
                  </span>
                  
                  {/* Status Pill */}
                  <span className={`absolute top-3 right-3 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow ${getStatusBadgeColor(post.status)}`}>
                    {post.status}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors duration-300 leading-snug line-clamp-1">
                      {post.itemName}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850/60 text-xs text-slate-450">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{post.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{dateStr}</span>
                    </div>

                    {/* Contact Details box */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 mt-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-350 truncate">{post.contactEmail}</span>
                      </div>
                      {post.contactPhone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="text-slate-400">{post.contactPhone}</span>
                        </div>
                      )}
                      {post.contactInfo && (
                        <p className="text-[10px] text-slate-500 italic border-t border-slate-900 pt-1 mt-1 leading-normal">
                          {post.contactInfo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 pb-5 pt-3 flex gap-2">
                  {/* Uploader delete or claims */}
                  {post.status !== 'Claimed' && (
                    <div className="flex-1 flex gap-2">
                      {post.status === 'Available' && post.category === 'Found' && (
                        <button
                          onClick={() => handleUpdateStatus(post.id, 'Claim pending')}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer text-center"
                        >
                          Claim Belonging
                        </button>
                      )}
                      {post.status === 'Claim pending' && (
                        <button
                          onClick={() => handleUpdateStatus(post.id, 'Ready for pickup')}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition cursor-pointer text-center"
                        >
                          Accept Claim
                        </button>
                      )}
                      {post.status === 'Ready for pickup' && (
                        <button
                          onClick={() => handleUpdateStatus(post.id, 'Claimed')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer text-center"
                        >
                          Confirm Picked Up
                        </button>
                      )}
                    </div>
                  )}

                  {/* Delete button (allow any for development testing) */}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Remove Posting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Archive className="w-5 h-5 text-indigo-500" />
                Report Lost / Found Belonging
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Report Type</label>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setNewCategory('Lost')}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      newCategory === 'Lost' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('Found')}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      newCategory === 'Found' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    I Found Something
                  </button>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silver Keychain, Leather Wallet, Keys"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Item Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the item, colors, tags, brand, unique identifiers..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Location selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Belonging Location</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {locations.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                    <option value="Other Area">Other Area</option>
                  </select>
                </div>

                {/* Custom Location Input */}
                {newLocation === 'Other Area' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Specify Other Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mechanical Lab Block B"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Contact Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555 123 4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Contact Info (Meetup location, pickup desk, etc.) */}
              <div>
                <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-1.5">Meetup / Pick up instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Handed over to Student Center front desk clerk"
                  value={newContactInfo}
                  onChange={(e) => setNewContactInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Image link */}
              <div>
                <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-1.5">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/photo..."
                  value={newImageLink}
                  onChange={(e) => setNewImageLink(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Leave empty to use a standard item catalog illustration.</span>
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
                  Report Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
