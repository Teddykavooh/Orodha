import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';
import { tenantApi } from '../../services/api'

const savedToken = localStorage.getItem('token') || null
const rawOrg = localStorage.getItem('organisation');
const savedOrg = rawOrg && rawOrg !== "null" && rawOrg !== "undefined" ? rawOrg : "";

// Hydrate Axios instances safely on app boot
tenantApi.setToken(savedToken);
tenantApi.setOrganisation(savedOrg);

const protocol = window.location.protocol;
const port = window.location.port
  ? `:${window.location.port}`
  : "";
const host = window.location.hostname;

export const login = createAsyncThunk('auth/login', async ({ organisation, username, password }, thunkAPI) => {
  try {
    localStorage.setItem('organisation', organisation.trim().toLowerCase());

    const res = await tenantApi.post("/auth/login/", {
      organisation,
      username,
      password,
    });
    
    return res.data;
  } catch (error) {
    // If the login fails, scrub the temporary organization token out of memory
    localStorage.removeItem('organisation');
    return thunkAPI.rejectWithValue(err.response?.data || { non_field_errors: [err.message] });
  }
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
    // logo:null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.organisation = null;
      // state.logo = null;

      localStorage.removeItem("token");
      localStorage.removeItem("organisation");
      localStorage.removeItem("logo");
      // localStorage.removeItem("logo_url");

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
        // state.logo = action.payload.tenant.logo

        // console.log("Payload: ", action.payload);

        // Extract organization schema name
        const orgSchemaName = action.payload.tenant.schema_name
        state.organisation =  orgSchemaName

        // Persist session tokens securely across browser reloads
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('organisation', orgSchemaName);
        localStorage.setItem('business_name', action.payload.tenant.business_name);   
        localStorage.setItem('logo', action.payload.tenant.logo);
        // localStorage.setItem('logo_url', action.payload.tenant.logo_url);
        
        tenantApi.setToken(action.payload.token);
        tenantApi.setOrganisation(orgSchemaName);
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
