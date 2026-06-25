import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Minus } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const cardUp = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 150, damping: 20 } 
  }
};

export default function MenuGrid({ menuItems, cart, updateCart }) {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {menuItems.map(item => {
        const ItemIcon = item.icon;
        const cartItem = cart.find(i => i.id === item.id);
        const qty = cartItem ? cartItem.quantity : 0;

        return (
          <motion.div 
            key={item.id}
            variants={cardUp}
            whileHover={item.stock ? { y: -4, scale: 1.02 } : {}}
            className={`relative overflow-hidden p-5 rounded-3xl border backdrop-blur-sm transition-all duration-300 ${
              item.stock 
                ? 'bg-zinc-900/40 border-zinc-800 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)]' 
                : 'bg-zinc-900/20 border-zinc-800/50 opacity-60 grayscale'
            }`}
          >
            {/* Glassmorphic accent glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <ItemIcon size={20} color={item.stock ? item.color : '#71717a'} />
              </div>
              <span className="text-lg font-black text-white tracking-tight">₹{item.price}</span>
            </div>

            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
            <p className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 mb-6">
              <Clock size={12} /> Prep: {item.prepTime} mins
            </p>

            {item.stock ? (
              qty > 0 ? (
                <div className="flex items-center justify-between bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-1">
                  <button onClick={() => updateCart(item, -1)} className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-indigo-300 w-8 text-center">{qty}</span>
                  <button onClick={() => updateCart(item, 1)} className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => updateCart(item, 1)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-zinc-800 hover:bg-indigo-600 text-white transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add
                </button>
              )
            ) : (
              <div className="w-full py-2.5 rounded-xl font-bold text-sm bg-zinc-900/50 text-zinc-600 text-center border border-zinc-800 border-dashed">
                Sold Out
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}