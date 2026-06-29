import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { GraduationCap, Inbox, ArrowRight, Utensils, CalendarDays, Printer } from 'lucide-react';
import './App.css';

import LostFound from './pages/LostFound/LostFound.jsx';

// ─── CANTEEN IMPORTS ───
import CanteenDashboard from './pages/Canteen/dashboard.jsx';
import AdminDashboard from './pages/Canteen/AdminDashboard.jsx';

// ─── BOOKING IMPORT ───
import BookingDashboard from './pages/Booking/BookingDashboard.jsx';
import PrintDashboard from './pages/Print/PrintDashboard.jsx';
import { UserProvider } from './pages/academics/UserContext.jsx';
import AcademicsLayout from './pages/academics/AcademicsLayout.jsx';
import Marketplace from './pages/academics/Marketplace.jsx';
import Vault from './pages/academics/Vault.jsx';
import Inventory from './pages/academics/Inventory.jsx';
import Settings from './pages/academics/Settings.jsx';
// ─── GLOBAL LAYOUT (PREMIUM DARK THEME) ───
function AppLayout() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-all duration-300">
            <GraduationCap className="h-8 w-8 text-indigo-500 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              UniHub
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-6">
            
                        <Link to="/academics/marketplace" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/5">
              <span className="h-4 w-4 text-indigo-400">📚</span> Academics
            </Link>
            <Link to="/bookings" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/5">
              <CalendarDays className="h-4 w-4 text-purple-400" /> Bookings
            </Link>
            <Link to="/lost-found" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/5">
              <Inbox className="h-4 w-4 text-emerald-400" /> Lost & Found
            </Link>
            <Link to="/canteen" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/5">
              <Utensils className="h-4 w-4 text-amber-400" /> Canteen
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="flex-grow w-full mx-auto pb-8 px-4">
        <Outlet />
      </main>
      
      <footer className="bg-[#09090b] border-t border-white/5 py-6 text-center text-sm text-zinc-600">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} UniHub. Built for premium campus experiences.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── HOME DASHBOARD (SEAMLESS DARK THEME) ───
function Home() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-8 sm:px-12 space-y-16 text-center">
      <div className="space-y-6">
        <h1 className="text-5xl font-black text-white tracking-tight sm:text-6xl drop-shadow-lg">
          Welcome to UniHub
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Select a category below to access resources, order food, book venues, or report lost items on campus.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pt-4">
        
               {/* Academics Hub Card */}
        <Link 
          to="/academics/marketplace" 
          className="group bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-2 text-left flex flex-col justify-between h-72 cursor-pointer decoration-none font-sans"
          style={{ textDecoration: 'none' }}
        >
          <div className="space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition duration-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Academics Hub</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Explore subject syllabus, textbooks, and notes for different semesters, or use integrated study tools.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
            Open Academics Hub <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </Link>

        {/* Venue Booking Hub Card */}
        <Link 
          to="/bookings" 
          className="group bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-2 text-left flex flex-col justify-between h-72 cursor-pointer decoration-none"
        >
          <div className="space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition duration-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <CalendarDays className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Venue Booking</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Reserve seminar halls, labs, and project spaces. Check live availability and secure your slot instantly.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
            Open Venue Booking <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </Link>
        {/* Print Hub Card */}
<Link
  to="/print"
  className="group bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-2 text-left flex flex-col justify-between h-72 cursor-pointer decoration-none"
>
  <div className="space-y-5">
    <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition duration-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
      <Printer className="h-7 w-7" />
    </div>

    <h2 className="text-2xl font-bold text-white tracking-tight">
      Print Hub
    </h2>

    <p className="text-zinc-400 text-sm leading-relaxed">
      Upload documents, choose print settings, pay online, and collect your prints without long queues
    </p>
  </div>

  <div className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
    Open Print Hub
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
  </div>
</Link>

        {/* Canteen Hub Card */}
        <Link 
          to="/canteen" 
          className="group bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-2 text-left flex flex-col justify-between h-72 cursor-pointer decoration-none"
        >
          <div className="space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition duration-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Utensils className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Live Canteen</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Skip the massive lunch line. Order from your classroom, track your food live, and pick it up when ready.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
            Open Live Canteen <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </Link>

        {/* Lost & Found Card */}
        <Link 
          to="/lost-found" 
          className="group bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-2 text-left flex flex-col justify-between h-72 cursor-pointer decoration-none"
        >
          <div className="space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition duration-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Inbox className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Lost & Found</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Browse reported items lost or found on campus, submit new listings, or claim found objects online.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
            Open Lost & Found <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── MAIN APP ROUTER ───
export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* KIOSK MODE (FULL SCREEN) */}
          <Route path="/canteen/admin" element={<AdminDashboard />} />

          {/* CONSUMER MODE (WITH NAVBAR) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/bookings" element={<BookingDashboard />} />
            <Route path="/print" element={<PrintDashboard />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/canteen" element={<CanteenDashboard />} />

            {/* NESTED ACADEMICS ROUTES */}
            <Route path="/academics" element={<AcademicsLayout />}>
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="vault" element={<Vault />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}