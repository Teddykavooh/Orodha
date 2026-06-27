import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { tenantApi } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { FileText, TrendingUp, BarChart3, FileChartColumn } from "lucide-react";

export default function Reports() {
  const authUser = useSelector((state) => state.auth.user);
  const hubs = useSelector((state) => state.hubs.items);
  const users = useSelector((state) => state.users.items);

  // Filter States
  const [selectedHub, setSelectedHub] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Data State
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchGeneratedReport() {
    setLoading(true);
    try {
      // Assemble structured URL query properties matching backend param requirements
      const params = new URLSearchParams();
      if (selectedHub) params.append("hub_id", selectedHub);
      if (selectedAgent) params.append("merchandiser_id", selectedAgent);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await tenantApi.get(`/sales/reporting/?${params.toString()}`);
      setReportData(res.data);
    } catch (err) {
      alert("Failed to compute reporting statistics.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run report initialization on mount
  useEffect(() => {
    fetchGeneratedReport();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header Layout Block */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Reports</h1>
        <FileChartColumn className="h-8 w-8 text-blue-600" />
      </div>

      {/* FILTER CONTROL BAR CONTAINER PANEL */}
      <Card className="bg-white border-gray-200">
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Conditional Admin Hub Filter Control Select Menu */}
          {authUser?.role === "ADMIN" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hub Location</label>
              <select value={selectedHub} onChange={(e) => setSelectedHub(e.target.value)} className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Hubs</option>
                {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Merchandiser Agent</label>
            <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Staff</option>
              {users.filter(u => u.role === "MERCHANDISER").map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end">
            <Button onClick={fetchGeneratedReport} disabled={loading}>
              {loading ? "Calculating Summary..." : "Apply Filters & Update"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RENDER REPORT RESULTS STATS BLOCK */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-gray-500 uppercase">Gross Revenue Balance</CardTitle></CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-4xl font-extrabold text-gray-900">
                KES {Number(reportData.summary.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className="p-3 bg-green-50 rounded-xl text-green-600"><TrendingUp className="h-6 w-6" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-gray-500 uppercase">Volume Distributed</CardTitle></CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-4xl font-extrabold text-gray-900">{reportData.summary.total_items_sold} units</span>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><BarChart3 className="h-6 w-6" /></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EXPORT ACTION LOGISTICS TRACER BUTTONS ROW */}
      {reportData && (
        <div className="flex flex-wrap gap-3 items-center justify-start bg-gray-100 p-3 rounded-xl border border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 px-2">
            Export Ledger Archive:
          </span>
          
          {/* CSV Download Trigger Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const base = import.meta.env.VITE_PROXY_TARGET || 'https://vercel.app';
              const token = localStorage.getItem("token");
              // Package your current state active dropdown options directly into an out-of-band link
              window.open(`${base}/api/sales/reporting/?format=csv&hub_id=${selectedHub}&merchandiser_id=${selectedAgent}&start_date=${startDate}&end_date=${endDate}&token=${token}`, "_blank");
            }}
            className="bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
          >
            <span>📥 Download Excel / CSV</span>
          </Button>

          {/* PDF Download Trigger Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const base = import.meta.env.VITE_PROXY_TARGET || 'https://vercel.app';
              const token = localStorage.getItem("token");
              window.open(`${base}/api/sales/reporting/?format=pdf&hub_id=${selectedHub}&merchandiser_id=${selectedAgent}&start_date=${startDate}&end_date=${endDate}&token=${token}`, "_blank");
            }}
            className="bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          >
            <span>📄 Download Print PDF</span>
          </Button>
        </div>
      )}
    </div>
  );
}
