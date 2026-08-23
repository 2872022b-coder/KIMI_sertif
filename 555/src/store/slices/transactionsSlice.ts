import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionsState, Transaction, Transfer } from '../../types';

const initialState: TransactionsState = {
  items: [],
  transfers: [],
  loading: false,
  error: null,
  filters: {},
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    setTransfers: (state, action: PayloadAction<Transfer[]>) => {
      state.transfers = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.unshift(action.payload);
    },
    addTransfer: (state, action: PayloadAction<Transfer>) => {
      state.transfers.unshift(action.payload);
    },
    setFilters: (state, action: PayloadAction<TransactionsState['filters']>) => {
      state.filters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTransactions, setTransfers, addTransaction, addTransfer, setFilters, setLoading, setError } =
  transactionsSlice.actions;
export default transactionsSlice.reducer;
