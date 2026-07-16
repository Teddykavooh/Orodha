import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { Button } from "./ui/Button";
import { 
  LayoutDashboard, 
  Building2, 
  Users as UsersIcon, 
  BookOpen, 
  Package, 
  TrendingUp, 
  LogOut, 
  FileChartColumn
} from "lucide-react"; // Imported crisp structural icons

export default function Sidebar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const businessName = localStorage.getItem("business_name") || "myBook";
  // const businessLogoUrl = useSelector((state) => state.auth.logo) || "";
  const businessLogoUrl = localStorage.getItem("logo") || "";

  // console.log("Logo: ", businessLogoUrl);
  // console.log("Logo2: ", businessLogoUrl2);

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
        <div className="flex flex-col w-full border-b border-gray-200">
          {/* Extended Branded Logo Banner Header */}
          <div className="w-full h-24 bg-blue-600 flex items-center justify-center shadow-inner relative overflow-hidden">
            {/* Subtle Graphic Layer Accent to give the banner premium texture */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:16px_16px]" />
            {businessLogoUrl ? (
              /* 🖼️ Proportional Database Image Container */
              <div className="w-full h-full px-6 flex items-center justify-center relative z-10">
                <img
                  src={businessLogoUrl}
                  alt={`${businessName} Logo`}
                  /* 
                    object-contain: Guarantees the image scales proportionally without cropping.
                    max-h-16: Keeps the image from touching the edges and drowning the top bar area.
                  */
                  className="w-full max-h-16 object-contain filter drop-shadow-sm transition-transform duration-200 hover:scale-105"
                  onError={(e) => {
                    // Fallback safety handler if the image link breaks or returns 404
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              /* 🔤 Fallback Typography Logo (If no database image exists) */
              <span className="text-white font-black text-2xl tracking-widest uppercase relative z-10">
                LOGO
              </span>
            )}
          </div>

          {/* Business Workspace Title Link Tray */}
          <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between">
            <Link 
              to="/dashboard" 
              className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors truncate"
              title={businessName}
            >
              {businessName}
            </Link>
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="System Active" />
          </div>
        </div>

        {/* Navigation Link Stack */}
        <nav className="px-3 space-y-1 flex flex-col">
          <NavLink to="/dashboard" className={getLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/hubs" className={getLinkClass}>
            <Building2 className="h-4 w-4" />
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

          <NavLink to="/reports" className={getLinkClass}>
            <FileChartColumn className="h-4 w-4" />
            <span>Reports</span>
          </NavLink>
        </nav>
      </div>

      {/* User Information & Logout Button Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex flex-col space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Logged in as</p>
            <p className="text-sm font-medium text-blue-600 truncate">{user.username}</p>
            <p className="text-xs text-gray-500 font-mono">{user.role}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
          >
            {/* The icon inherits the text color automatically via 'currentColor' */}
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
