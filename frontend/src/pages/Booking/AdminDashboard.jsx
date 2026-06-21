import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/booking/pending');
      const data = await res.json();
      if (data.success) setPending(data.bookings);
    } catch (err) {
      console.error('Failed fetching allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/booking/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setPending(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Status modification failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Administrative Panel</h1>
            <p className="text-sm text-gray-400 mt-1">Review, approve, or reject campus slot allocations</p>
          </div>
          <span className="bg-purple-900/30 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500/20">
            Faculty / Admin Mode
          </span>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading allocation pipeline...</p>
        ) : pending.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-gray-400 font-medium">All venue reservation queues clear.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map(req => (
              <div key={req.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:border-zinc-700">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-xl text-white">{req.event_name}</h4>
                    <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-md border border-zinc-700">
                      {req.venue_name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1.5">
                    📅 {req.event_date.split('T')[0]} &nbsp;|&nbsp; 🕒 {req.start_time} - {req.end_time}
                  </p>
                  <p className="text-xs text-purple-400 mt-2 font-mono">
                    Requested by: {req.user_name} ({req.user_role})
                  </p>
                </div>
                <div className="flex gap-2.5 w-full md:w-auto">
                  <button 
                    onClick={() => handleAction(req.id, 'APPROVED')} 
                    className="flex-1 md:flex-initial bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-emerald-500 transition text-sm shadow-sm"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'REJECTED')} 
                    className="flex-1 md:flex-initial bg-rose-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-rose-500 transition text-sm shadow-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
