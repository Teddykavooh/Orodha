import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales, createSale } from '../features/sales/salesSlice';
import { fetchInventory } from '../features/inventory/inventorySlice';

// Shared Visual Layout UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { TrendingUpDownIcon, TrendingUpIcon } from "lucide-react";

/**
 * Sales page: displays sales from Redux store and allows all authenticated users to create sales.
 * 
 * Data flow:
 * - Fetches sales via Redux `fetchSales` thunk on mount
 * - Creates sales via `createSale` thunk with dialog modal
 * - Displays sales in reverse chronological order (most recent first)
 * 
 * Permissions:
 * - ADMIN: sees all sales
 * - MANAGER: sees sales for their hub
 * - MERCHANDISER: sees their own sales
 * 
 * UI:
 * - Dialog modal for creating new sales
 * - Card-based list of recent sales with timestamps
 * - Loading and error states displayed
 */

export default function Sales() {
  const dispatch = useDispatch();
  
  // Redux Selectors
  const sales = useSelector(state => state.sales.items);
  const salesStatus = useSelector(state => state.sales.status);
  const salesError = useSelector(state => state.sales.error);
  
  const inventory = useSelector(state => state.inventory.items);
  const inventoryStatus = useSelector(state => state.inventory.status);
  
  const authUser = useSelector(state => state.auth.user);

  // Component UI State Management
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [salePrice, setSalePrice] = useState("");

  // Fetch transaction data and active inventory logs on mount
  useEffect(() => {
    dispatch(fetchSales());
    dispatch(fetchInventory());
  }, [dispatch]);

  /**
   * Filtered Inventory Logic: Matches location parameters against auth rules
   */
  // console.log("Inventory: ", inventory);
  const availableInventory = inventory.filter((item) => {
    // console.log("Item: ", item);
    // Rule: Item cannot be marked as already sold
    if (item.status === "SOLD") return false;

    return true;
  });

  // Prepares checkout state parameters for selected item 
  function openSaleModal(item) {
    setSelectedItem(item);
    // Autofill with product base price if available in state configuration models
    setSalePrice(item.product_price || ""); 
    setIsOpen(true);
  }

  function handleCloseModal() {
    setIsOpen(false);
    setSelectedItem(null);
    setSalePrice("");
  }

  /**
   * Dispatches sale log creation payload to Django API
   */
  async function handleConfirmSale(e) {
    e.preventDefault();
    if (!salePrice || Number(salePrice) <= 0) {
      alert("Please provide a valid sale price.");
      return;
    }

    // Safety Prompt: Formats summary text inside a native confirm panel box
    const message = `Are you sure you want to finalize this sale?\n\n` +
                    `📦 Product: ${selectedItem.product_title}\n` +
                    `🔢 Serial: ${selectedItem.serial_number || "N/A"}\n` +
                    `💰 Final Price: KES ${Number(salePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n\n` +
                    `This action will instantly mark the item as SOLD and update the ledger.`;

    if (!window.confirm(message)) {
      return; // Stops execution immediately if the user clicks 'Cancel'
    }

    setLoading(true);
    try {
      await dispatch(createSale({
        bookItemId: selectedItem.id,
        salePrice: salePrice,
        bookItemSeller: authUser.id,
      })).unwrap();
      
      // Refresh local copy arrays to accurately clear out newly sold units
      dispatch(fetchInventory());
      handleCloseModal();
    } catch (err) {
      alert(err?.message || "Failed to process book sale transaction.");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-start gap-3 items-center border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sales
          </h1>
          {/* Large, custom-branded blue dashboard icon */}
          <TrendingUpIcon className="h-8 w-8 text-blue-600 transition-transform duration-200 hover:scale-110" />
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md border">
          Logged in as: <span className="font-semibold text-gray-700">{authUser?.username}</span> ({authUser?.role})
        </div>
      </div>

      {salesError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {salesError}
        </div>
      )}

      {/* SECTION 1: Available Inventory Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Available Products at Your Hub Location</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {inventoryStatus === "loading" && <p className="p-6 text-gray-500 text-center">Scanning inventory profiles...</p>}
          {inventoryStatus === "succeeded" && availableInventory.length === 0 && (
            <p className="p-6 text-gray-500 text-center text-sm">No items currently available for sale at your assigned hub location.</p>
          )}
          {inventoryStatus === "succeeded" && availableInventory.length > 0 && (
            <div className="w-full overflow-x-auto max-h-[24vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Assigned Hub</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product_title}</TableCell>
                      <TableCell className="font-mono text-sm">{item.serial_number || "-"}</TableCell>
                      <TableCell className="text-sm text-gray-600">{item.hub_name || "Warehouse"}</TableCell>
                      <TableCell className="text-sm text-gray-600">{item.product_price}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="default" onClick={() => openSaleModal(item)}>
                          Sell Item
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Final Processing Transaction Checkout Modal Dialog */}
      <Dialog isOpen={isOpen} onClose={handleCloseModal} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Sale Transaction</DialogTitle>
        </DialogHeader>
        {selectedItem && (
          <form onSubmit={handleConfirmSale} className="space-y-4">
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md text-sm space-y-1">
              <p className="text-gray-700"><span className="font-semibold text-gray-900">Product:</span> {selectedItem.product_title}</p>
              <p className="text-gray-500 font-mono text-xs"><span className="font-semibold text-gray-700">Serial:</span> {selectedItem.serial_number || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Sale Price (KES) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter agreed customer price"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Confirm & Post Sale"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      {/* SECTION 3: Historic Sale Logs Tracker Table */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Sales Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {salesStatus === 'loading' && <p className="text-gray-500 text-center py-6">Loading historic sales log records...</p>}
          {salesStatus === 'succeeded' && sales.length === 0 && (
            <p className="text-gray-500 text-center py-6 text-sm">No transaction records logged yet.</p>
          )}
          {salesStatus === 'succeeded' && sales.length > 0 && (
            <div className="w-full overflow-x-auto max-h-[24vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Item (ID)</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Item Title</TableHead>
                    <TableHead>Merchandiser (ID)</TableHead>
                    <TableHead>Merchandiser Name</TableHead>
                    <TableHead className="text-right">Settled Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...sales].reverse().map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs text-gray-600">#TRN-{s.id}</TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(s.sold_at)}</TableCell>
                      <TableCell className="text-sm">{s.book_item}</TableCell>
                      <TableCell className="text-sm">{s.book_serial}</TableCell>
                      <TableCell className="text-sm">{s.product_title}</TableCell>
                      <TableCell className="text-sm text-gray-600">{s.salesperson}</TableCell>
                      <TableCell className="text-sm text-gray-600">{s.salesperson_name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-700">KES {s.sale_price}</TableCell>
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
