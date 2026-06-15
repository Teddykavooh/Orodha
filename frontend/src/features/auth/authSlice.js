import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const login = createAsyncThunk('auth/login', async ({ username, password }, thunkAPI) => {
  const res = await api.post('/auth/login/', { username, password })
  const token = res.data.token
  api.setToken(token)
  // fetch profile
  const me = await api.get('/auth/me/')
  return { token, user: me.data }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
  const res = await api.get('/auth/me/')
  return res.data
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
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
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
