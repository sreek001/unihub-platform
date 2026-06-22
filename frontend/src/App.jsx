import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom'
import { GraduationCap, Inbox, BookOpen, ArrowRight } from 'lucide-react'
import './App.css'

import AcademicsResources from './pages/Academics/AcademicsResources.jsx'
import LostFound from './pages/LostFound/LostFound.jsx'

// Clean, global Layout wrapper with the standard navigation header
function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:opacity-90 transition-all duration-300">
            <GraduationCap className="h-8 w-8 text-indigo-600 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">CollegeCompanion</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/academics" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100">
              <BookOpen className="h-4 w-4" /> Academics
            </Link>
            <Link to="/lost-found" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100">
              <Inbox className="h-4 w-4" /> Lost & Found
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} CollegeCompanion. Built for premium campus experiences.</p>
        </div>
      </footer>
    </div>
  )
}

// Clean portal landing page presenting Academics and Lost & Found as two distinct sections
function Home() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight sm:text-5xl">
          Welcome to CollegeCompanion
        </h1>
        <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
          Select a category below to access resources or report lost items on campus.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-6">
        {/* Academics Hub Card */}
        <Link 
          to="/academics" 
          className="group bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 text-left flex flex-col justify-between h-72 cursor-pointer decoration-none"
          style={{ textDecoration: 'none' }}
        >
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-300">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Academics Hub</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Explore subject syllabi, textbooks, and notes for different semesters, or use integrated study tools.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
            Open Academics Hub <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Lost & Found Card */}
        <Link 
          to="/lost-found" 
          className="group bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-emerald-400 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 text-left flex flex-col justify-between h-72 cursor-pointer decoration-none"
          style={{ textDecoration: 'none' }}
        >
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition duration-300">
              <Inbox className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Lost & Found</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Browse reported items lost or found on campus, submit new listings, or claim found objects online.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:text-emerald-800">
            Open Lost & Found <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/academics" element={<AcademicsResources />} />
          <Route path="/lost-found" element={<LostFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
