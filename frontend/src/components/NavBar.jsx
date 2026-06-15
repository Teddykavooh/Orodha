import React from "react";
import { Link } from "react-router-dom";
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
  const user = useSelector(state => state.auth.user)
  const dispatch = useDispatch()

  return (
    <nav className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Logo - always visible */}
      <Link to="/" className="font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
        Orodha
      </Link>

      {/* Navigation links - only visible when authenticated */}
      {user && (
        <div className="flex gap-8 items-center">
          <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Dashboard
          </Link>
          <Link to="/users" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Users
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Products
          </Link>
          <Link to="/sales" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Sales
          </Link>
        </div>
      )}

      {/* Auth section */}
      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <span className="text-gray-900 font-semibold text-sm">{user.username}</span>
            <Button variant="outline" size="sm" onClick={() => dispatch(logout())}>
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
    </nav>
  );
}
