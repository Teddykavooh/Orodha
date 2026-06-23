import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../features/inventory/inventorySlice";

import { fetchProducts } from "../features/products/productsSlice";
import { fetchHubs } from "../features/hubs/hubsSlice";

import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/Dialog";

export default function Inventory() {
  const dispatch = useDispatch();

  const inventory = useSelector((state) => state.inventory.items);
  const inventoryStatus = useSelector((state) => state.inventory.status);

  const products = useSelector((state) => state.products.items);
  const hubs = useSelector((state) => state.hubs.items);

  const authUser = useSelector((state) => state.auth.user);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [product, setProduct] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [currentHub, setCurrentHub] = useState("");
  const [status, setStatus] = useState("IN_WAREHOUSE");

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
    setStatus("IN_WAREHOUSE");
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setProduct(item.product);
    setSerialNumber(item.serial_number);
    setCurrentHub(item.current_hub || "");
    setStatus(item.status);
    setIsOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      product,
      serial_number: serialNumber,
      current_hub: currentHub || null,
      status,
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

  async function handleDelete(id) {
    if (!window.confirm("Delete inventory item?")) return;

    try {
      await dispatch(deleteInventoryItem(id)).unwrap();
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Inventory
        </h2>

        {authUser?.role === "WHOLESALER_ADMIN" && (
          <Button onClick={() => {
            resetForm();
            setIsOpen(true);
          }}>
            Add Inventory
          </Button>
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
                setProduct(e.target.value)
              }
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

              {hubs.map((hub) => (
                <option
                  key={hub.id}
                  value={hub.id}
                >
                  {hub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
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

      <Card>
        <CardContent className="pt-6">

          {inventoryStatus === "loading" && (
            <p>Loading inventory...</p>
          )}

          {inventoryStatus === "succeeded" &&
            inventory.length === 0 && (
              <p>No inventory found.</p>
            )}

          <div className="space-y-2">

            {inventory.map((item) => (
              <div
                key={item.id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {item.product_title}
                  </p>

                  <p className="text-sm text-gray-500">
                    SN: {item.serial_number}
                  </p>

                  <p className="text-sm text-gray-500">
                    Hub: {item.hub_name || "Warehouse"}
                  </p>

                  <p className="text-sm">
                    Status: {item.status}
                  </p>
                </div>

                {authUser?.role ===
                  "WHOLESALER_ADMIN" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEdit(item)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}