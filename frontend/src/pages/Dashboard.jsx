import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchSales } from '../features/sales/salesSlice'
import { fetchUsers } from '../features/users/usersSlice'
import { fetchProducts } from '../features/products/productsSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/Table";

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
            <div className="w-full overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Product Item</TableHead>
                    <TableHead>Salesperson Agent</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...recentSales].map((s) => (
                    <TableRow key={s.id}>
                      {/* Receipt Identification Code Column */}
                      <TableCell className="font-mono text-xs text-gray-500">
                        #REC-{s.id}
                      </TableCell>
                      
                      {/* Timestamp Column */}
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(s.sold_at)}
                      </TableCell>
                      
                      {/* Displaying Product Title Text alongside structural ID reference */}
                      <TableCell className="text-sm">
                        <div className="font-medium text-gray-900">
                          {s.product_title || "Unknown Product"}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          ID: #{s.book_item}
                        </div>
                      </TableCell>
                      
                      {/* Displaying readable Salesperson string reference */}
                      <TableCell className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          {s.salesperson_name || "System Agent"}
                        </span>
                        <span className="text-xs text-gray-400 font-mono block">
                          Profile Key: #{s.salesperson}
                        </span>
                      </TableCell>
                      
                      {/* Settled Price and Currency Column */}
                      <TableCell className="text-right font-semibold text-green-700 whitespace-nowrap">
                        KES {Number(s.sale_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
