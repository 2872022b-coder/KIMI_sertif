import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../services/storage.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  useEffect(() => {
    setCart(storage.getCart());
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    storage.setCart(newCart);
  };

  const addToCart = (productId, quantity = 1) => {
    const newCart = { ...cart, [productId]: (cart[productId] || 0) + quantity };
    saveCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = { ...cart };
    delete newCart[productId];
    saveCart(newCart);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = { ...cart, [productId]: quantity };
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart({});
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
