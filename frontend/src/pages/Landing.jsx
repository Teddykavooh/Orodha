import React from "react";
import { Link } from "react-router-dom";
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

/**
 * Landing page: hero section with patterned background and call-to-action.
 * Links to register or login depending on user state.
 */
export default function Landing() {
  // console.log("1", import.meta.env.VITE_PROXY_TARGET || 'https://mybook-backend.vercel.app');
  // console.log("2", import.meta.env.VITE_PROXY_TARGET_CUSTOM || 'mybook-backend.vercel.app');
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">myBook</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide">
            <i>Ufanisi wa Kiratiba,</i> <span className="text-blue-600 italic font-serif font-medium">Utaratibu Sahihi.</span>
          </h2>
          <p className="text-xl text-gray-600">Wholesale inventory and sales management made simple.</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg">Register</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">Login</Button>
          </Link>
        </div>

        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-indigo-950 text-white shadow-xl">
          {/* Subtle Aesthetic Geometric CSS Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* Glowing Radial Anchor Orbs */}
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

          <CardContent className="relative z-10 min-h-48 py-8 px-6 flex flex-col items-center justify-center text-center space-y-4">
            {/* Dynamic Real-Time Time Greeting Block */}
            <div className="text-xs font-bold tracking-widest uppercase text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/50">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return "☀️ Good Morning";
                if (hour < 17) return "🌤️ Good Afternoon";
                return "🌙 Good Evening";
              })()} & Welcome to myBook
            </div>

            {/* Cyclical or Elegant Quote Workspace */}
            <div className="max-w-xl space-y-2">
              <p className="text-xl md:text-2xl font-medium italic font-serif leading-relaxed text-slate-100">
                "Efficiency is doing things right; effectiveness is doing the right things."
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                — Peter Drucker
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-tenant</h3>
              <p className="text-sm text-gray-600">Manage multiple wholesalers and warehouses.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-based</h3>
              <p className="text-sm text-gray-600">Admin, Manager, and Salesperson roles.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time</h3>
              <p className="text-sm text-gray-600">Live inventory and sales tracking.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
