import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";

import { tenantApi as api } from "../../services/api";

export const fetchInventory = createAsyncThunk(
  "inventory/fetchInventory",
  async () => {
    const res = await api.get("/book-items/");
    return res.data;
  }
);

export const createInventoryItem = createAsyncThunk(
  "inventory/createInventoryItem",
  async (data) => {
    const res = await api.post("/book-items/", data);
    return res.data;
  }
);

export const updateInventoryItem = createAsyncThunk(
  "inventory/updateInventoryItem",
  async ({ id, data }) => {
    const res = await api.put(`/book-items/${id}/`, data);
    return res.data;
  }
);

export const deleteInventoryItem = createAsyncThunk(
  "inventory/deleteInventoryItem",
  async (id) => {
    await api.delete(`/book-items/${id}/`);
    return id;
  }
);

export const allocateInventory = createAsyncThunk("inventory/allocateInventory",
  async (allocationData, {rejectWithValue}) => {
    try {
      // Points exactly to custom @action url path
      const res = await api.post("/book-items/allocate/", allocationData);

      // Pass server message
      return {
        message: res.data.message,
        transferDetails: allocationData
      };
      // return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Network communication failure" });
    }
  }
)

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = Array.isArray(action.payload)
          ? action.payload
          // : action.payload.results || [];
          : action.payload || [];
      })

      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(createInventoryItem.fulfilled, (state, action) => {
        const existingIdx = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (existingIdx >= 0) {
          state.items[existingIdx] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })

      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (idx >= 0) {
          state.items[idx] = action.payload;
        }
      })

      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      })

      .addCase(allocateInventory.fulfilled, (state, action) => {
        const { product, from_hub, to_hub, quantity } = action.payload.transferDetails;
        const transferQty = Number(quantity);

        // --- Deduct stock from the source location ---
        state.items = state.items.map(item => {
          const isTargetProduct = String(item.product) === String(product);
          const isSourceLocation = from_hub === null 
            ? !item.current_hub 
            : String(item.current_hub) === String(from_hub);

          if (isTargetProduct && isSourceLocation) {
            return {
              ...item,
              quantity: Math.max(0, Number(item.quantity) - transferQty)
            };
          }
          return item;
        })
        // Mirror the backend auto-delete: drop rows that hit 0 copies
        .filter(item => Number(item.quantity) > 0);

        // --- Increment stock at destination location ---
        const destIdx = state.items.findIndex(item => {
          const isTargetProduct = String(item.product) === String(product);
          const isDestLocation = to_hub === null 
            ? !item.current_hub 
            : String(item.current_hub) === String(to_hub);
          return isTargetProduct && isDestLocation;
        });

        if (destIdx >= 0) {
          // Destination row already exists -> append quantity
          state.items[destIdx].quantity = Number(state.items[destIdx].quantity) + transferQty;
        } else {
          // Destination row is completely new -> borrow details from another instance of the book to keep table info valid
          const siblingInfo = state.items.find(item => String(item.product) === String(product));
          
          const newBatchRow = {
            id: `temp-${Date.now()}`, // Temporary local unique key assignment
            product: Number(product),
            product_title: siblingInfo?.product_title || "Allocated Item",
            isbn: siblingInfo?.isbn || siblingInfo?.serial_number || "-",
            serial_number: siblingInfo?.serial_number || "-",
            current_hub: to_hub ? Number(to_hub) : null,
            hub_name: to_hub ? "Allocated Destination Hub" : "IN_WAREHOUSE",
            quantity: transferQty,
            created_at: new Date().toISOString()
          };
          state.items.unshift(newBatchRow);
        }
      })

      .addCase(allocateInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.error;
      });
  },
});

export default inventorySlice.reducer;