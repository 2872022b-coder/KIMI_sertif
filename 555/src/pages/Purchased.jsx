import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import storage from '../services/storage.js';
import { Download, Image, Package } from 'lucide-react';

export function Purchased() {
  const { user } = useAuth();
  const orders = storage.getOrders().filter((o) => o.userId === user?.id);

  if (!orders.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Нет покупок</h2>
        <p className="text-slate-500 mt-2">Ваши приобретённые товары появятся здесь</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Ранее приобретённые товары</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.flatMap((order) =>
          order.images.map((img, idx) => (
            <div key={`${order.id}-${idx}`} className="card p-4">
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-3">
                <img src={img.dataUrl} alt={order.productName} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-slate-900 truncate">{order.productName}</h3>
              <p className="text-xs text-slate-500 mb-3">Картинка #{idx + 1}</p>
              <a
                href={img.dataUrl}
                download={`${order.productName}_${idx + 1}.png`}
                className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <Download size={16} />
                Скачать
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}