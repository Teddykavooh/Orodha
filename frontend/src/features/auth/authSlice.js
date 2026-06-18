import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const savedToken = localStorage.getItem('token') || null
api.setToken(savedToken)

export const login = createAsyncThunk('auth/login', async ({ organisation, username, password }, thunkAPI) => {
  const res = await api.post('/auth/login/', { organisation, username, password })
  const token = res.data.token
  api.setToken(token)
  localStorage.setItem('token', token)
  return { token, user: res.data.user }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
  try {
    const res = await api.get('/auth/me/')
    return res.data
  } catch (err) {
    localStorage.removeItem('token')
    api.setToken(null)
    return thunkAPI.rejectWithValue(err?.response?.data || 'Unable to load current user')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      api.setToken(null)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.user = action.payload.user
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.error = null
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed'
        state.token = null
        state.user = null
        state.error = action.payload || action.error.message
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
