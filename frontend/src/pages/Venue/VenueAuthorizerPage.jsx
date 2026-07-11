import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Building2,
  Calendar, User, Tag, Filter, LogOut, Shield, Users,
} from 'lucide-react';

const MOCK_REQUESTS = [
  { id: 'REQ-001', venue: 'Main Seminar Hall',       date: '2026-07-12', slot: '10:00 – 11:00', requester: 'Dr. Ananya Kumar',    event: 'Guest Lecture — AI in Education',        status: 'pending'  },
  { id: 'REQ-002', venue: 'Advanced IoT Lab',         date: '2026-07-12', slot: '14:00 – 15:00', requester: 'Dr. Rajesh Mehta',    event: 'Lab Session — Embedded Systems',          status: 'pending'  },
  { id: 'REQ-003', venue: 'Mini Conference Room',     date: '2026-07-11', slot: '09:00 – 10:00', requester: 'Dr. Priya Sharma',    event: 'Research Review Meeting',                 status: 'approved' },
  { id: 'REQ-004', venue: 'Department Seminar Hall',  date: '2026-07-11', slot: '15:00 – 16:00', requester: 'Dr. Suresh Babu',     event: 'Project Viva — Batch 2023',               status: 'approved' },
  { id: 'REQ-005', venue: 'Innovation Hub',           date: '2026-07-10', slot: '11:00 – 12:00', requester: 'Dr. Kavitha Nair',    event: 'Startup Ideation Workshop',               status: 'rejected' },
  { id: 'REQ-006', venue: 'Open Auditorium',          date: '2026-07-13', slot: '09:00 – 13:00', requester: 'Dr. Mohan Das',       event: 'Annual Cultural Fest Rehearsal',          status: 'pending'  },
  { id: 'REQ-007', venue: 'Robotics Research Lab',    date: '2026-07-13', slot: '14:00 – 17:00', requester: 'Dr. Vijay Krishnan',  event: 'Inter-College Robotics Demo',             status: 'pending'  },
];

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const STATUS_STYLES = {
  pending:  { color: '#d97706', bg: 'rgba(217,119,6,0.09)',  border: 'rgba(217,119,6,0.2)',  label: 'Pending'  },
  approved: { color: '#059669', bg: 'rgba(16,185,129,0.09)', border: 'rgba(16,185,129,0.2)', label: 'Approved' },
  rejected: { color: '#dc2626', bg: 'rgba(220,38,38,0.09)',  border: 'rgba(220,38,38,0.2)',  label: 'Rejected' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { type: 'spring', stiffness: 280, damping: 26 } },
  exit:   { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2 } },
};

export default function VenueAuthorizerPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests]     = useState(MOCK_REQUESTS);
  const [activeTab, setActiveTab]   = useState('All');
  const [processing, setProcessing] = useState(null);

  const handleSignOut = () => { logout(); navigate('/login'); };

  const handleDecision = (id, decision) => {
    setProcessing(id);
    setTimeout(() => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: decision } : r));
      setProcessing(null);
    }, 600);
  };

  const filtered = requests.filter(r => {
    if (activeTab === 'All')      return true;
    if (activeTab === 'Pending')  return r.status === 'pending';
    if (activeTab === 'Approved') return r.status === 'approved';
    if (activeTab === 'Rejected') return r.status === 'rejected';
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafc', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <motion.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        style={{
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(15,23,42,0.07)',
          padding: '0 32px', height: 68,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 12px rgba(15,23,42,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/venue/admin')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, border: '1px solid rgba(15,23,42,0.1)', background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ width: 1, height: 24, background: 'rgba(15,23,42,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.28)' }}>
              <CheckCircle2 size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Booking Authorizer</div>
              <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700, letterSpacing: '0.05em' }}>
                {pendingCount} PENDING DECISION{pendingCount !== 1 ? 'S' : ''}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 10, padding: '7px 12px', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
            </div>
          )}
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </motion.header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 32px' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Venue Booking Requests</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 4, fontWeight: 500 }}>Review incoming faculty reservation requests and approve or reject them.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 24, delay: 0.08 }}
          style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#fff', border: '1px solid rgba(15,23,42,0.07)', borderRadius: 12, padding: 5, width: 'fit-content', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            const count = tab === 'All' ? requests.length : requests.filter(r => r.status === tab.toLowerCase()).length;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: isActive ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'transparent', color: isActive ? '#fff' : '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 7 }}>
                {tab}
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.07)', color: isActive ? '#fff' : '#94a3b8', padding: '2px 7px', borderRadius: 20 }}>{count}</span>
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '64px 0', color: '#94a3b8' }}>
              <CheckCircle2 size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} requests</div>
            </motion.div>
          ) : (
            filtered.map(req => {
              const ss = STATUS_STYLES[req.status];
              const isPending = req.status === 'pending';
              const isProcessing = processing === req.id;
              return (
                <motion.div key={req.id} variants={cardVariants} initial="hidden" animate="show" exit="exit" layout
                  style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.07)', borderRadius: 18, padding: '24px 28px', marginBottom: 14, boxShadow: '0 2px 12px rgba(15,23,42,0.04)', display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>

                  <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: ss.color, borderRadius: '18px 0 0 18px', opacity: 0.7 }} />

                  <div style={{ flex: 1, paddingLeft: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.08em' }}>{req.id}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{ss.label}</span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{req.event}</div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        <Building2 size={13} color="#7c3aed" />{req.venue}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        <Calendar size={13} color="#6366f1" />{req.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        <Clock size={13} color="#0d9488" />{req.slot}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        <User size={13} color="#d97706" />{req.requester}
                      </div>
                    </div>
                  </div>

                  {isPending && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignSelf: 'center' }}>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                        onClick={() => handleDecision(req.id, 'approved')}
                        disabled={isProcessing}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#059669', fontSize: 13, fontWeight: 700, cursor: isProcessing ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: isProcessing ? 0.6 : 1 }}>
                        <CheckCircle2 size={14} /> {isProcessing ? 'Processing…' : 'Approve'}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                        onClick={() => handleDecision(req.id, 'rejected')}
                        disabled={isProcessing}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.06)', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: isProcessing ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: isProcessing ? 0.6 : 1 }}>
                        <XCircle size={14} /> Reject
                      </motion.button>
                    </div>
                  )}

                  {!isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: ss.color, background: ss.bg, padding: '8px 14px', borderRadius: 10, border: `1px solid ${ss.border}`, flexShrink: 0, alignSelf: 'center' }}>
                      {req.status === 'approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {ss.label}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
