import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  BookOpen, 
  ShoppingBag, 
  Database, 
  FolderHeart, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useActiveUser } from './UserContext';

export default function AcademicsLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const { activeUser, loading } = useActiveUser();

  const navItems = [
    { name: 'Marketplace', href: '/academics/marketplace', icon: ShoppingBag },
    { name: 'Digital Vault', href: '/academics/vault', icon: Database },
    { name: 'My Inventory', href: '/academics/inventory', icon: FolderHeart },
    { name: 'Settings', href: '/academics/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">UniHub</h1>
            <span className="text-xs text-slate-500 font-medium">Academics Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {item.name}
              </Link>
            );
          })}

          {/* Quick link to go back to Main Portal */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all duration-300 mt-8"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Back to Portal
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 z-10">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {navItems.find((n) => pathname === n.href)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {activeUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-300 font-semibold">{activeUser.name}</span>
                <span className="text-slate-500">({activeUser.branch})</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
