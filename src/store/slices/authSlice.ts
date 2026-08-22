import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, Admin } from '../../types';

const initialState: AuthState = {
  user: null,
  admin: null,
  isAuthenticated: false,
  userType: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; userType: 'client' }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.userType = 'client';
      state.error = null;
      state.loading = false;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('userType', 'client');
    },
    adminLoginSuccess: (state, action: PayloadAction<{ admin: Admin; userType: 'admin' }>) => {
      state.admin = action.payload.admin;
      state.isAuthenticated = true;
      state.userType = 'admin';
      state.error = null;
      state.loading = false;
      localStorage.setItem('admin', JSON.stringify(action.payload.admin));
      localStorage.setItem('userType', 'admin');
    },
    logout: (state) => {
      state.user = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.userType = null;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('admin');
      localStorage.removeItem('userType');
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.userType = 'client';
      state.error = null;
      state.loading = false;
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('userType', 'client');
    },
    restoreSession: (state) => {
      const user = localStorage.getItem('user');
      const admin = localStorage.getItem('admin');
      const userType = localStorage.getItem('userType');

      if (user && userType === 'client') {
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
        state.userType = 'client';
      } else if (admin && userType === 'admin') {
        state.admin = JSON.parse(admin);
        state.isAuthenticated = true;
        state.userType = 'admin';
      }
    },
  },
});

export const { setLoading, setError, loginSuccess, adminLoginSuccess, logout, registerSuccess, restoreSession } =
  authSlice.actions;
export default authSlice.reducer;
