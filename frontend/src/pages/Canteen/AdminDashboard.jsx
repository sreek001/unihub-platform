import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, LogOut } from "lucide-react";
import "./CanteenDashboard.css";
import { useAuth } from "../../context/AuthContext";
import { OriginButton } from "@/components/ui/origin-button";

// 🌟 FIXED: Import our global base URL mapping configuration
import API_BASE_URL from '../../config/api';

import AdminKanban from "./components/admin/AdminKanban";
import AdminSidebar from "./components/admin/AdminSidebar";
import AddItemModal from "./components/admin/AddItemModal";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const previousOrderCount = useRef(0);

  const notificationSound = useRef(new Audio("/sounds/new-order.mp3"));

  useEffect(() => {
    fetchMenu();
    fetchOrders();

    const interval = setInterval(() => {
      fetchMenu();
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (previousOrderCount.current === 0) {
      previousOrderCount.current = orders.length;
      return;
    }

    if (orders.length > previousOrderCount.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(err => {
        console.log("Sound blocked:", err);
      });
    }

    previousOrderCount.current = orders.length;
  }, [orders]);

  // ===============================
  // FETCH MENU
  // ===============================
  const fetchMenu = async () => {
    try {
      // 🌟 FIXED: Routed paths contextual to the global variable config
      const response = await fetch(`${API_BASE_URL}/api/canteen/menu`);
      const data = await response.json();

      if (data.success || Array.isArray(data)) {
        const rawMenu = data.menu || data;
        const menu = Array.isArray(rawMenu) ? rawMenu.map(item => ({
          ...item,
          prepTime: item.prep_time || 10
        })) : [];

        setMenuItems(menu);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // FETCH ORDERS
  // ===============================
  const fetchOrders = async () => {
    try {
      // 🌟 FIXED: Shifted endpoint string out of local hardcoding
      const response = await fetch(`${API_BASE_URL}/api/canteen/orders`);
      const data = await response.json();

      if (data.success || Array.isArray(data)) {
        const rawOrders = data.orders || data;
        const formattedOrders = Array.isArray(rawOrders) ? rawOrders.map(order => ({
          id: order.id,
          queue: order.token_number,
          status:
            order.status === "PENDING"
              ? "received"
              : order.status === "PREPARING"
                ? "preparing"
                : order.status === "READY"
                  ? "ready"
                  : "completed",
          time: new Date(order.created_at || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),
          items: order.items || []
        })) : [];

        setOrders(formattedOrders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // UPDATE ORDER STATUS
  // ===============================
  const advanceStatus = async (orderId, currentStatus) => {
    let nextStatus;
    if (currentStatus === "received") {
      nextStatus = "PREPARING";
    } else if (currentStatus === "preparing") {
      nextStatus = "READY";
    } else {
      nextStatus = "DELIVERED";
    }

    try {
      // 🌟 FIXED: Updated fetch call template routing parameters
      const response = await fetch(
        `${API_BASE_URL}/api/canteen/order/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || "Failed to alter status code.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // TOGGLE STOCK
  // ===============================
  const toggleAvailability = async (item) => {
    try {
      const newAvailability = !item.available;
      // 🌟 FIXED: Directed availability checks straight to production API URL layers
      const response = await fetch(
        `${API_BASE_URL}/api/canteen/menu/${item.id}/availability`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ available: newAvailability })
        }
      );

      const data = await response.json();
      if (data.success) {
        setMenuItems(prev =>
          prev.map(menu =>
            menu.id === item.id ? { ...menu, available: newAvailability } : menu
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // ADD MENU ITEM
  // ===============================
  const addMenuItem = async (item) => {
    try {
      // 🌟 FIXED: Shifted manual target routing out to production strings
      const response = await fetch(
        `${API_BASE_URL}/api/canteen/menu`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchMenu();
      } else {
        alert(data.message || "Could not add item template.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to add menu item.");
    }
  };

  return (
    <div className="h-screen bg-transparent text-slate-900 flex font-sans overflow-hidden">
      <div className="flex-1 flex flex-col p-6 md:p-8 h-full">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200"
        >
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <ChefHat className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" size={32} />
              Kitchen Display System
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">{orders.length} Active Tickets in Queue</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm tracking-wide text-slate-700">SYSTEM LIVE</span>
            </div>
            <OriginButton
              id="canteen-admin-signout"
              onClick={handleSignOut}
              title="Sign out of admin panel"
              className="border-[0.5px] border-red-500/25 bg-red-500/5 text-red-500 hover:bg-red-500/10 h-10 px-4 rounded-xl"
            >
              Sign Out
            </OriginButton>
          </div>
        </motion.header>

        <div className="flex-1 overflow-hidden">
          <AdminKanban orders={orders} advanceStatus={advanceStatus} />
        </div>
      </div>

      <div className="w-80 border-l border-slate-200/50 bg-white/60 backdrop-blur-xl shadow-lg">
        <AdminSidebar menuItems={menuItems} toggleAvailability={toggleAvailability} openAddModal={() => setShowAddModal(true)} />
      </div>
      <AddItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addMenuItem} />
    </div>
  );
}