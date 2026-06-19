import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchHubs = createAsyncThunk(
  'hubs/fetchHubs',
  async () => {
    const res = await api.get('/hubs/')
    return res.data
  }
)

export const createHub = createAsyncThunk(
  'hubs/createHub',
  async (hubData) => {
    const res = await api.post('/hubs/', hubData)
    return res.data
  }
)

export const updateHub = createAsyncThunk(
  'hubs/updateHub',
  async ({ id, data }) => {
    const res = await api.put(`/hubs/${id}/`, data)
    return res.data
  }
)

export const deleteHub = createAsyncThunk(
  'hubs/deleteHub',
  async (id) => {
    await api.delete(`/hubs/${id}/`)
    return id
  }
)

const hubsSlice = createSlice({
  name: 'hubs',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchHubs.pending, (state) => {
        state.status = 'loading'
      })

      .addCase(fetchHubs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.results || []
      })

      .addCase(fetchHubs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      .addCase(createHub.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })

      .addCase(updateHub.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          h => h.id === action.payload.id
        )

        if (index >= 0) {
          state.items[index] = action.payload
        }
      })

      .addCase(deleteHub.fulfilled, (state, action) => {
        state.items = state.items.filter(
          h => h.id !== action.payload
        )
      })
  }
})

export default hubsSlice.reducer