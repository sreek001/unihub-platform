import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
} from "react-router-dom";

import {
  GraduationCap,
  CalendarDays,
  Inbox,
  Utensils,
  ArrowRight,
} from "lucide-react";

// Print
import PrintDashboard from "./pages/Print/PrintDashboard";

// Lost & Found
import LostFound from "./pages/LostFound/LostFound.jsx";

// Canteen
import CanteenDashboard from "./pages/Canteen/dashboard.jsx";
import AdminDashboard from "./pages/Canteen/AdminDashboard.jsx";

// Booking
import BookingDashboard from "./pages/Booking/BookingDashboard.jsx";

// Academics
import { UserProvider } from "./pages/academics/UserContext.jsx";
import AcademicsLayout from "./pages/academics/AcademicsLayout.jsx";
import Marketplace from "./pages/academics/Marketplace.jsx";
import Vault from "./pages/academics/Vault.jsx";
import Inventory from "./pages/academics/Inventory.jsx";
import Settings from "./pages/academics/Settings.jsx";

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <GraduationCap className="h-8 w-8 text-indigo-500" />
            <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
              UniHub
            </span>
          </Link>

          <div className="flex gap-5">

            <Link to="/academics/marketplace">
              📚 Academics
            </Link>

            <Link to="/bookings">
              <CalendarDays className="inline h-4 w-4" /> Bookings
            </Link>

            <Link to="/print">
              🖨️ Print
            </Link>

            <Link to="/lost-found">
              <Inbox className="inline h-4 w-4" /> Lost & Found
            </Link>

            <Link to="/canteen">
              <Utensils className="inline h-4 w-4" /> Canteen
            </Link>

          </div>
        </div>
      </nav>

      <main className="flex-grow px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-zinc-500">
        © {new Date().getFullYear()} UniHub
      </footer>
    </div>
  );
}

function Home() {
  return (
    <div className="max-w-6xl mx-auto py-16 text-center">
      <h1 className="text-5xl font-bold mb-5">
        Welcome to UniHub
      </h1>

      <p className="text-zinc-400 mb-12">
        Select a module below.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

        <Link
          to="/academics/marketplace"
          className="border rounded-3xl p-8 hover:bg-zinc-900"
        >
          <h2>📚 Academics</h2>
          <ArrowRight className="mt-5" />
        </Link>

        <Link
          to="/bookings"
          className="border rounded-3xl p-8 hover:bg-zinc-900"
        >
          <h2>Bookings</h2>
          <ArrowRight className="mt-5" />
        </Link>

        <Link
          to="/print"
          className="border rounded-3xl p-8 hover:bg-zinc-900"
        >
          <h2>🖨️ Print</h2>
          <ArrowRight className="mt-5" />
        </Link>

        <Link
          to="/canteen"
          className="border rounded-3xl p-8 hover:bg-zinc-900"
        >
          <h2>Canteen</h2>
          <ArrowRight className="mt-5" />
        </Link>

        <Link
          to="/lost-found"
          className="border rounded-3xl p-8 hover:bg-zinc-900"
        >
          <h2>Lost & Found</h2>
          <ArrowRight className="mt-5" />
        </Link>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/canteen/admin"
            element={<AdminDashboard />}
          />

          <Route element={<AppLayout />}>

            <Route path="/" element={<Home />} />

            <Route
              path="/print"
              element={<PrintDashboard />}
            />

            <Route
              path="/bookings"
              element={<BookingDashboard />}
            />

            <Route
              path="/canteen"
              element={<CanteenDashboard />}
            />

            <Route
              path="/lost-found"
              element={<LostFound />}
            />

            <Route
              path="/academics"
              element={<AcademicsLayout />}
            >
              <Route
                path="marketplace"
                element={<Marketplace />}
              />
              <Route
                path="vault"
                element={<Vault />}
              />
              <Route
                path="inventory"
                element={<Inventory />}
              />
              <Route
                path="settings"
                element={<Settings />}
              />
            </Route>

          </Route>

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}