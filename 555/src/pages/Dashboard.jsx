import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, ArrowDownCircle } from 'lucide-react';
import storage from '../services/storage.js';

export function AdminDashboard() {
  const products = storage.getProducts();
  const orders = storage.getOrders();
  const users = storage.getUsers().filter((u) => u.role === 'client');
  const requests = storage.getWithdrawRequests().filter((r) => r.status === 'pending');

  const stats = [
    { label: 'Товаров', value: products.length, icon: Package, to: '/admin/products', color: 'bg-blue-100 text-blue-600' },
    { label: 'Заказов', value: orders.length, icon: ShoppingCart, to: '/admin/orders', color: 'bg-green-100 text-green-600' },
    { label: 'Клиентов', value: users.length, icon: Users, to: '/', color: 'bg-purple-100 text-purple-600' },
    { label: 'Заявок на вывод', value: requests.length, icon: ArrowDownCircle, to: '/admin/withdrawals', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Админ-панель</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="card hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}