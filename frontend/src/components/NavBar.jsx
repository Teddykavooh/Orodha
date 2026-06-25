import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { Button } from './ui/Button'

/**
 * NavBar: responsive navigation with conditional rendering based on auth state.
 * - For authenticated users: shows Dashboard, Users, Products, Sales links and Logout.
 * - For unauthenticated users: shows only logo and Login/Register buttons.
 * Uses Tailwind CSS for responsive styling with flexbox and hover effects.
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

  return (
    <nav className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Logo - always visible */}
      {user ? 
        (
          <>
            <Link to="/" className="font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
              {businessName}
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className="font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
              myBook
            </Link>
          </>
        )
      }
      
      {/* Navigation links - only visible when authenticated */}
      {user && (
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Dashboard
          </Link>
          <Link to="/hubs" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Hubs
          </Link>
          <Link to="/users" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Users
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Products
          </Link>
          <Link to="/inventory" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Inventory
          </Link>
          <Link to="/sales" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Sales
          </Link>
        </div>
      )}

      {/* Auth section */}
      <div className="hidden md:flex gap-3 items-center">
        {user ? (
          <>
            <span className="text-gray-900 font-semibold text-sm">{user.username}</span>
            <Button variant="outline" size="sm" onClick={() => {
              dispatch(logout());
              // redirect to login
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

      {/* Mobile Hamburger */}
      <button
        className="md:hidden text-2xl"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 px-6 py-4 space-y-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="block"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/hubs"
                className="block"
                onClick={() => setMobileOpen(false)}
              >
                Hubs
              </Link>

              <Link
                to="/users"
                className="block"
                onClick={() => setMobileOpen(false)}
              >
                Users
              </Link>

              <Link
                to="/products"
                className="block"
                onClick={() => setMobileOpen(false)}
              >
                Products
              </Link>

              <Link
                to="/inventory"
                className="block"
                onClick={() => setMobileOpen(false)}
              >
                Inventory
              </Link>

              <Link
                to="/sales"
                className="block"
                onClick={() => setMobileOpen(false)}
              >
                Sales
              </Link>

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">
                  {user.username}
                </p>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    dispatch(logout());
                    setMobileOpen(false);
                    // redirect to login
                    redirectToLogin();
                  }}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  variant="outline"
                  className="w-full"
                >
                  Login
                </Button>
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
              >
                <Button className="w-full">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
