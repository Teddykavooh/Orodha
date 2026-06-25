import React, { useEffect } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AppLayout from "./components/AppLayout"; // Imported layout wrapper containing sidebar
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Hubs from "./pages/Hubs";
import Inventory from "./pages/Inventory";
import { fetchMe } from "./features/auth/authSlice";

function ProtectedRoute({ children }) {
  const { token, user, status } = useSelector((state) => state.auth);

  if (token && !user && status !== "failed") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 font-medium">
        Loading user workspace profile...
      </div>
    );
  }

  if (!token || (!user && status === "failed")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token, user, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user && status !== "loading") {
      dispatch(fetchMe());
    }
  }, [dispatch, status, token, user]);

  return (
    <AppLayout>
      <Routes>
        {/* Unauthenticated Public Guest Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Authenticated Application Workspace Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/hubs" element={<ProtectedRoute><Hubs /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      </Routes>
    </AppLayout>
  );
}
