import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

/**
 * fetchUsers: GET /api/users/
 * Retrieves all users (filtered by hub for SALES_MANAGER, all for WHOLESALER_ADMIN).
 */
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, thunkAPI) => {
  const res = await api.get('/users/')
  return res.data
})

/**
 * createUser: POST /api/users/
 * Creates a new user with username, password, role, and optional hub.
 */
export const createUser = createAsyncThunk('users/createUser', async (userData, thunkAPI) => {
  const res = await api.post('/users/', userData)
  return res.data
})

/**
 * deleteUser: DELETE /api/users/{id}/
 * Deletes a user by ID (only available for WHOLESALER_ADMIN).
 */
export const deleteUser = createAsyncThunk('users/deleteUser', async (userId, thunkAPI) => {
  await api.delete(`/users/${userId}/`)
  return userId
})

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.results || []
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.error.message
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.error.message
      })
  },
})

export default usersSlice.reducer
