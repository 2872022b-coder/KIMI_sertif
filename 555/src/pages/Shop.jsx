import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import storage from '../services/storage.js';
import { ShoppingCart, Image, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export function Shop() {
  const products = storage.getProducts();
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Каталог товаров</h1>
      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-500">Товары пока не добавлены</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => setSelected(product)} />
          ))}
        </div>
      )}
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const images = product.productImages || [];
  const available = images.filter((img) => !img.issued).length;
  const mismatch = available !== product.stock;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="aspect-video bg-slate-100 relative">
        {images[0] ? (
          <img src={images[0].dataUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Image size={32} />
          </div>
        )}
        {mismatch && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
            <AlertTriangle size={12} />
            Несоответствие
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-blue-600">{product.price} ₽</span>
          <div className="flex gap-2">
            <span className="badge-green">{available} своб.</span>
            <span className="badge-red">{images.filter((i) => i.issued).length} выд.</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {available < product.stock
            ? `Доступно: ${available} из ${product.stock} шт`
            : `В наличии: ${product.stock} шт`}
        </p>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const images = product.productImages || [];
  const available = images.filter((img) => !img.issued).length;
  const maxQty = Math.min(product.stock, available);

  const handleAdd = () => {
    if (quantity > maxQty) return;
    addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            ×
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
            {images[0] ? (
              <img src={images[0].dataUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Image size={48} />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-bold text-blue-600">{product.price} ₽</p>
            <p className="text-sm text-slate-600">
              {available < product.stock
                ? `Доступно: ${available} из ${product.stock} шт`
                : `В наличии: ${product.stock} шт`}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >-</button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >+</button>
            </div>
            {quantity > maxQty && (
              <p className="text-xs text-red-600">Максимально доступно: {maxQty} шт</p>
            )}
            <button
              onClick={handleAdd}
              disabled={quantity > maxQty || maxQty === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {added ? 'Добавлено!' : 'В корзину'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}