import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  allocateInventory
} from "../features/inventory/inventorySlice";

import { fetchProducts } from "../features/products/productsSlice";
import { fetchHubs } from "../features/hubs/hubsSlice";

import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/Dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/Table";
import { Package2Icon, PackageIcon, ArrowLeftRight } from "lucide-react";

export default function Inventory() {
  const dispatch = useDispatch();

  const inventory = useSelector((state) => state.inventory.items);
  const inventoryStatus = useSelector((state) => state.inventory.status);
  const products = useSelector((state) => state.products.items);
  const hubs = useSelector((state) => state.hubs.items);
  const authUser = useSelector((state) => state.auth.user);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);

  const [product, setProduct] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [currentHub, setCurrentHub] = useState("");
  // const [status, setStatus] = useState("IN_WAREHOUSE");
  const [quantity, setQuantity] = useState(1);

  const [allocProduct, setAllocProduct] = useState("");
  const [fromHub, setFromHub] = useState(""); // Empty String maps as Main Warehouse
  const [toHub, setToHub] = useState("");
  const [allocQuantity, setAllocQuantity] = useState(1);


  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchProducts());
    dispatch(fetchHubs());
  }, [dispatch]);

  function resetForm() {
    setEditingId(null);
    setProduct("");
    setSerialNumber("");
    setCurrentHub("");
    // setStatus("IN_WAREHOUSE");
    setQuantity(1);
  }

  function resetAllocateForm() {
    setAllocProduct("");
    setFromHub("");
    setToHub("");
    setAllocQuantity(1);
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setProduct(item.product);
    setSerialNumber(item.serial_number);
    setCurrentHub(item.current_hub || "");
    // setStatus(item.status);
    setQuantity(item.quantity || 1);
    setIsOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      product,
      serial_number: serialNumber,
      current_hub: currentHub || null,
      // status,
      quantity: Number(quantity)
    };

    try {
      if (editingId) {
        await dispatch(
          updateInventoryItem({
            id: editingId,
            data: payload,
          })
        ).unwrap();
      } else {
        await dispatch(
          createInventoryItem(payload)
        ).unwrap();
      }

      resetForm();
      setIsOpen(false);
    } catch (err) {
      alert(err?.message || "Operation failed");
    }
  }

  // Submits Cross-Hub Allocation Movements
  async function handleAllocateSubmit(e) {
    e.preventDefault();

    if (fromHub === toHub) {
      alert("Source and destination locations cannot be identical!");
      return;
    }

    const payload = {
      product: allocProduct,
      from_hub: fromHub || null,
      to_hub: toHub || null,
      quantity: Number(allocQuantity)
    };

    try {
      await dispatch(allocateInventory(payload)).unwrap();
      resetAllocateForm();
      setIsAllocateOpen(false);
      alert("Inventory successfully allocated across nodes!");
    } catch (err) {
      alert(err?.message || "Allocation Transfer failed");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete inventory item?")) return;

    try {
      await dispatch(deleteInventoryItem(id)).unwrap();
    } catch {
      alert("Delete failed");
    }
  }

  // Tie product ISBN to items
  const handleProductSelectionChange = (productId) => {
    setProduct(productId);
    const matchedProduct = products.find(p => String(p.id) === String(productId));
    if (matchedProduct?.isbn) {
      setSerialNumber(matchedProduct.isbn); // Auto fills serial_number with ISBN strings
    } else {
      setSerialNumber("");
    }
  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">
        <div className="flex justify-start gap-3 items-center border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Inventory
          </h1>
          {/* Large, custom-branded blue dashboard icon */}
          <PackageIcon className="h-8 w-8 text-blue-600 transition-transform duration-200 hover:scale-110" />
        </div>

        {authUser?.role === "ADMIN" && (
          <div className="flex gap-2">
            <Button onClick={() => {
              resetForm();
              setIsOpen(true);
            }}>
              Add Inventory
            </Button>

            <Button 
              variant="outline"
              className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                resetAllocateForm();
                setIsAllocateOpen(true);
              }}
            >
              <ArrowLeftRight className="h-4 w-4" />
              Allocate Stock
            </Button>
          </div>
        )}
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DialogHeader>
          <DialogTitle>
            {editingId
              ? "Edit Inventory Item"
              : "Add Inventory Item"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>
            <label>Product</label>

            <select
              className="w-full border rounded p-2"
              value={product}
              onChange={(e) =>
                handleProductSelectionChange(e.target.value)
              }
              required
            >
              <option value="">
                Select Product
              </option>

              {products.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Serial Number</label>

            <Input
              className="w-full border rounded p-2"
              value={serialNumber}
              onChange={(e) =>
                setSerialNumber(e.target.value)
              }
            />
          </div>

          <div>
            <label>Hub</label>

            <select
              className="w-full border rounded p-2"
              value={currentHub}
              onChange={(e) =>
                setCurrentHub(e.target.value)
              }
            >
              <option value="">
                Warehouse
              </option>

              {/* {hubs.map((hub) => (
                <option
                  key={hub.id}
                  value={hub.id}
                >
                  {hub.name}
                </option>
              ))} */}
            </select>
          </div>

          {/* <div>
            <label>Status</label>

            <select
              className="w-full border rounded p-2"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="IN_WAREHOUSE">
                In Warehouse
              </option>

              <option value="AT_HUB">
                At Hub
              </option>

              <option value="SOLD">
                Sold
              </option>
            </select>
          </div> */}

          {/* THE COMPACT COUNTER MODEL COMPONENT INPUT */}
          <div>
            <label>Copy Count</label>
            <Input
              type="number"
              min="1"
              max="100000"
              className="w-full border rounded p-2 text-sm font-semibold"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {editingId
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog isOpen={isAllocateOpen} onClose={() => setIsAllocateOpen(false)}>
        <DialogHeader>
          <DialogTitle>Allocate Inventory to Hubs</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Select Book / Catalog Item</label>
            <select
              className="w-full border rounded p-2 text-sm bg-white"
              value={allocProduct}
              onChange={(e) => setAllocProduct(e.target.value)}
              required
            >
              <option value="">-- Choose Item --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title} {p.isbn ? `(ISBN: ${p.isbn})` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Source Location (From)</label>
            <select
              className="w-full border rounded p-2 text-sm bg-white"
              value={fromHub}
              onChange={(e) => setFromHub(e.target.value)}
            >
              <option value="">Main Warehouse</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Destination Hub (To)</label>
            <select 
              className="w-full border rounded p-2 text-sm bg-white"
              value={toHub}
              onChange={(e) => setToHub(e.target.value)}
              required
            >
              <option value="">-- Select Destination Hub --</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Transfer Volume Count</label>
            <Input
              type="number"
              min="1"
              max="100000"
              className="w-full border rounded p-2 text-sm font-semibold"
              value={allocQuantity}
              onChange={(e) => setAllocQuantity(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAllocateOpen(false)}
              >Cancel
            </Button>

            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            >
                Execute Allocation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Card>
        <CardContent className="pt-6">

          {inventoryStatus === "loading" && (
            <p>Loading inventory...</p>
          )}

          {inventoryStatus === "succeeded" &&
            inventory.length === 0 && (
              <p>No inventory found.</p>
            )}

          <div className="w-full overflow-x-auto rounded-lg max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Title</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Location / Hub</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead className="font-semibold text-gray-700">In-Stock Copies</TableHead>
                  {authUser?.role === "ADMIN" && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    {/* Product Title Column */}
                    <TableCell className="font-semibold text-gray-900">
                      {item.product_title || "Unknown Product"}
                    </TableCell>

                    {/* Serial Number Column */}
                    <TableCell className="font-mono text-sm text-gray-600">
                      {item.serial_number || "-"}
                    </TableCell>

                    {/* Location Hub Column */}
                    <TableCell className="text-sm text-gray-600">
                      {item.hub_name || "Warehouse"}
                    </TableCell>

                    {/* Contextual Status Badge Column */}
                    {/* <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                        item.status === 'SOLD' ? 'bg-gray-100 text-gray-800' :
                        item.status === 'AT_HUB' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.status ? item.status.replace('_', ' ') : 'IN WAREHOUSE'}
                      </span>
                    </TableCell> */}

                    <TableCell>
                      <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-100 shadow-sm min-w-[60px]">
                        {Number(item.quantity).toLocaleString()} available
                      </div>
                    </TableCell>

                    {/* Admin Interactive Action Column Buttons */}
                    {authUser?.role === "ADMIN" && (
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
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

        </CardContent>
      </Card>
    </div>
  );
}