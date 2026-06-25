import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; // 🔑 Added NavLink import
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { Button } from './ui/Button'

/**
 * NavBar: responsive navigation with conditional rendering and active link tracking.
 */
export default function NavBar() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const businessName = localStorage.getItem("business_name") || "myBook"

  function redirectToLogin() {
    localStorage.removeItem("business_name")
    navigate("/login")
  }

  // 🛠️ Reusable styling function for tracking and applying active classes
  const getNavLinkClass = ({ isActive }) => {
    return `text-sm font-medium transition-colors py-1 border-b-2 ${
      isActive 
        ? "text-blue-600 border-blue-600 font-semibold" // Active State (Blue Text + Bottom Indicator Line)
        : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300" // Idle State
    }`;
  };

  const getMobileNavLinkClass = ({ isActive }) => {
    return `block text-base font-medium p-2 rounded-md transition-colors ${
      isActive 
        ? "bg-blue-50 text-blue-700 font-semibold" // Active Mobile State (Light Blue Background Fill)
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900" // Idle Mobile State
    }`;
  };

  return (
    <nav className="bg-white border-b border-gray-300 px-6 py-4 flex flex-col md:flex-row justify-between items-stretch md:items-center shadow-sm relative">
      <div className="flex justify-between items-center w-full md:w-auto">
        {/* Logo - always visible */}
        <Link to="/" className="font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
          {user ? businessName : "myBook"}
        </Link>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 text-2xl focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>
      
      {/* Desktop Navigation links */}
      {user && (
        <div className="hidden md:flex gap-6 items-center">
          <NavLink to="/dashboard" className={getNavLinkClass}>Dashboard</NavLink>
          <NavLink to="/hubs" className={getNavLinkClass}>Hubs</NavLink>
          <NavLink to="/users" className={getNavLinkClass}>Users</NavLink>
          <NavLink to="/products" className={getNavLinkClass}>Products</NavLink>
          <NavLink to="/inventory" className={getNavLinkClass}>Inventory</NavLink>
          <NavLink to="/sales" className={getNavLinkClass}>Sales</NavLink>
        </div>
      )}

      {/* Desktop Auth section */}
      <div className="hidden md:flex gap-3 items-center">
        {user ? (
          <>
            <span className="text-gray-900 font-semibold text-sm">{user.username}</span>
            <Button variant="outline" size="sm" onClick={() => {
              dispatch(logout());
              redirectToLogin();
            }}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Panel Layer */}
      {mobileOpen && (
        <div className="md:hidden w-full border-t border-gray-200 mt-4 pt-4 space-y-2 animate-in fade-in duration-200">
          {user ? (
            <>
              <NavLink to="/dashboard" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
              <NavLink to="/hubs" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>Hubs</NavLink>
              <NavLink to="/users" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>Users</NavLink>
              <NavLink to="/products" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>Products</NavLink>
              <NavLink to="/inventory" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>Inventory</NavLink>
              <NavLink to="/sales" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>Sales</NavLink>

              <div className="pt-4 border-t border-gray-200 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">
                  Logged in as: {user.username}
                </p>
                <Button
                  className="w-full mt-1"
                  variant="outline"
                  onClick={() => {
                    dispatch(logout());
                    setMobileOpen(false);
                    redirectToLogin();
                  }}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
