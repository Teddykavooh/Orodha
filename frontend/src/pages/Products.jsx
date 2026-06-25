import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, createProduct, deleteProduct, updateProduct } from '../features/products/productsSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/Table";

/**
 * Products page: displays products from Redux store and allows ADMIN to create/delete.
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

  // Form Field States
  const [isbn, setIsbn] = useState("")
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("")
  const [base_price, setBasePrice] = useState("")
  
  // UI Flow Control States
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null) // Corrected: Added missing state tracking

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch]);

  // Open modal in fresh "Create" configuration
  function openCreateModal() {
    setEditingProduct(null)
    setIsbn("")
    setTitle("")
    setAuthor("")
    setCategory("")
    setBasePrice("")
    setIsOpen(true)
  }

  // Open modal pre-populated in "Edit" configuration
  function openEditModal(product) {
    setEditingProduct(product)
    setIsbn(product.isbn || "")
    setTitle(product.title || "")
    setAuthor(product.author || "")
    setCategory(product.category || "")
    setBasePrice(product.base_price || "")
    setIsOpen(true)
  }

  // Close modal and clear form variables
  function handleCloseModal() {
    setIsOpen(false)
    setEditingProduct(null)
    setIsbn("")
    setTitle("")
    setAuthor("")
    setCategory("")
    setBasePrice("")
  }

  /**
   * Combined form submission router for Create and Update actions
   */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title) {
      alert("Product title is required");
      return;
    }
    
    setLoading(true);
    const payload = { isbn, title, author, category, base_price };

    try {
      if (editingProduct) {
        // Mode: Update Existing Product
        await dispatch(updateProduct({
          id: editingProduct.id,
          data: payload
        })).unwrap();
      } else {
        // Mode: Create New Product
        await dispatch(createProduct(payload)).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      alert(err?.message || `Failed to ${editingProduct ? 'update' : 'create'} product`);
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
        {authUser?.role === "ADMIN" && (
          <Button onClick={openCreateModal} disabled={productsStatus === 'loading'}>
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

      {/* Dialog modal for creating or editing products */}
      <Dialog isOpen={isOpen} onClose={handleCloseModal} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Edit Product" : "Create Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <Input
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g., 9781234567890"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Book Title"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author Name"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Education"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base Price</label>
            <Input
              type="number"
              step="0.01"
              value={base_price}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="1500"
              disabled={loading}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Products list layout container */}
      <Card>
        <CardContent className="pt-6">
          {productsStatus === 'loading' && <p className="text-gray-500 text-center py-6">Loading products...</p>}
          {productsStatus === 'succeeded' && products.length === 0 && (
            <p className="text-gray-500 text-center py-6">No products yet.</p>
          )}
          {productsStatus === 'succeeded' && products.length > 0 && (
            <div className="w-full overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Base Price</TableHead>
                    {authUser?.role === "ADMIN" && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      {/* ISBN Column Code */}
                      <TableCell className="font-mono text-sm text-gray-600">
                        {p.isbn || "-"}
                      </TableCell>

                      {/* Product Title Column */}
                      <TableCell className="font-semibold text-gray-900">
                        {p.title}
                      </TableCell>

                      {/* Author Column */}
                      <TableCell className="text-sm text-gray-600">
                        {p.author || "-"}
                      </TableCell>

                      {/* Category Badge Column */}
                      <TableCell className="text-sm text-gray-500">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {p.category}
                        </span>
                      </TableCell>

                      {/* Base Price Column */}
                      <TableCell className="text-sm font-semibold text-green-700 whitespace-nowrap">
                        KES {Number(p.base_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>

                      {/* Admin Interactive Action Column Buttons */}
                      {authUser?.role === "ADMIN" && (
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(p)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(p.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
