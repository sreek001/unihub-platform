import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookingDashboard from './pages/Booking/BookingDashboard';
import AdminDashboard from './pages/Booking/AdminDashboard';
import CanteenDashboard from './pages/Canteen/dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to the Student Booking Panel */}
        <Route path="/" element={<Navigate to="/bookings" replace />} />

        {/* 👥 Student View: Creating reservations & checking current status */}
        <Route path="/bookings" element={<BookingDashboard />} />

        {/* 👑 Admin View: Approving or rejecting pending system lines */}
        <Route path="/admin/bookings" element={<AdminDashboard />} />

        {/* Other Platform Features */}
        <Route path="/canteen" element={<CanteenDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;