import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Clock, Flame, Sparkles, ChefHat } from 'lucide-react';
import './CanteenDashboard.css'; 

// Import our new cleanly separated components
import MenuGrid from './components/MenuGrid';
import LiveTracker from './components/LiveTracker';
import CartSidebar from './components/CartSidebar';




export default function CanteenDashboard() {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  

const fetchMenu = async () => {

  try {

    const response = await fetch(
      "http://localhost:4000/api/canteen/menu"
    );

    const data = await response.json();

    const formattedMenu = data.menu.map(item => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      prepTime: item.prep_time,
      stock: item.stock > 0,
      stockCount: item.stock,
      icon: Utensils,
      color: "#6366f1"
    }));

    setMenuItems(formattedMenu);

  } catch (error) {

    console.error("Error fetching menu:", error);

  } finally {

    setLoading(false);

  }

};
useEffect(() => {

  fetchMenu();

}, []);
  // ─── STATE LOGIC ───
  const updateCart = (item, delta) => {
    if (!item.stock) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const nextQty = existing.quantity + delta;
        if (nextQty <= 0) return prev.filter(i => i.id !== item.id);
        return prev.map(i => i.id === item.id ? { ...i, quantity: nextQty } : i);
      }
      if (delta > 0) return [...prev, { ...item, quantity: 1 }];
      return prev;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

const placeOrder = async () => {

  if (cart.length === 0) return;

  try {

    const response = await fetch(
      "http://localhost:4000/api/canteen/order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          userId: 1,

          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity
          }))

        })
      }
    );

    const data = await response.json();

    console.log(data);

   if (!data.success) {

  const stockMessage =
    data.availableStock === 0
      ? `${data.itemName} is completely out of stock.`
      : `${data.itemName} has only ${data.availableStock} item(s) left.`;

  alert(
` Order Failed

${stockMessage}

Please reduce the quantity and try again.`
  );

  fetchMenu();

  return;
}

    const maxPrep = Math.max(...cart.map(i => i.prepTime));

    setActiveOrder({
      id: data.order.token_number,
      items: [...cart],
      total: cartTotal,
      status: data.order.status,
      eta: maxPrep + 5,
      queue: 3
    });

    setCart([]);

    setActiveTab("tracker");

    alert(
      ` Order Placed!\n\nToken Number: ${data.order.token_number}`
    );

    fetchMenu();

  } catch (error) {

    console.error(error);

    alert("Unable to connect to backend.");

  }

};

  const tabs = [
    { id: 'menu', label: 'Live Menu', icon: Utensils },
    { id: 'tracker', label: 'Order Tracker', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        
        {/* LEFT COLUMN: Main Area */}
        <div className="space-y-8">
          
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pb-6 border-b border-zinc-800"
          >
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                  <ChefHat className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" size={32} />
                </motion.div>
                UniHub Canteen
              </h1>
              <p className="text-zinc-500 text-sm mt-1 font-medium">Skip the line. Order from class.</p>
            </div>
          </motion.header>

          <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl w-fit border border-zinc-800/50 backdrop-blur-md">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.id === 'tracker' && !activeOrder}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors z-10 ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  } ${(tab.id === 'tracker' && !activeOrder) ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="canteenTabBubble"
                      className="absolute inset-0 bg-zinc-800 border border-zinc-700 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC CONTENT SWITCHING */}
          <AnimatePresence mode="wait">
            {activeTab === 'menu' ? (
              <MenuGrid
  key="menu"
  menuItems={menuItems}
  cart={cart}
  updateCart={updateCart}
/>
            ) : (
              <LiveTracker key="tracker" activeOrder={activeOrder} />
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <CartSidebar 
          cart={cart} 
          cartTotal={cartTotal} 
          updateCart={updateCart} 
          placeOrder={placeOrder} 
        />

      </div>
    </div>
  );
}