import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Utensils, Plus, Minus, ChevronRight } from 'lucide-react';

export default function CartSidebar({ cart, cartTotal, updateCart, placeOrder }) {
  return (
    <div className="hidden lg:block relative">
      <motion.div 
        className="sticky top-10 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl h-[calc(100vh-80px)] flex flex-col"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2 className="text-xl font-black mb-6 flex items-center gap-3">
          <ShoppingCart className="text-indigo-500" size={24} /> 
          Your Tray
        </h2>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4"
              >
                <div className="w-24 h-24 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <Utensils size={32} className="opacity-50" />
                </div>
                <p className="font-medium text-sm">Your tray is empty</p>
              </motion.div>
            ) : (
              cart.map(item => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  key={item.id} 
                  className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                    <p className="text-indigo-400 font-black text-xs mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button onClick={() => updateCart(item, -1)} className="p-1 hover:text-white text-zinc-500 transition-colors"><Minus size={14}/></button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateCart(item, 1)} className="p-1 hover:text-white text-zinc-500 transition-colors"><Plus size={14}/></button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="pt-6 border-t border-zinc-800 mt-auto">
          <div className="flex justify-between items-end mb-6">
            <span className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Total</span>
            <span className="text-3xl font-black tracking-tighter">₹{cartTotal}</span>
          </div>
          <motion.button
            whileHover={cart.length > 0 ? { scale: 1.02 } : {}}
            whileTap={cart.length > 0 ? { scale: 0.98 } : {}}
            onClick={placeOrder}
            disabled={cart.length === 0}
            className="w-full py-4 rounded-2xl font-black tracking-wide text-white transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            Checkout <ChevronRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}