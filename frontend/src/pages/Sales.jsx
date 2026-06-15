import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchSales, createSale } from '../features/sales/salesSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog'

/**
 * Sales page: displays sales from Redux store and allows all authenticated users to create sales.
 * 
 * Data flow:
 * - Fetches sales via Redux `fetchSales` thunk on mount
 * - Creates sales via `createSale` thunk with dialog modal
 * - Displays sales in reverse chronological order (most recent first)
 * 
 * Permissions:
 * - WHOLESALER_ADMIN: sees all sales
 * - SALES_MANAGER: sees sales for their hub
 * - SALESPERSON: sees their own sales
 * 
 * UI:
 * - Dialog modal for creating new sales
 * - Card-based list of recent sales with timestamps
 * - Loading and error states displayed
 */
export default function Sales() {
  const dispatch = useDispatch()
  const sales = useSelector(state => state.sales.items)
  const salesStatus = useSelector(state => state.sales.status)
  const salesError = useSelector(state => state.sales.error)

  const [note, setNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch sales on component mount
  useEffect(() => {
    dispatch(fetchSales())
  }, [dispatch]);

  /**
   * Handle sale creation via Redux thunk dispatch.
   */
  async function handleCreateSale(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(createSale({ note })).unwrap();
      setNote("");
      setIsOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to create sale");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Format date for display (ISO string to readable format).
   */
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleString();
    return new Date(dateString).toLocaleString();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
        <Button onClick={() => setIsOpen(true)} disabled={salesStatus === 'loading'}>
          New Sale
        </Button>
      </div>

      {/* Error message display */}
      {salesError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {salesError}
        </div>
      )}

      {/* Create sale dialog modal */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note / Reference</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Sale note or reference (optional)"
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Sale"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Recent sales list */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {salesStatus === 'loading' && <p className="text-gray-500 text-center py-6">Loading sales...</p>}
          {salesStatus === 'succeeded' && sales.length === 0 && (
            <p className="text-gray-500 text-center py-6">No sales yet.</p>
          )}
          {salesStatus === 'succeeded' && sales.length > 0 && (
            <ul className="space-y-3">
              {sales.map((s) => (
                <li key={s.id} className="p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <p className="text-xs text-gray-500 mb-1">{formatDate(s.created_at)}</p>
                  <p className="text-gray-900 font-medium">{s.note || "(no note)"}</p>
                  {s.total && <p className="text-sm text-gray-600 mt-1">Total: {s.total}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
