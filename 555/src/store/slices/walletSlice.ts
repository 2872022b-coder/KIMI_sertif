import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletState } from '../../types';

const initialState: WalletState = {
  balance: 0,
  currency: 'RUB',
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    addBalance: (state, action: PayloadAction<number>) => {
      state.balance += action.payload;
    },
    subtractBalance: (state, action: PayloadAction<number>) => {
      if (state.balance >= action.payload) {
        state.balance -= action.payload;
      } else {
        state.error = 'Недостаточно средств';
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setBalance, addBalance, subtractBalance, setLoading, setError } = walletSlice.actions;
export default walletSlice.reducer;
