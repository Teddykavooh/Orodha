import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

/**
 * fetchSales: GET /api/sales/
 * Retrieves all sales (filtered by hub for SALESPERSON/SALES_MANAGER, all for WHOLESALER_ADMIN).
 */
export const fetchSales = createAsyncThunk('sales/fetchSales', async (_, thunkAPI) => {
  const res = await api.get('/sales/')
  return res.data
})

/**
 * createSale: POST /api/sales/
 * Creates a new sale with items, quantities, customer info, and optional note.
 */
export const createSale = createAsyncThunk('sales/createSale', async (saleData, thunkAPI) => {
  const res = await api.post('/sales/', saleData)
  return res.data
})

/**
 * updateSale: PUT /api/sales/{id}/
 * Updates a sale by ID (for adjusting notes or status).
 */
export const updateSale = createAsyncThunk('sales/updateSale', async ({ id, data }, thunkAPI) => {
  const res = await api.put(`/sales/${id}/`, data)
  return res.data
})

/**
 * deleteSale: DELETE /api/sales/{id}/
 * Deletes a sale by ID (only available for WHOLESALER_ADMIN).
 */
export const deleteSale = createAsyncThunk('sales/deleteSale', async (saleId, thunkAPI) => {
  await api.delete(`/sales/${saleId}/`)
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
        state.items = action.payload
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
