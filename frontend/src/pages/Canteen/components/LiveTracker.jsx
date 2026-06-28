import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, CheckCircle2, ChefHat, Sparkles } from 'lucide-react';

export default function LiveTracker({ activeOrder }) {
  if (!activeOrder) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <p className="text-zinc-500 font-medium text-sm mb-1 uppercase tracking-widest">Order ID</p>
          <h2 className="text-2xl font-black text-white">{activeOrder.id}</h2>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 font-medium text-sm mb-1 uppercase tracking-widest">Queue Pos</p>
          <h2 className="text-3xl font-black text-indigo-400">#{activeOrder.queue}</h2>
        </div>
      </div>

      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full" />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: activeOrder.status === 'ready' ? '100%' : '50%' }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute top-1/2 left-0 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] -translate-y-1/2 rounded-full" 
        />
        
        <div className="relative flex justify-between">
          {[
            { step: 'Received', icon: CheckCircle2, active: true },
            { step: 'Preparing', icon: ChefHat, active: activeOrder.status === 'preparing' || activeOrder.status === 'ready' },
            { step: 'Ready', icon: Sparkles, active: activeOrder.status === 'ready' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                s.active ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-zinc-900 border-zinc-700 text-zinc-600'
              }`}>
                <s.icon size={18} />
              </div>
              <span className={`text-xs font-bold ${s.active ? 'text-white' : 'text-zinc-600'}`}>{s.step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Utensils size={16} className="text-zinc-500"/> Order Summary</h3>
        <ul className="space-y-3">
          {activeOrder.items.map(item => (
            <li key={item.id} className="flex justify-between text-sm font-medium text-zinc-300">
              <span><span className="text-zinc-600 mr-2">{item.quantity}x</span>{item.name}</span>
              <span>₹{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between font-black text-lg">
          <span>Total</span>
          <span className="text-indigo-400">₹{activeOrder.total}</span>
        </div>
      </div>
    </motion.div>
  );
}