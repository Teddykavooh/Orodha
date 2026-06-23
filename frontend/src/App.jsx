import React, { useEffect } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// Redux store provides auth state
import NavBar from "./components/NavBar";
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
    return <div className="text-gray-500">Loading...</div>;
  }

  if (!token || (!user && status === "failed")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// App sets up Auth context and routes. Keep routes simple for MVP.
export default function App() {
  const dispatch = useDispatch();
  const { token, user, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user && status !== "loading") {
      dispatch(fetchMe());
    }
  }, [dispatch, status, token, user]);

  return (
    <>
      <NavBar />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/hubs" element={<ProtectedRoute><Hubs /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}
