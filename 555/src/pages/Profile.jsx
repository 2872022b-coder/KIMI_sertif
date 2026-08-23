import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Wallet, Clock } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={16} className="text-green-600" />
              <span className="text-sm text-green-700 font-medium">Баланс</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{user.balance?.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-orange-600" />
              <span className="text-sm text-orange-700 font-medium">В обработке</span>
            </div>
            <p className="text-2xl font-bold text-orange-800">{user.blockedBalance?.toLocaleString('ru-RU') || 0} ₽</p>
          </div>
        </div>
      </div>
    </div>
  );
}