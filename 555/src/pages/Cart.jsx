import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessage } from '../context/MessageContext.jsx';
import storage from '../services/storage.js';
import { Trash2, Minus, Plus, ShoppingBag, Image } from 'lucide-react';

export function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const { showToast } = useMessage();
  const navigate = useNavigate();
  const products = storage.getProducts();

  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      const images = product.productImages || [];
      const available = images.filter((img) => !img.issued).length;
      const maxQty = Math.min(product.stock, available);
      return { product, quantity, maxQty, available };
    })
    .filter(Boolean);

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      showToast('Войдите, чтобы оформить заказ', 'warning');
      navigate('/login');
      return;
    }
    if (user.balance < total) {
      showToast('Недостаточно средств на балансе', 'error');
      return;
    }

    const orders = [];
    for (const item of cartItems) {
      const product = item.product;
      const images = product.productImages || [];
      const freeImages = images.filter((img) => !img.issued);
      
      if (freeImages.length < item.quantity) {
        showToast(`Недостаточно картинок для «${product.name}»`, 'error');
        return;
      }

      const assigned = [];
      for (let i = 0; i < item.quantity; i++) {
        freeImages[i].issued = true;
        freeImages[i].issuedTo = user.id;
        assigned.push(freeImages[i]);
      }

      storage.updateProduct(product);
      orders.push({
        userId: user.id,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        images: assigned,
        total: product.price * item.quantity,
      });
    }

    // Deduct balance
    const users = storage.getUsers();
    const currentUser = users.find((u) => u.id === user.id);
    currentUser.balance -= total;
    storage.setUsers(users);
    refreshUser();

    // Save orders
    const existingOrders = storage.getOrders();
    storage.setOrders([...existingOrders, ...orders]);

    clearCart();
    showToast('Покупка успешно оформлена!', 'success');
    navigate('/purchased');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Корзина пуста</h2>
        <p className="text-slate-500 mt-2">Добавьте товары из каталога</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Корзина</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.product.id} className="card flex gap-4 items-center">
            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
              {item.product.productImages?.[0] ? (
                <img
                  src={item.product.productImages[0].dataUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Image size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{item.product.name}</h3>
              <p className="text-sm text-slate-500">{item.product.price} ₽ / шт</p>
              <p className="text-xs text-slate-500 mt-1">
                Доступно картинок: {item.available} шт
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, Math.min(item.maxQty, item.quantity + 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-slate-900">{(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
            </div>
            <button
              onClick={() => removeFromCart(item.product.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-slate-700">Итого:</span>
          <span className="text-2xl font-bold text-slate-900">{total.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
          <span>Баланс:</span>
          <span>{(user?.balance || 0).toLocaleString('ru-RU')} ₽</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={!user || user.balance < total}
          className="w-full btn-primary disabled:opacity-50"
        >
          Оформить заказ
        </button>
        {!user && <p className="text-xs text-red-600 mt-2 text-center">Войдите, чтобы оформить заказ</p>}
        {user && user.balance < total && (
          <p className="text-xs text-red-600 mt-2 text-center">Недостаточно средств</p>
        )}
      </div>
    </div>
  );
}