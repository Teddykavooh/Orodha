import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, createProduct, deleteProduct } from '../features/products/productsSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog'

/**
 * Products page: displays products from Redux store and allows WHOLESALER_ADMIN to create/delete.
 * 
 * Data flow:
 * - Fetches products via Redux `fetchProducts` thunk on mount
 * - Creates products via `createProduct` thunk with dialog modal
 * - Deletes products via `deleteProduct` thunk with confirmation
 * 
 * UI:
 * - Card layout with product list
 * - Dialog modal for creating new products
 * - Destructive red button for delete action
 * - Loading and error states displayed
 */
export default function Products() {
  const dispatch = useDispatch()
  const products = useSelector(state => state.products.items)
  const productsStatus = useSelector(state => state.products.status)
  const productsError = useSelector(state => state.products.error)
  const authUser = useSelector(state => state.auth.user)

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch]);

  /**
   * Handle product creation via Redux thunk dispatch.
   */
  async function handleCreateProduct(e) {
    e.preventDefault();
    if (!name) {
      alert("Product name is required");
      return;
    }
    setLoading(true);
    try {
      const result = await dispatch(createProduct({ name, sku })).unwrap();
      setName("");
      setSku("");
      setIsOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle product deletion via Redux thunk dispatch.
   */
  async function handleDeleteProduct(id) {
    if (!window.confirm("Delete product? This action cannot be undone.")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
    } catch (err) {
      alert(err?.message || "Failed to delete product");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        {authUser?.role === "WHOLESALER_ADMIN" && (
          <Button onClick={() => setIsOpen(true)} disabled={productsStatus === 'loading'}>
            Add Product
          </Button>
        )}
      </div>

      {/* Error message display */}
      {productsError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {productsError}
        </div>
      )}

      {/* Create product dialog modal */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Widget Pro"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g., SKU-12345"
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Products list */}
      <Card>
        <CardContent className="pt-6">
          {productsStatus === 'loading' && <p className="text-gray-500 text-center py-6">Loading products...</p>}
          {productsStatus === 'succeeded' && products.length === 0 && (
            <p className="text-gray-500 text-center py-6">No products yet.</p>
          )}
          {productsStatus === 'succeeded' && products.length > 0 && (
            <ul className="space-y-2">
              {products.map((p) => (
                <li key={p.id} className="flex justify-between items-center p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.sku && <p className="text-sm text-gray-500">SKU: {p.sku}</p>}
                  </div>
                  {authUser?.role === "WHOLESALER_ADMIN" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(p.id)}
                    >
                      Delete
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
