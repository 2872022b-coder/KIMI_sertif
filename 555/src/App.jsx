import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { MessageProvider } from './context/MessageContext.jsx';
import { WithdrawProvider } from './context/WithdrawContext.jsx';
import { Header } from './components/Header.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Shop } from './pages/Shop.jsx';
import { Cart } from './pages/Cart.jsx';
import { Purchased } from './pages/Purchased.jsx';
import { Profile } from './pages/Profile.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminProducts } from './pages/AdminProducts.jsx';
import { AdminOrders } from './pages/AdminOrders.jsx';
import { AdminWithdrawals } from './pages/AdminWithdrawals.jsx';

function Protected({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/purchased" element={<Protected><Purchased /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/admin" element={<Protected adminOnly><AdminDashboard /></Protected>} />
          <Route path="/admin/products" element={<Protected adminOnly><AdminProducts /></Protected>} />
          <Route path="/admin/orders" element={<Protected adminOnly><AdminOrders /></Protected>} />
          <Route path="/admin/withdrawals" element={<Protected adminOnly><AdminWithdrawals /></Protected>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MessageProvider>
          <WithdrawProvider>
            <AppRoutes />
          </WithdrawProvider>
        </MessageProvider>
      </CartProvider>
    </AuthProvider>
  );
}