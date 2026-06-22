'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  ShoppingBag, 
  Database, 
  FolderHeart, 
  Bell, 
  ChevronDown,
  Settings
} from 'lucide-react';
import { UserProvider, useActiveUser } from './UserContext';

function AcademicsDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeUser, users, setActiveUser, loading } = useActiveUser();

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
            <span className="text-xs text-slate-500">Academics Exchange</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
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
        </nav>

        {/* User Switcher in Sidebar footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider px-2">Simulate Student Profile</div>
          {loading ? (
            <div className="h-10 bg-slate-800/50 rounded-xl animate-pulse" />
          ) : (
            <div className="relative group">
              <select
                value={activeUser?.id || ''}
                onChange={(e) => {
                  const u = users.find((x) => x.id === e.target.value);
                  if (u) setActiveUser(u);
                }}
                className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-xl px-3 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.branch.split(' ')[0]})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 z-10">
          {/* Greeting */}
          <div className="flex items-center gap-2.5">
            <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 mr-1.5">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-500 leading-none">Academics Hub</h2>
              <h1 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-1.5 mt-1">
                {activeUser ? `Hey, ${activeUser.name}!` : 'Welcome back!'}
                <span className="animate-bounce">👋</span>
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Active User Info Pills */}
            {activeUser && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full font-medium">
                  {activeUser.branch}
                </span>
                <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full font-medium">
                  Sem {activeUser.currentSemester}
                </span>
              </div>
            )}

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all duration-300">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>

            {/* Mobile Navigation Menu dropdown */}
            <div className="md:hidden relative group">
              <button className="flex items-center gap-1.5 p-2 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl">
                Menu
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl hidden group-focus-within:block group-hover:block py-1 text-slate-300 text-sm z-55">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-800 hover:text-white"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-slate-800 my-1"></div>
                <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider">Switch Profile</div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setActiveUser(u)}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white text-xs ${
                      activeUser?.id === u.id ? 'text-indigo-400 font-bold' : ''
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AcademicsDashboardLayout>{children}</AcademicsDashboardLayout>
    </UserProvider>
  );
}
