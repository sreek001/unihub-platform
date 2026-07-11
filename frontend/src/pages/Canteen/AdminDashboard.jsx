import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, LogOut } from "lucide-react";
import "./CanteenDashboard.css";
import { useAuth } from "../../context/AuthContext";
import { OriginButton } from "@/components/ui/origin-button";

import AdminKanban from "./components/admin/AdminKanban";
import AdminSidebar from "./components/admin/AdminSidebar";
import AddItemModal from "./components/admin/AddItemModal";
export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();           // clears localStorage token + resets auth state
    navigate('/login'); // redirect to login screen
  };

  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const previousOrderCount = useRef(0);

  const notificationSound = useRef(
    new Audio("/sounds/new-order.mp3")
  );
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

      const response = await fetch(
        "http://localhost:4000/api/canteen/menu"
      );

      const data = await response.json();

      if (data.success) {

        const menu = data.menu.map(item => ({
          ...item,
          prepTime: item.prep_time
        }));

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

      const response = await fetch(
        "http://localhost:4000/api/canteen/orders"
      );

      const data = await response.json();

      if (data.success) {

        const formattedOrders = data.orders.map(order => ({

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

          time: new Date(order.created_at).toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit"

          }),

          items: order.items

        }));

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

      const response = await fetch(

        `http://localhost:4000/api/canteen/order/${orderId}/status`,

        {

          method: "PATCH",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status: nextStatus
          })

        }

      );

      const data = await response.json();

      if (data.success) {

        fetchOrders();

      } else {

        alert(data.message);

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

      const response = await fetch(
        `http://localhost:4000/api/canteen/menu/${item.id}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            available: newAvailability,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {

        setMenuItems(prev =>
          prev.map(menu =>
            menu.id === item.id
              ? { ...menu, available: newAvailability }
              : menu
          )
        );

      }

    } catch (err) {

      console.error(err);

    }

  };
  const addMenuItem = async (item) => {

    try {

      const response = await fetch(
        "http://localhost:4000/api/canteen/menu",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        }
      );

      const data = await response.json();

      if (data.success) {

        setShowAddModal(false);

        fetchMenu();

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.error(err);

      alert("Unable to add menu item.");

    }

  };
  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">

      {/* MAIN KANBAN AREA */}
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
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm tracking-wide text-slate-700">SYSTEM LIVE</span>
            </div>
            {/* ── Sign Out Button ── */}
            <OriginButton
              id="canteen-admin-signout"
              onClick={handleSignOut}
              title="Sign out of admin panel"
              className="border-[0.5px] border-red-500/25 bg-red-500/5 text-red-500 hover:bg-red-500/10 h-10 px-4 rounded-xl"
            >
              <LogOut size={15} />
              Sign Out
            </OriginButton>
          </div>
        </motion.header>

        <div className="flex-1 overflow-hidden">
          <AdminKanban orders={orders} advanceStatus={advanceStatus} />
        </div>
      </div>

      {/* RIGHT SIDEBAR: MENU TOGGLES */}
      <div className="w-80 border-l border-slate-200 bg-white">
        <AdminSidebar
          menuItems={menuItems}
          toggleAvailability={toggleAvailability}
          openAddModal={() => setShowAddModal(true)}
        />
      </div>
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addMenuItem}
      />
    </div>
  );
}