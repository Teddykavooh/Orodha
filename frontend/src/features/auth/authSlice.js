import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';
import { tenantApi } from '../../services/api'

const savedToken = localStorage.getItem('token') || null
tenantApi.setToken(savedToken);
const savedOrg = localStorage.getItem('organisation') || null
tenantApi.setOrganisation(savedOrg);

const protocol = window.location.protocol;
const port = window.location.port
  ? `:${window.location.port}`
  : "";
const host = window.location.hostname;

export const login = createAsyncThunk('auth/login', async ({ organisation, username, password }, thunkAPI) => {
  // New logic
  // const tenantApi = axios.create({
  //   baseURL: `${protocol}//${organisation}.${host}:8000/api`,
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  // });

  const res = await tenantApi.post("/auth/login/", {
    organisation,
    username,
    password,
  });

  return res.data;
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
  try {
    // console.log("when i fetchMe this is my token: ", localStorage.getItem("token"));
    // console.log("when i fetchMe this is my org: ", localStorage.getItem("organisation"));
    
    const org = localStorage.getItem("organisation");

    if (org) {
      // Ensure the client instance has the state if a hard reload occurred
      tenantApi.setOrganisation(org); 
      const res = await tenantApi.get('/auth/me/')
      return res.data
    } else {
      return thunkAPI.rejectWithValue("Organisation reference missing from storage.");
    }
  } catch (err) {
    localStorage.removeItem('token')
    tenantApi.setToken(null)
    localStorage.removeItem('organisation')
    tenantApi.setOrganisation(null)
    return thunkAPI.rejectWithValue(err?.response?.data || 'Unable to load current user')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    organisation: savedOrg,
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.organisation = null;

      localStorage.removeItem("token");
      localStorage.removeItem("organisation");

      tenantApi.setToken(null);
      tenantApi.setOrganisation(null);
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

        // Extract organization schema name
        const orgSchemaName = action.payload.tenant.schema_name
        state.organisation =  orgSchemaName

        localStorage.setItem('token', action.payload.token)
        tenantApi.setToken(action.payload.token)
        // console.log("log in success set org: ", action.payload)
        localStorage.setItem('organisation', orgSchemaName)
        tenantApi.setOrganisation(action.payload.tenant.schema_name)
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
