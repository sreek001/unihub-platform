import Link from 'next/link';
import { 
  BookOpen, 
  Coffee, 
  Calendar, 
  Search, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function PortalHomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <div className="text-center max-w-2xl space-y-4 mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> UniHub Campus Platform
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Your Campus, Connected.
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Access course vaults, list textbooks for local exchange, check the canteen, or reserve campus spots — all in one centralized hub.
        </p>
      </div>

      {/* Portal Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
        {/* Academics & P2P Module Card */}
        <Link 
          href="/academics/marketplace"
          className="group flex flex-col justify-between p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors duration-300">
                Academics & Peer Exchange
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Browse physical textbooks for in-person handover, or upload & search digital lecture notes and question papers in the vaults.
              </p>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
            Open Module <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Mock Modules Container for Other Modules */}
        <div className="grid grid-cols-1 gap-4">
          {/* Canteen Card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-4 opacity-75 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-300">Canteen Menu</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Pre-order food and bypass canteen queues.</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-4 opacity-75 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-300">Campus Bookings</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Reserve seminars, discussion rooms, or labs.</p>
            </div>
          </div>

          {/* Lost & Found Card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-4 opacity-75 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-300">Lost & Found</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Post recovered items or locate missing belongings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
