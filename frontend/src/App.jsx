import React from 'react';
import BookingDashboard from './pages/Booking/BookingDashboard';
import './pages/Booking/BookingDashboard.css';

export default function App() {
  return (
    <div className="min-h-screen bg-[#06060e]">
      {/*  Direct mount of your premium animated booking coordinator */}
      <BookingDashboard />
    </div>
  );
}