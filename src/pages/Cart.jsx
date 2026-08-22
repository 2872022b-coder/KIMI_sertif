import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  CreditCard,
  CheckCircle,
  X,
  Mail,
  AlertCircle,
  ImageIcon,
  ShoppingBag,
  Download
} from 'lucide-react';
import { Toast } from '../components/Toast.jsx';

export function Cart() {
  const { cart, products, removeFromCart, addToCart, clearCart, createTransaction, updateProductStock, transactions } = useShop();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { ...item, product };
    })
    .filter((item) => item.product);

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Get previously purchased items
  const userTx = transactions
    .filter((t) => t.userId === user?.id && t.type === 'withdrawal' && t.productImages && t.productImages.length > 0)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const purchasedItems = userTx.flatMap((t) =>
    t.productImages.map((item, idx) => ({
      ...item,
      transactionId: t.id,
      purchasedAt: t.timestamp,
      uniqueId: `${t.id}-${item.productId}-${idx}`
    }))
  );

  const handleQuantityChange = (productId, delta) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= item.product.stock) {
      addToCart(item.product, delta);
    }
  };

  const handleCheckout = async () => {
    if (!user || total > user.balance) {
      setToast({ message: 'Недостаточно средств на балансе', type: 'error' });
      return;
    }

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        setToast({
          message: `Товар "${item.product.name}" недостаточно в наличии. Доступно: ${item.product.stock} шт`,
          type: 'error'
        });
        return;
      }
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const users = JSON.parse(localStorage.getItem('fm_users') || '[]');
    const currentUser = users.find((u) => u.id === user.id);
    if (!currentUser) {
      setIsProcessing(false);
      return;
    }

    const oldBalance = currentUser.balance;
    currentUser.balance -= total;
    localStorage.setItem('fm_users', JSON.stringify(users));

    const purchasedItems = cartItems.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.productImage || '',
      gallery: item.product.gallery || [],
      purchasedAt: new Date().toISOString(),
    }));

    createTransaction({
      userId: user.id,
      type: 'withdrawal',
      amount: total,
      balanceBefore: oldBalance,
      balanceAfter: currentUser.balance,
      comment: `Покупка товаров: ${cartItems.map((i) => `${i.product.name} (${i.quantity} шт)`).join(', ')}`,
      productImages: purchasedItems,
    });

    cartItems.forEach((item) => {
      updateProductStock(item.productId, item.quantity);
    });

    clearCart();
    refreshUser();
    setIsProcessing(false);
    setShowCheckoutModal(false);

    setToast({
      message: 'Покупка успешно завершена! Файлы отправлены на вашу почту.',
      type: 'success',
    });

    setTimeout(() => {
      setToast({
        message: `Картинки отправлены на ${user.email}`,
        type: 'success',
      });
    }, 2500);

    // Cashback 2.5% after 1 minute
    const cashbackAmount = Math.round(total * 0.025);
    if (cashbackAmount > 0) {
      setTimeout(() => {
        const usersAfter = JSON.parse(localStorage.getItem('fm_users') || '[]');
        const userAfter = usersAfter.find((u) => u.id === user.id);
        if (userAfter) {
          const balanceBeforeCashback = userAfter.balance;
          userAfter.balance += cashbackAmount;
          localStorage.setItem('fm_users', JSON.stringify(usersAfter));

          createTransaction({
            userId: user.id,
            type: 'deposit',
            amount: cashbackAmount,
            balanceBefore: balanceBeforeCashback,
            balanceAfter: userAfter.balance,
            comment: `Cashback 2.5% от покупки на ${total.toLocaleString('ru-RU')} ₽`,
          });

          refreshUser();
          setToast({
            message: `Cashback ${cashbackAmount.toLocaleString('ru-RU')} ₽ зачислен на баланс!`,
            type: 'success',
          });
        }
      }, 60000); // 1 minute
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title mb-1">Корзина</h1>
          <p className="section-subtitle">{cartItems.length} товаров на сумму {total.toLocaleString('ru-RU')} ₽</p>
        </div>
        <button
          onClick={() => {
            if (confirm('Очистить корзину?')) clearCart();
          }}
          className="btn-secondary text-sm flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <div className="card p-8 text-center">
              <ShoppingCart className="mx-auto mb-4 text-slate-300" size={48} />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Корзина пуста</h2>
              <p className="text-slate-500 mb-4">Добавьте товары из магазина</p>
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                <Package size={18} />
                В магазин
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId} className="card p-4 flex gap-4">
                <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.product.gallery?.[0] ? (
                    <img src={item.product.gallery[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-500 mb-1">{item.product.price.toLocaleString('ru-RU')} ₽ / шт</p>
                  <p className="text-xs text-slate-400 mb-2">В наличии: {item.product.stock} шт</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleQuantityChange(item.productId, -1)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.productId, 1)} disabled={item.quantity >= item.product.stock} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-slate-900">{(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors self-start">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}

          {/* Previously Purchased Items */}
          {purchasedItems.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={20} className="text-blue-600" />
                <h2 className="section-title mb-0">Ранее приобретённые товары</h2>
                <span className="badge-blue">{purchasedItems.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {purchasedItems.map((item) => (
                  <div
                    key={item.uniqueId}
                    className="card-hover overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPurchase(item)}
                  >
                    <div className="w-full h-40 bg-slate-100 relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={32} className="text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="badge-green flex items-center gap-1">
                          <CheckCircle size={12} />
                          Куплено
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-500">{item.quantity} шт × {item.price?.toLocaleString('ru-RU')} ₽</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(item.purchasedAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Итого</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Товары ({cartItems.reduce((s, i) => s + i.quantity, 0)} шт)</span>
                <span className="font-medium">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Доставка</span>
                <span className="badge-green">Бесплатно</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">К оплате</span>
                <span className="font-bold text-xl text-slate-900">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Ваш баланс</span>
                <span className={`font-bold ${user?.balance >= total ? 'text-green-700' : 'text-red-600'}`}>
                  {user?.balance?.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              {user?.balance < total && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle size={14} />
                  Недостаточно средств
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCheckoutModal(true)}
              disabled={user?.balance < total || cartItems.length === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard size={18} />
              Оформить покупку
            </button>

            <Link to="/shop" className="mt-3 w-full btn-secondary flex items-center justify-center gap-2 text-sm">
              <ArrowRight size={16} />
              Продолжить покупки
            </Link>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={18} className="text-blue-600" />
              <h4 className="font-medium text-slate-900">Доставка</h4>
            </div>
            <p className="text-sm text-slate-500">
              После покупки файлы-картинки будут отправлены на ваш email:{' '}
              <span className="font-medium text-slate-700">{user?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Подтверждение покупки</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.gallery?.[0] ? (
                      <img src={item.product.gallery[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="m-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.quantity} шт × {item.product.price.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Списано с баланса</span>
                <span className="font-bold text-red-600">-{total.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Останется на балансе</span>
                <span className="font-bold text-green-700">{(user?.balance - total).toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-xl mb-6 flex items-start gap-3">
              <ImageIcon size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Файлы будут отправлены на почту</p>
                <p className="text-green-700">{user?.email}</p>
                <p className="text-xs text-green-600 mt-1">Вы получите productImage (файл-картинку) для каждого товара</p>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={isProcessing} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Подтвердить покупку
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <div className="modal-overlay" onClick={() => setSelectedPurchase(null)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">{selectedPurchase.name}</h3>
              <button onClick={() => setSelectedPurchase(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden mb-4">
              {selectedPurchase.image ? (
                <img src={selectedPurchase.image} alt={selectedPurchase.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} className="text-slate-300" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-500">Количество</span><span className="font-medium">{selectedPurchase.quantity} шт</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Цена за шт</span><span className="font-medium">{selectedPurchase.price?.toLocaleString('ru-RU')} ₽</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Итого</span><span className="font-bold">{(selectedPurchase.price * selectedPurchase.quantity)?.toLocaleString('ru-RU')} ₽</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Дата покупки</span><span className="font-medium">{new Date(selectedPurchase.purchasedAt).toLocaleString('ru-RU')}</span></div>
            </div>
            {selectedPurchase.image && (
              <a href={selectedPurchase.image} download={`${selectedPurchase.name}.jpg`} className="mt-4 w-full btn-primary flex items-center justify-center gap-2">
                <Download size={18} />
                Скачать файл
              </a>
            )}
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
