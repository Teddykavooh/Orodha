import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import axios from 'axios';

const savedToken = localStorage.getItem('token') || null
api.setToken(savedToken);

const protocol = window.location.protocol;
const port = window.location.port
  ? `:${window.location.port}`
  : "";
const host = window.location.hostname;

export const login = createAsyncThunk('auth/login', async ({ organisation, username, password }, thunkAPI) => {
  // New logic
  const tenantApi = axios.create({
    baseURL: `${protocol}//${organisation}.${host}:8000/api`,
    headers: {
      "Content-Type": "application/json"
    },
  });

  const res = await tenantApi.post("/auth/login/", {
    organisation,
    username,
    password,
  });

  return res.data;
});

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
      state.token = null;
      state.user = null;

      localStorage.removeItem("token");
      localStorage.removeItem("tenant_schema");

      api.setToken(null);
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
