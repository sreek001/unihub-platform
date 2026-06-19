import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Utensils } from "lucide-react";

export default function Dashboard() {
  const [cart, setCart] = useState([]);

  const menuItems = [
    { id: 1, name: "Burger", price: 50 },
    { id: 2, name: "Pizza", price: 80 },
    { id: 3, name: "Sandwich", price: 40 },
    { id: 4, name: "Cold Coffee", price: 35 },
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <Utensils className="text-purple-500 w-8 h-8" />
        <h1 className="text-4xl font-bold">Campus Canteen</h1>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
              >
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-purple-400 mt-2">₹{item.price}</p>

                <button
                  onClick={() => addToCart(item)}
                  className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg"
                >
                  <Plus size={16} />
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-purple-400" />
            <h2 className="text-xl font-semibold">Cart</h2>
          </div>

          {cart.length === 0 ? (
            <p className="text-zinc-400">Cart is empty</p>
          ) : (
            <>
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b border-zinc-800 pb-2"
                  >
                    <span>{item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-zinc-800 pt-4">
                <p className="font-bold">Total: ₹{total}</p>

                <button className="w-full mt-4 bg-green-600 hover:bg-green-500 py-2 rounded-lg font-semibold">
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}