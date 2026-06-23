import React from "react";
import { Link } from "react-router-dom";
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

/**
 * Landing page: hero section with patterned background and call-to-action.
 * Links to register or login depending on user state.
 */
export default function Landing() {
  // console.log("1", import.meta.env.VITE_PROXY_TARGET || 'https://orodha-backend.vercel.app');
  // console.log("2", import.meta.env.VITE_PROXY_TARGET_CUSTOM || 'orodha-backend.vercel.app');
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Orodha</h1>
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

        <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200">
          <CardContent className="h-48 flex items-center justify-center text-gray-600 font-semibold text-lg">
            Patterned background section for hero design
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
