import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { Button } from "./ui/Button";
import { 
  LayoutDashboard, 
  Layers, 
  Users as UsersIcon, 
  BookOpen, 
  Package, 
  TrendingUp, 
  LogOut 
} from "lucide-react"; // Imported crisp structural icons

export default function Sidebar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const businessName = localStorage.getItem("business_name") || "myBook";

  function handleLogout() {
    dispatch(logout());
    localStorage.removeItem("business_name");
    navigate("/login");
  }

  // Active state style handler for sidebar item links
  const getLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700 font-semibold shadow-sm border-l-4 border-blue-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  // Only show the sidebar if the user is logged in
  if (!user) return null;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-300 flex flex-col justify-between hidden md:flex sticky top-0">
      <div className="flex flex-col space-y-6">
        {/* Workspace Brand Title Box */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <Link to="/dashboard" className="font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
            {businessName}
          </Link>
        </div>

        {/* Navigation Link Stack */}
        <nav className="px-3 space-y-1 flex flex-col">
          <NavLink to="/dashboard" className={getLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/hubs" className={getLinkClass}>
            <Layers className="h-4 w-4" />
            <span>Hubs</span>
          </NavLink>

          <NavLink to="/users" className={getLinkClass}>
            <UsersIcon className="h-4 w-4" />
            <span>Users</span>
          </NavLink>

          <NavLink to="/products" className={getLinkClass}>
            <BookOpen className="h-4 w-4" />
            <span>Products</span>
          </NavLink>

          <NavLink to="/inventory" className={getLinkClass}>
            <Package className="h-4 w-4" />
            <span>Inventory</span>
          </NavLink>

          <NavLink to="/sales" className={getLinkClass}>
            <TrendingUp className="h-4 w-4" />
            <span>Sales Desk</span>
          </NavLink>
        </nav>
      </div>

      {/* User Information & Logout Button Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex flex-col space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Logged in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
            <p className="text-xs text-gray-500 font-mono">{user.role}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
