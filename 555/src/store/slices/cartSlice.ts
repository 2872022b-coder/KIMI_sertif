import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem, Product } from '../../types';

const initialState: CartState = {
  items: [],
  product: {},
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const existingItem = state.items.find((item) => item.productId === action.payload.product.id);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          id: `cart-${action.payload.product.id}`,
          productId: action.payload.product.id,
          quantity: action.payload.quantity,
          addedAt: new Date().toISOString(),
        });
      }

      state.product[action.payload.product.id] = action.payload.product;
      updateTotalPrice(state);
      saveCartToLocalStorage(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      delete state.product[action.payload];
      updateTotalPrice(state);
      saveCartToLocalStorage(state);
    },

    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((item) => item.productId === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((item) => item.productId !== action.payload.productId);
          delete state.product[action.payload.productId];
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      updateTotalPrice(state);
      saveCartToLocalStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.product = {};
      state.totalPrice = 0;
      localStorage.removeItem('cart');
    },

    loadCartFromStorage: (state) => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        state.items = parsed.items || [];
        state.product = parsed.product || {};
        updateTotalPrice(state);
      }
    },
  },
});

function updateTotalPrice(state: CartState) {
  state.totalPrice = state.items.reduce((total, item) => {
    const product = state.product[item.productId];
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function saveCartToLocalStorage(state: CartState) {
  localStorage.setItem('cart', JSON.stringify({ items: state.items, product: state.product }));
}

export const { addToCart, removeFromCart, updateQuantity, clearCart, loadCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
