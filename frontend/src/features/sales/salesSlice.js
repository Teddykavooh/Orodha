import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { tenantApi } from '../../services/api'

/**
 * fetchSales: GET /api/sales/
 * Retrieves all sales (filtered by hub for MERCHANDISER/MANAGER, all for ADMIN).
 */
export const fetchSales = createAsyncThunk('sales/fetchSales', async (_, thunkAPI) => {
  const res = await tenantApi.get('/sales/')
  // console.log("This is my payload: ", action.payload);
  // console.log("This is my res: ", res);
  return res.data
})

/**
 * createSale: POST /api/sales/
 * Creates a new sale with items, quantities, customer info, and optional note.
 */
// export const createSale = createAsyncThunk('sales/createSale', async (saleData, thunkAPI) => {
//   const res = await tenantApi.post('/sales/', saleData)
//   return res.data
// })
export const createSale = createAsyncThunk('sales/createSale', async ({ bookItemId, bookItemSeller, salePrice }, thunkAPI) => {
  // Maps variables directly onto your Django serializer keys
  // console.log("Sale data: ", { book_item: bookItemId, salesperson: bookItemSeller, sale_price: salePrice });
  const res = await tenantApi.post('/sales/', {
    book_item: bookItemId,
    salesperson: bookItemSeller,
    sale_price: salePrice
  });
  return res.data;
});

/**
 * updateSale: PUT /api/sales/{id}/
 * Updates a sale by ID (for adjusting notes or status).
 */
export const updateSale = createAsyncThunk('sales/updateSale', async ({ id, data }, thunkAPI) => {
  const res = await tenantApi.put(`/sales/${id}/`, data)
  return res.data
})

/**
 * deleteSale: DELETE /api/sales/{id}/
 * Deletes a sale by ID (only available for ADMIN).
 */
export const deleteSale = createAsyncThunk('sales/deleteSale', async (saleId, thunkAPI) => {
  await tenantApi.delete(`/sales/${saleId}/`)
  return saleId
})

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // state.items = action.payload.results || []
        state.items = action.payload || []
        state.error = null
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Create sale
      .addCase(createSale.fulfilled, (state, action) => {
        state.items.unshift(action.payload) // prepend to show recent first
      })
      .addCase(createSale.rejected, (state, action) => {
        state.error = action.error.message
      })
      // Update sale
      .addCase(updateSale.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.error = action.error.message
      })
      // Delete sale
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload)
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.error = action.error.message
      })
  },
})

export default salesSlice.reducer
