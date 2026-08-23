import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import storage from '../services/storage.js';
import { Plus, Trash2, Edit, Image, AlertTriangle, CheckCircle, X } from 'lucide-react';

export function AdminProducts() {
  const [products, setProducts] = useState(storage.getProducts());
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => setProducts(storage.getProducts());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Товары</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Добавить товар
        </button>
      </div>

      {showForm && <ProductForm onClose={() => { setShowForm(false); refresh(); }} />}
      {editing && <ProductForm product={editing} onClose={() => { setEditing(null); refresh(); }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const images = product.productImages || [];
          const free = images.filter((i) => !i.issued).length;
          const issued = images.filter((i) => i.issued).length;
          const mismatch = free !== product.stock;

          return (
            <div key={product.id} className="card">
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4 relative">
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
              <h3 className="font-semibold text-slate-900">{product.name}</h3>
              <p className="text-blue-600 font-bold mt-1">{product.price} ₽</p>
              <div className="flex gap-2 mt-2">
                <span className="badge-green">{free} своб.</span>
                <span className="badge-red">{issued} выд.</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Stock: {product.stock}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditing(product)} className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1">
                  <Edit size={14} />
                  Изменить
                </button>
                <button
                  onClick={() => { storage.deleteProduct(product.id); refresh(); }}
                  className="flex-1 btn-danger text-sm flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductForm({ product, onClose }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || '');
  const [stock, setStock] = useState(product?.stock || 1);
  const [images, setImages] = useState(product?.productImages || []);
  const fileInputRef = useRef();
  const hasOrders = product ? storage.getOrders().some((o) => o.productId === product.id) : false;

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve({ dataUrl: ev.target.result, issued: false });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((newImages) => setImages((prev) => [...prev, ...newImages]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (images.length !== parseInt(stock)) {
      const ok = window.confirm(
        `Количество картинок (${images.length}) ≠ stock (${stock}). Привести stock к ${images.length}?`
      );
      if (!ok) return;
    }
    const payload = {
      name,
      price: parseFloat(price),
      stock: images.length,
      productImages: images,
    };
    if (product) {
      storage.updateProduct({ ...product, ...payload });
    } else {
      storage.addProduct(payload);
    }
    onClose();
  };

  const removeImage = (idx) => {
    if (hasOrders && images[idx].issued) {
      alert('Нельзя удалить выданную картинку');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{product ? 'Редактировать товар' : 'Новый товар'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Цена</label>
            <input type="number" className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Количество (stock)</label>
            <input type="number" className="input-field" value={stock} onChange={(e) => setStock(e.target.value)} required min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Картинки товара</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFiles}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="grid grid-cols-4 gap-2 mt-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
                  <img src={img.dataUrl} alt="" className={`w-full h-full object-cover ${img.issued ? 'opacity-40' : ''}`} />
                  {img.issued && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-red-500 rotate-45 absolute" /><div className="w-full h-0.5 bg-red-500 -rotate-45 absolute" /></div>}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">Всего: {images.length} картинок</p>
            {hasOrders && <p className="text-xs text-orange-600 mt-1">Товар уже куплен — выданные картинки нельзя удалить</p>}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 btn-primary">{product ? 'Сохранить' : 'Добавить'}</button>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}