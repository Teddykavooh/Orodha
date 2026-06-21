import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchSales } from '../features/sales/salesSlice'
import { fetchUsers } from '../features/users/usersSlice'
import { fetchProducts } from '../features/products/productsSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

/**
 * Dashboard: displays KPI cards (total sales, active users, products) and recent sales.
 * 
 * Data flow:
 * - Fetches sales, users, products via Redux thunks on mount
 * - Calculates KPI metrics from store data
 * - Displays loading states while fetching
 * 
 * KPIs shown:
 * - Total Sales: count of all sales records
 * - Active Users: count of users in the system
 * - Total Products: count of products in inventory
 * 
 * Recent Sales:
 * - Shows last 5 sales with timestamps (most recent first)
 */
export default function Dashboard() {
  const dispatch = useDispatch()
  const sales = useSelector(state => state.sales.items)
  const salesStatus = useSelector(state => state.sales.status)
  const users = useSelector(state => state.users.items)
  const usersStatus = useSelector(state => state.users.status)
  const products = useSelector(state => state.products.items)
  const productsStatus = useSelector(state => state.products.status)

  // console.log("My token: ", localStorage.getItem("token"))
  // console.log("My domain dashboard: ", localStorage.getItem("tenant_domain"))

  // Fetch all data on component mount
  useEffect(() => {
    dispatch(fetchSales())
    dispatch(fetchUsers())
    dispatch(fetchProducts())
  }, [dispatch])

  /**
   * Format date for display (ISO string to readable format).
   */
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleString()
    return new Date(dateString).toLocaleString()
  }

  // Get recent sales (last 5)
  const recentSales = sales.slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sales Card */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900">
              {salesStatus === 'loading' ? '-' : sales.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">sales records</p>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Active Users</p>
            <p className="text-3xl font-bold text-gray-900">
              {usersStatus === 'loading' ? '-' : users.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">users in system</p>
          </CardContent>
        </Card>

        {/* Total Products Card */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">
              {productsStatus === 'loading' ? '-' : products.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">products in inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {salesStatus === 'loading' && (
            <div className="text-gray-500 text-center py-8">Loading sales...</div>
          )}
          {salesStatus === 'succeeded' && recentSales.length === 0 && (
            <div className="text-gray-500 text-center py-8">No sales yet.</div>
          )}
          {salesStatus === 'succeeded' && recentSales.length > 0 && (
            <ul className="space-y-2">
              {recentSales.map((s) => (
                <li key={s.id} className="p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.note || "(no note)"}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(s.created_at)}</p>
                    </div>
                    {s.total && (
                      <p className="text-sm font-semibold text-gray-900">{s.total}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
