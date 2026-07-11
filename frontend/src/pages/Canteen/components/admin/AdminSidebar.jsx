import React from 'react';
import { LayoutGrid, ToggleRight, ToggleLeft } from 'lucide-react';

export default function AdminSidebar({ menuItems, toggleAvailability, openAddModal }) {
  return (
    <div className="hidden lg:flex flex-col bg-white border-l border-slate-200 p-6 h-full">
      <div className="mb-8">
        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
          <LayoutGrid className="text-indigo-500" size={24} />
          Menu Availability
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Toggle availability live.</p>
      </div>
      <button
        onClick={openAddModal}
        className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-sm"
      >
        + Add Menu Item
      </button>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {menuItems.map(item => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
              item.available
                ? 'bg-slate-50 border-slate-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <span className={`font-bold text-sm ${item.available ? 'text-slate-700' : 'text-red-500'}`}>
              {item.name}
            </span>
            <button
              onClick={() => toggleAvailability(item)}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              {item.available ? (
                <ToggleRight size={32} className="text-emerald-500" />
              ) : (
                <ToggleLeft size={32} className="text-red-400" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
