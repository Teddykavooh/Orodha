import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import usersReducer from '../features/users/usersSlice'
import productsReducer from '../features/products/productsSlice'
import salesReducer from '../features/sales/salesSlice'
import hubsReducer from '../features/hubs/hubsSlice'

/**
 * Redux store configuration with slices for auth, users, products, and sales.
 * Each slice manages its own state and async thunks for CRUD operations.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products: productsReducer,
    sales: salesReducer,
    hubs: hubsReducer,
  },
})
