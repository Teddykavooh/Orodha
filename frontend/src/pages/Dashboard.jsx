import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchSales } from '../features/sales/salesSlice'
import { fetchUsers } from '../features/users/usersSlice'
import { fetchProducts } from '../features/products/productsSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/Table";
import { LayoutDashboard, TrendingUp, Users, BookOpen } from "lucide-react"; // Imported crisp structural icons

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
      <div className="flex justify-start gap-3 items-center border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        {/* Large, custom-branded blue dashboard icon */}
        <LayoutDashboard className="h-8 w-8 text-blue-600 transition-transform duration-200 hover:scale-110" />
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sales Card */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {salesStatus === 'loading' ? '-' : sales.length}
                </p>
              </div>
              {/* Green Colored Badge Indicator Container */}
              {/* <div className="p-3 bg-green-50 rounded-lg text-green-600 border border-green-100 shadow-sm"> */}
              <div className="p-5 bg-green-50 rounded-xl text-green-600 border border-green-100 shadow-sm flex items-center justify-center">
                <TrendingUp className="h-10 w-10" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <span className="font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">Live</span>
              sales records logged
            </p>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {usersStatus === 'loading' ? '-' : users.length}
                </p>
              </div>
              {/* Blue Colored Badge Indicator Container */}
              <div className="p-5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 shadow-sm flex items-center justify-center">
                <Users className="h-10 w-10" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              registered accounts in system
            </p>
          </CardContent>
        </Card>

        {/* Total Products Card */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {productsStatus === 'loading' ? '-' : products.length}
                </p>
              </div>
              {/* Indigo/Purple Colored Badge Indicator Container */}
              <div className="p-5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 shadow-sm flex items-center justify-center">
                <BookOpen className="h-10 w-10" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              products mapped in catalog
            </p>
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
                    <TableHead>Merchandiser</TableHead>
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
                      
                      {/* Displaying readable Merchandiser string reference */}
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
