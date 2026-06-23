import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
          : action.payload.results || [];
      })

      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
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
      });
  },
});

export default inventorySlice.reducer;