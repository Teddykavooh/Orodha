// components/AppLayout.jsx
import React from "react";
import Sidebar from "./SideBar";
import NavBar from "./NavBar";
import { useSelector } from "react-redux";

export default function AppLayout({ children }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans antialiased">
      {/* 1. Fixed Left Sidebar (Hidden on mobile automatically via 'hidden md:flex') */}
      {user && <Sidebar />}

      {/* 2. Main Right Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (Acts as your mobile menu controller and desktop utilities box) */}
        
        <NavBar />
        
        {/* Render actual page views inside a padded responsive dashboard container */}
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
