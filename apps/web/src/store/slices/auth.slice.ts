// src/store/slices/auth.slice.ts
// Handles all auth state + async thunks.
// Components never call authService directly — they dispatch thunks.
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/lib/api/services';
import { setAxiosToken } from '@/lib/api/axios-instance';
import { extractApiError, setCookie, deleteCookie, decodeJwtPayload } from '@/lib/utils';
import { AUTH_ROLE_COOKIE, COOKIE_MAX_AGE_7_DAYS } from '@/constants';
import type { User, LoginDto, TokenResponse } from '@crm/types';

// ── State ─────────────────────────────────────────────────────────────────────
export interface AuthState {
  user:          User | null;
  accessToken:   string | null;
  activeOrgId:   string | null; // null = "All Orgs" for super admin
  isLoading:     boolean;
  isInitialized: boolean;
  error:         string | null;
}

const initialState: AuthState = {
  user:          null,
  accessToken:   null,
  activeOrgId:   null,
  isLoading:     false,
  isInitialized: false,
  error:         null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk<TokenResponse, LoginDto>(
  'auth/login',
  async (dto, { rejectWithValue }) => {
    try {
      return await authService.login(dto);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

export const logoutThunk = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    try {
      await authService.logout();
    } catch {
      // Always clear local state — even if API fails
    }
  },
);

export const refreshTokenThunk = createAsyncThunk<{ accessToken: string }, void>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.refresh();
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }: PayloadAction<TokenResponse>) {
      state.user          = payload.user;
      state.accessToken   = payload.accessToken;
      state.activeOrgId   = payload.user.organizationId;
      state.isInitialized = true;
      state.error         = null;
      setAxiosToken(payload.accessToken);
      setCookie(AUTH_ROLE_COOKIE, payload.user.role, COOKIE_MAX_AGE_7_DAYS);
    },
    clearCredentials(state) {
      state.user          = null;
      state.accessToken   = null;
      state.activeOrgId   = null;
      state.isInitialized = true;
      setAxiosToken(null);
      deleteCookie(AUTH_ROLE_COOKIE);
    },
    setActiveOrg(state, { payload }: PayloadAction<string | null>) {
      state.activeOrgId = payload;
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
    updateAccessToken(state, { payload }: PayloadAction<string>) {
      state.accessToken = payload;
      setAxiosToken(payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.isLoading     = false;
        state.user          = payload.user;
        state.accessToken   = payload.accessToken;
        state.activeOrgId   = payload.user.organizationId;
        state.isInitialized = true;
        setAxiosToken(payload.accessToken);
        setCookie(AUTH_ROLE_COOKIE, payload.user.role, COOKIE_MAX_AGE_7_DAYS);
      })
      .addCase(loginThunk.rejected,  (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload as string;
      })
      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user        = null;
        state.accessToken = null;
        state.activeOrgId = null;
        setAxiosToken(null);
        deleteCookie(AUTH_ROLE_COOKIE);
      })
      // refresh
      .addCase(refreshTokenThunk.fulfilled, (state, { payload }) => {
        if (payload?.accessToken) {
          state.accessToken = payload.accessToken;
          setAxiosToken(payload.accessToken);
        }
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        // Refresh failed — force full logout
        state.user        = null;
        state.accessToken = null;
        state.activeOrgId = null;
        setAxiosToken(null);
        deleteCookie(AUTH_ROLE_COOKIE);
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  setActiveOrg,
  setInitialized,
  updateAccessToken,
} = authSlice.actions;

export default authSlice.reducer;
