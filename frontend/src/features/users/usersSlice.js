import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { tenantApi } from '../../services/api'

/**
 * fetchUsers: GET /api/users/
 * Retrieves all users (filtered by hub for MANAGER, all for ADMIN).
 */
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, thunkAPI) => {
  const res = await tenantApi.get('/users/')
  return res.data
})

/**
 * createUser: POST /api/users/
 * Creates a new user with username, password, role, and optional hub.
 */
export const createUser = createAsyncThunk('users/createUser', async (userData, thunkAPI) => {
  try {
    const res = await tenantApi.post('/users/', userData)
    return res.data
  } catch (error) {
    if (!error.response)
      throw error;  
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

// Update User Thunk (Added)
export const updateUser = createAsyncThunk('users/updateUser', async ({ id, data }, thunkAPI) => {
  // Sends a PATCH request to perform a partial update (great for optional passwords)
  const res = await tenantApi.patch(`/users/${id}/`, data);
  return res.data;
});

/**
 * deleteUser: DELETE /api/users/{id}/
 * Deletes a user by ID (only available for ADMIN).
 */
export const deleteUser = createAsyncThunk('users/deleteUser', async (userId, thunkAPI) => {
  await tenantApi.delete(`/users/${userId}/`)
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
        state.error = action.payload?.username?.[0] || action.error.message;
      })
      // Update User Lifecycle (Added)
      .addCase(updateUser.fulfilled, (state, action) => {
        // Find the user by ID and replace its values with the updated profile data from the server
        const index = state.items.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
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
