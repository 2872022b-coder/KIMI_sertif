import React, { createContext, useContext, useReducer } from 'react';
import storage from '../services/storage.js';

const ShopContext = createContext(null);

const initialState = {
  products: storage.getProducts(),
  cart: storage.getCart(),
  transactions: storage.getTransactions(),
  depositRequests: storage.getDepositRequests(),
};

function shopReducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_DEPOSIT_REQUESTS':
      return { ...state, depositRequests: action.payload };
    default:
      return state;
  }
}

export function ShopProvider({ children }) {
  const [state, dispatch] = useReducer(shopReducer, initialState);

  const refresh = () => {
    dispatch({ type: 'SET_PRODUCTS', payload: storage.getProducts() });
    dispatch({ type: 'SET_CART', payload: storage.getCart() });
    dispatch({ type: 'SET_TRANSACTIONS', payload: storage.getTransactions() });
    dispatch({ type: 'SET_DEPOSIT_REQUESTS', payload: storage.getDepositRequests() });
  };

  const addToCart = (product, quantity = 1) => {
    const cart = storage.getCart();
    const existing = cart.findIndex(item => item.productId === product.id);
    if (existing >= 0) {
      cart[existing].quantity += quantity;
    } else {
      cart.push({ productId: product.id, name: product.name, price: product.price, quantity });
    }
    storage.setCart(cart);
    dispatch({ type: 'SET_CART', payload: cart });
  };

  const removeFromCart = (productId) => {
    const cart = storage.getCart().filter(item => item.productId !== productId);
    storage.setCart(cart);
    dispatch({ type: 'SET_CART', payload: cart });
  };

  const clearCart = () => {
    storage.setCart([]);
    dispatch({ type: 'SET_CART', payload: [] });
  };

  const createTransaction = (data) => {
    const tx = {
      id: storage.generateTransactionId(),
      timestamp: new Date().toISOString(),
      ...data,
    };
    const transactions = storage.getTransactions();
    transactions.push(tx);
    storage.setTransactions(transactions);
    dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    return tx;
  };

  const addProduct = (product) => {
    const products = storage.getProducts();
    products.push({ ...product, id: `P${Date.now()}` });
    storage.setProducts(products);
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };

  const updateProduct = (id, updates) => {
    const products = storage.getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
    storage.setProducts(products);
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };

  const deleteProduct = (id) => {
    const products = storage.getProducts().filter(p => p.id !== id);
    storage.setProducts(products);
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };

  // New function: update product stock after purchase
  const updateProductStock = (productId, quantity) => {
    const products = storage.getProducts().map(p => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    });
    storage.setProducts(products);
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };

  const createDepositRequest = (data) => {
    const req = {
      id: storage.generateDepositRequestId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...data,
    };
    const requests = storage.getDepositRequests();
    requests.push(req);
    storage.setDepositRequests(requests);
    dispatch({ type: 'SET_DEPOSIT_REQUESTS', payload: requests });
    return req;
  };

  const updateDepositRequest = (id, updates) => {
    const requests = storage.getDepositRequests().map(r => r.id === id ? { ...r, ...updates } : r);
    storage.setDepositRequests(requests);
    dispatch({ type: 'SET_DEPOSIT_REQUESTS', payload: requests });
  };

  return (
    <ShopContext.Provider value={{
      ...state,
      refresh,
      addToCart,
      removeFromCart,
      clearCart,
      createTransaction,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductStock,
      createDepositRequest,
      updateDepositRequest,
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
