import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Button } from './ui/Button';

import { 
  LayoutDashboard, 
  Layers, 
  Users as UsersIcon, 
  BookOpen, 
  Package, 
  TrendingUp, 
  LogOut,
  LogIn,
  UserPlus,
  FileChartColumn
} from "lucide-react";

/**
 * NavBar: Responsive navigation with adaptive desktop visibility logic.
 */
export default function NavBar() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const businessName = localStorage.getItem("business_name") || "myBook";
  
  const businessLogoUrl = useSelector(state => state.auth.user?.organisation_logo || null);

  function redirectToLogin() {
    localStorage.removeItem("business_name");
    navigate("/login");
  }

  const getNavLinkClass = ({ isActive }) => {
    return `flex items-center gap-2 text-sm font-medium transition-colors py-1 border-b-2 ${
      isActive 
        ? "text-blue-600 border-blue-600 font-semibold" 
        : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300" 
    }`;
  };

  const getMobileNavLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 text-base font-medium p-2 rounded-md transition-colors ${
      isActive 
        ? "bg-blue-50 text-blue-700 font-semibold" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900" 
    }`;
  };

  return (
    /* 
      🔑 THE VISIBILITY FIX: 
      - If a user is logged in, 'md:hidden' hides this navbar on desktop (relying on Sidebar).
      - If no user is logged in, the navbar remains visible on ALL screens (including desktop).
    */
    <nav className={`bg-white border-b border-gray-300 px-6 py-3 flex flex-col md:flex-row justify-between items-stretch md:items-center shadow-sm relative z-50 w-full ${
      user ? "md:hidden" : ""
    }`}>
      <div className="flex justify-between items-center w-full md:w-auto">
        
        {/* Logo and Brand Link */}
        <Link to="/" className="flex items-center gap-2.5 group">
          {businessLogoUrl ? (
            <img
              src={businessLogoUrl}
              alt="Logo"
              className="h-8 max-w-[120px] object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm tracking-tighter">
              {user ? businessName.charAt(0).toUpperCase() : "mB"}
            </div>
          )}
          
          <span className="font-bold text-xl text-gray-900 tracking-tight transition-colors group-hover:text-blue-600">
            {user ? businessName : "myBook"}
          </span>
        </Link>

        {/* Mobile Hamburger Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 text-2xl focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>
      
      {/* Desktop Navigation Links (Only displays for authenticated mobile views via master conditional) */}
      {user && (
        <div className="hidden md:flex gap-6 items-center">
          <NavLink to="/dashboard" className={getNavLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/hubs" className={getNavLinkClass}>
            <Layers className="h-4 w-4" />
            <span>Hubs</span>
          </NavLink>
          <NavLink to="/users" className={getNavLinkClass}>
            <UsersIcon className="h-4 w-4" />
            <span>Users</span>
          </NavLink>
          <NavLink to="/products" className={getNavLinkClass}>
            <BookOpen className="h-4 w-4" />
            <span>Products</span>
          </NavLink>
          <NavLink to="/inventory" className={getNavLinkClass}>
            <Package className="h-4 w-4" />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/sales" className={getNavLinkClass}>
            <TrendingUp className="h-4 w-4" />
            <span>Sales</span>
          </NavLink>
          <NavLink to="/reports" className={getNavLinkClass}>
            <FileChartColumn className="h-4 w-4" />
            <span>Reports</span>
          </NavLink>
        </div>
      )}

      {/* Desktop Auth Actions Section (Visible on desktop for guests) */}
      <div className="hidden md:flex gap-3 items-center">
        {user ? (
          <>
            <span className="text-blue-600 font-semibold text-sm mr-2">{user.username}</span>
            <Button
              variant="outline"
              size="sm" 
              onClick={() => {
                dispatch(logout());
                redirectToLogin();
              }}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Overlay Navigation Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden w-full border-t border-gray-200 mt-3 pt-3 space-y-1 animate-in fade-in duration-200">
          {user ? (
            <>
              <NavLink to="/dashboard" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/hubs" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                <Layers className="h-4 w-4" />
                <span>Hubs</span>
              </NavLink>
              <NavLink to="/users" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                <UsersIcon className="h-4 w-4" />
                <span>Users</span>
              </NavLink>
              <NavLink to="/products" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                <BookOpen className="h-4 w-4" />
                <span>Products</span>
              </NavLink>
              <NavLink to="/inventory" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                <Package className="h-4 w-4" />
                <span>Inventory</span>
              </NavLink>
              <NavLink to="/sales" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                <TrendingUp className="h-4 w-4" />
                <span>Sales</span>
              </NavLink>
              <NavLink to="/reports" className={getMobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                <FileChartColumn className="h-4 w-4" />
                <span>Reports</span>
              </NavLink>

              <div className="pt-4 border-t border-gray-200 mt-3 px-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Logged in as: <span className="text-blue-600 font-bold lowercase">{user.username}</span>
                </p>
                <Button
                  className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                  variant="outline"
                  onClick={() => {
                    dispatch(logout());
                    setMobileOpen(false);
                    redirectToLogin();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
