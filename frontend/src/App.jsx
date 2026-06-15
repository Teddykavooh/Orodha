import React from "react";
import { Routes, Route } from "react-router-dom";
// Redux store provides auth state
import NavBar from "./components/NavBar";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Sales from "./pages/Sales";

// App sets up Auth context and routes. Keep routes simple for MVP.
export default function App() {
  return (
    <>
      <NavBar />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
        </Routes>
      </main>
    </>
  );
}
