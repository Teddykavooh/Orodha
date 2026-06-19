import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

/**
 * fetchProducts: GET /api/products/
 * Retrieves all products in the current tenant.
 */
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, thunkAPI) => {
  const res = await api.get('/products/')
  return res.data
})

/**
 * createProduct: POST /api/products/
 * Creates a new product with name and optional fields (sku, price, etc.).
 */
export const createProduct = createAsyncThunk('products/createProduct', async (productData, thunkAPI) => {
  const res = await api.post('/products/', productData)
  return res.data
})

/**
 * updateProduct: PUT /api/products/{id}/
 * Updates a product by ID.
 */
export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, data }, thunkAPI) => {
  const res = await api.put(`/products/${id}/`, data)
  return res.data
})

/**
 * deleteProduct: DELETE /api/products/{id}/
 * Deletes a product by ID (only available for WHOLESALER_ADMIN).
 */
export const deleteProduct = createAsyncThunk('products/deleteProduct', async (productId, thunkAPI) => {
  await api.delete(`/products/${productId}/`)
  return productId
})

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.results || []
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.error.message
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message
      })
  },
})

export default productsSlice.reducer
