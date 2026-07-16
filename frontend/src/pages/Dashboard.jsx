import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchSales } from '../features/sales/salesSlice'
import { fetchUsers } from '../features/users/usersSlice'
import { fetchProducts } from '../features/products/productsSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/Table";
import { Select, SelectOption } from "../components/ui/Select"
import { LayoutDashboard, TrendingUp, Users, BookOpen, BarChart3, Building2, Calendar } from "lucide-react"; // Imported crisp structural icons
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts'
import { subDays, startOfDay, parseISO, isAfter } from 'date-fns'

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

  // Local UI Filter State
  const [timeRange, setTimeRange] = useState('all') // Options: 'today', 'all', '7days', '30days'

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

  // Memoized Filtering & Aggregation Pipeline
  const analyticsData = useMemo(() => {
    // Return early with empty structures if data hasn't loaded yet
    if (!sales || !sales.length) {
      return { filteredSalesCount: 0, merchandisers: [], hubs: [], products: [] }
    }

    // A. Apply Dropdown Time Filters
    let filteredSales = [...sales]
    if (timeRange !== 'all') {
      let cutoffDate;

      switch (timeRange) {
        case "today":
          cutoffDate = startOfDay(new Date());
          break;

        case "7days":
          cutoffDate = startOfDay(subDays(new Date(), 7));
          break;

        case "30days":
          cutoffDate = startOfDay(subDays(new Date(), 30));
          break;

        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
      
        filteredSales = sales.filter(sale => {
          if (!sale.sold_at) return false
          try {
            const saleDate = parseISO(sale.sold_at)
            return isAfter(saleDate, cutoffDate)
          } catch (e) {
            return false
          }
        })
      }
    }

    // B. Instantiate Hash Tables for Aggregations
    const agentMap = {}
    const hubMap = {}
    const productMap = {}

    // C. Process Calculations Loop
    filteredSales.forEach(sale => {
      const price = Number(sale.sale_price) || 0
      
      // Grouping by Merchandiser Name
      const agentName = sale.salesperson_name || `Agent #${sale.salesperson}`
      if (!agentMap[agentName]) {
        agentMap[agentName] = { name: agentName, revenue: 0, count: 0 }
      }
      agentMap[agentName].revenue += price
      agentMap[agentName].count += 1

      // Grouping by Operating Hub
      const matchedUser = users.find(u => u.id === sale.salesperson)
      const hubName = matchedUser?.hub_name || sale.hub_name || "Direct / Independent"
      if (!hubMap[hubName]) {
        hubMap[hubName] = { name: hubName, revenue: 0, count: 0 }
      }
      hubMap[hubName].revenue += price
      hubMap[hubName].count += 1

      // Grouping by Product Title Velocity
      const itemTitle = sale.product_title || "Unknown Item"
      if (!productMap[itemTitle]) {
        productMap[itemTitle] = { title: itemTitle, revenue: 0, count: 0 }
      }
      productMap[itemTitle].revenue += price
      productMap[itemTitle].count += 1
    })

    // D. Convert to Arrays, Sort Descending, and Extract Top 5 Performance Arrays
    return {
      filteredSalesCount: filteredSales.length,
      merchandisers: Object.values(agentMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      hubs: Object.values(hubMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      products: Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 5)
    }
  }, [sales, users, timeRange])

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

      {/* Dynamic Dropdown Filter Panel */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
        <Calendar className="h-4 w-4 text-gray-500" />

        <span className="text-xs font-medium text-gray-600">
          Filter Window:
        </span>

        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-[160px] h-8 text-xs border-0 bg-transparent shadow-none focus:ring-0"
        >

          <SelectOption value="today">
            Today
          </SelectOption>

          <SelectOption value="7days">
            Last 7 Days
          </SelectOption>

          <SelectOption value="30days">
            Last 30 Days
          </SelectOption>

          <SelectOption value="all">
            All Time Ledger
          </SelectOption>

        </Select>
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

      {/* Analytics Visual Charts Track Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph Card A: Highest Performing Merchandisers */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />Top Performance Merchandisers
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Highest revenue producers by KES sales generation
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {salesStatus === "loading" ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                Computing ledger trends...
              </div>
            ) : analyticsData.merchandisers.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                No data for selected range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.merchandisers}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `KES ${Number(value).toLocaleString()}`,
                      "Total Revenue",
                    ]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {analyticsData.merchandisers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#3B82F6" : "#93C5FD"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Graph Card B: Regional Hub Aggregations */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Regional Hub Performance
              </CardTitle>

              <p className="text-sm text-gray-500 mt-1">
                Revenue generated by operational hubs
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {salesStatus === "loading" ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Computing regional performance...
              </div>
            ) : analyticsData.hubs.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hub data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.hubs}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `KES ${Number(value).toLocaleString()}`,
                      "Hub Revenue",
                    ]}
                    labelFormatter={(label) => `Hub: ${label}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {analyticsData.hubs.map((hub, index) => (
                      <Cell
                        key={hub.name}
                        fill={
                          index === 0
                            ? "#059669"
                            : index === 1
                            ? "#10B981"
                            : "#6EE7B7"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Grid Row Splitter Section: Recent Ledger Rows vs Velocity Movers */}

        {/* Recent Transaction Tables */}

        {/* Catalog Items Velocity Ranking */}
      </div>

      {/* Top Selling Products */}
      <Card className="shadow-sm border-gray-200 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Top Selling Products
          </CardTitle>

          <p className="text-sm text-gray-500">
            Products ranked by units sold
          </p>
        </CardHeader>

        <CardContent>
          {salesStatus === "loading" ? (
            <div className="h-56 flex items-center justify-center text-gray-500">
              Calculating product performance...
            </div>
          ) : analyticsData.products.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-500">
              No sales recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {analyticsData.products.map((product, index) => (
                <div
                  key={product.title}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                            ? "bg-gray-200 text-gray-700"
                            : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.title}
                      </p>

                      <p className="text-xs text-gray-500">
                        KES {product.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                      {product.count}
                    </p>

                    <p className="text-xs text-gray-500">
                      sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
