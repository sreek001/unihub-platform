import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, CalendarCheck, CheckCircle2, AlertCircle,
  LogOut, ChevronRight, MapPin, Users, Shield,
  Wrench, ArrowRight, Clock,
} from 'lucide-react';

const VENUES = [
  { id: 1, name: 'Main Seminar Hall',       location: 'Block A — Ground Floor',    capacity: 250, type: 'Seminar Hall',     status: 'Open'        },
  { id: 2, name: 'Department Seminar Hall', location: 'Block B — 2nd Floor',       capacity: 120, type: 'Seminar Hall',     status: 'Open'        },
  { id: 3, name: 'Advanced IoT Lab',        location: 'Block C — 3rd Floor',       capacity: 40,  type: 'Lab',             status: 'Open'        },
  { id: 4, name: 'Open Auditorium',         location: 'Central Campus Grounds',    capacity: 500, type: 'Auditorium',      status: 'Open'        },
  { id: 5, name: 'Mini Conference Room',    location: 'Admin Block — Room 104',    capacity: 20,  type: 'Conference Room', status: 'Open'        },
  { id: 6, name: 'Robotics Research Lab',   location: 'Block D — 1st Floor',       capacity: 30,  type: 'Lab',             status: 'Open'        },
  { id: 7, name: 'Innovation Hub',          location: 'Library Building — 4th Fl', capacity: 60,  type: 'Project Space',   status: 'Maintenance' },
];

const TYPE_COLORS = {
  'Seminar Hall':    { color: '#6366f1', bg: 'rgba(99,102,241,0.09)'  },
  'Lab':             { color: '#0d9488', bg: 'rgba(13,148,136,0.09)'  },
  'Auditorium':      { color: '#d97706', bg: 'rgba(217,119,6,0.09)'   },
  'Conference Room': { color: '#7c3aed', bg: 'rgba(124,58,237,0.09)'  },
  'Project Space':   { color: '#db2777', bg: 'rgba(219,39,119,0.09)'  },
};

const MOCK_PENDING_COUNT  = 4;
const MOCK_APPROVED_TODAY = 3;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
};

export default function VenueAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => { logout(); navigate('/login'); };

  const stats = [
    { label: 'Total Venues',     value: VENUES.length,        icon: Building2,    color: '#7c3aed', bg: 'rgba(124,58,237,0.09)', glow: 'rgba(124,58,237,0.15)' },
    { label: 'Pending Requests', value: MOCK_PENDING_COUNT,   icon: Clock,        color: '#d97706', bg: 'rgba(217,119,6,0.09)',  glow: 'rgba(217,119,6,0.15)'  },
    { label: 'Approved Today',   value: MOCK_APPROVED_TODAY,  icon: CheckCircle2, color: '#0d9488', bg: 'rgba(13,148,136,0.09)', glow: 'rgba(13,148,136,0.15)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fafafc', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}>
            <Shield size={19} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Venue Management</div>
            <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700, letterSpacing: '0.06em' }}>ADMIN CONTROL BOARD</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            id="venue-authorizer-btn"
            whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/venue/admin/authorizer')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124,58,237,0.22)', fontFamily: 'inherit',
            }}
          >
            Booking Authorizer <ArrowRight size={15} />
          </motion.button>

          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: 10, padding: '7px 14px',
              boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 800, color: '#fff',
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Venue Admin</div>
              </div>
            </div>
          )}

          <button
            id="venue-admin-signout"
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10,
              border: '1px solid rgba(239,68,68,0.2)',
              background: 'rgba(239,68,68,0.05)',
              color: '#ef4444', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </motion.header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Campus Venue Overview</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 4, fontWeight: 500 }}>Manage all bookable spaces · Monitor availability · Authorize faculty requests</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 32 }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={itemVariants} style={{
                background: '#fff', border: '1px solid rgba(15,23,42,0.07)',
                borderRadius: 18, padding: '24px 26px',
                display: 'flex', alignItems: 'center', gap: 16,
                boxShadow: '0 2px 12px rgba(15,23,42,0.05)', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${stat.glow}` }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginTop: 2 }}>{stat.label}</div>
                </div>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: stat.bg, opacity: 0.5 }} />
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }} style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.3fr 0.8fr 1fr', padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid rgba(15,23,42,0.07)', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Venue Name</span><span>Type</span><span>Location</span><span>Capacity</span><span>Status</span>
          </div>
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            {VENUES.map((venue, i) => {
              const ts = TYPE_COLORS[venue.type] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)' };
              const isOpen = venue.status === 'Open';
              return (
                <motion.div key={venue.id} variants={itemVariants} whileHover={{ background: 'rgba(124,58,237,0.025)' }}
                  style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.3fr 0.8fr 1fr', padding: '16px 24px', borderBottom: i < VENUES.length - 1 ? '1px solid rgba(15,23,42,0.05)' : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{venue.name}</div>
                  <div><span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: ts.bg, color: ts.color }}>{venue.type}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{venue.location}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} color="#94a3b8" /><span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{venue.capacity}</span></div>
                  <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: isOpen ? 'rgba(16,185,129,0.09)' : 'rgba(245,158,11,0.09)', color: isOpen ? '#059669' : '#d97706', border: `1px solid ${isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                    {isOpen ? <CheckCircle2 size={11} /> : <Wrench size={11} />}{venue.status}
                  </span></div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.35 }}
          style={{ marginTop: 28, padding: '22px 28px', background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(99,102,241,0.04))', border: '1px solid rgba(124,58,237,0.14)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{MOCK_PENDING_COUNT} booking requests awaiting your decision</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>Review and approve or reject incoming venue reservation requests from faculty members.</div>
          </div>
          <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(124,58,237,0.3)' }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/venue/admin/authorizer')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.24)', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Open Authorizer Queue <ChevronRight size={16} />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
