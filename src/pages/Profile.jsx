import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import storage from '../services/storage.js';
import {
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Download,
  History,
  Shield,
  Wallet,
  X,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  ImageIcon,
  Mail,
  Copy,
  Check,
  Package,
  Camera,
  Edit3,
  Save,
  Upload
} from 'lucide-react';
import { Toast } from '../components/Toast.jsx';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function Profile() {
  const { user, refreshUser } = useAuth();
  const { transactions, createDepositRequest } = useShop();
  const [activeTab, setActiveTab] = useState('history');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const userTx = transactions
    .filter((t) => t.userId === user?.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Get purchased items from transactions
  const purchasedItems = userTx
    .filter((t) => t.type === 'withdrawal' && t.productImages && t.productImages.length > 0)
    .flatMap((t) => 
      t.productImages.map((item, idx) => ({
        ...item,
        transactionId: t.id,
        purchasedAt: t.timestamp,
        uniqueId: `${t.id}-${item.productId}-${idx}`
      }))
    );

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await readFileAsBase64(file);
      const users = storage.getUsers();
      const currentUser = users.find((u) => u.id === user.id);
      if (currentUser) {
        currentUser.photo = base64;
        storage.setUsers(users);
        refreshUser();
        setToast({ message: 'Фото обновлено', type: 'success' });
      }
    } catch {
      setToast({ message: 'Ошибка загрузки фото', type: 'error' });
    }
  };

  const handleSaveName = () => {
    if (!newName.trim()) {
      setToast({ message: 'Введите имя', type: 'error' });
      return;
    }
    const users = storage.getUsers();
    const currentUser = users.find((u) => u.id === user.id);
    if (currentUser) {
      currentUser.name = newName.trim();
      storage.setUsers(users);
      refreshUser();
      setIsEditingName(false);
      setToast({ message: 'Имя обновлено', type: 'success' });
    }
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setToast({ message: 'Введите корректную сумму', type: 'error' });
      return;
    }
    if (amount > 10000) {
      setToast({ message: 'Максимальная сумма пополнения — 10 000 ₽', type: 'error' });
      return;
    }
    setShowDepositModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = () => {
    createDepositRequest({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: parseFloat(depositAmount),
    });
    setShowPaymentModal(false);
    setDepositAmount('');
    setToast({
      message: 'Заявка на пополнение отправлена администратору',
      type: 'success',
    });
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText('2200 1234 5678 9012');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <Download className="text-green-600" size={18} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-red-600" size={18} />;
      case 'transfer_out':
        return <Send className="text-orange-600" size={18} />;
      case 'transfer_in':
        return <ArrowDownLeft className="text-blue-600" size={18} />;
      case 'admin_adjust':
        return <Shield className="text-purple-600" size={18} />;
      default:
        return <History className="text-slate-600" size={18} />;
    }
  };

  const getLabel = (type) =>
    ({
      deposit: 'Пополнение',
      withdrawal: 'Списание (покупка)',
      transfer_out: 'Перевод',
      transfer_in: 'Зачисление',
      admin_adjust: 'Изменение баланса',
    }[type] || type);

  return (
    <div className="space-y-6 relative animate-fade-in">
      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          {/* Photo with upload */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
              {user?.photo ? (
                <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Name and email */}
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field text-lg py-2 px-3"
                  placeholder="Ваш ник"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                  <Save size={18} />
                </button>
                <button onClick={() => { setIsEditingName(false); setNewName(user?.name || ''); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
                <button onClick={() => setIsEditingName(true)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Изменить ник">
                  <Edit3 size={16} />
                </button>
              </div>
            )}
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {user?.role === 'admin' ? 'Администратор' : 'Клиент'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Личный ID</p>
            <p className="text-lg font-bold font-mono text-slate-900">{user?.id}</p>
          </div>
          <button
            onClick={() => setShowDepositModal(true)}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700 font-medium mb-1">
                Баланс (нажмите для пополнения)
              </p>
              <Wallet
                size={20}
                className="text-green-600 group-hover:scale-110 transition-transform"
              />
            </div>
            <p className="text-2xl font-bold text-green-800">
              {user?.balance?.toLocaleString('ru-RU')} ₽
            </p>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History size={16} className="inline mr-1" /> История операций
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'purchases'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag size={16} className="inline mr-1" /> Мои покупки{' '}
          {purchasedItems.length > 0 && (
            <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {purchasedItems.length}
            </span>
          )}
        </button>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {userTx.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <History className="mx-auto mb-2 text-slate-400" size={32} />
              <p>История операций пуста</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700 font-medium">
                    <tr>
                      <th className="table-header">Тип</th>
                      <th className="table-header">Сумма</th>
                      <th className="table-header">Было / Стало</th>
                      <th className="table-header">Детали</th>
                      <th className="table-header">Дата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            {getIcon(tx.type)}
                            <span>{getLabel(tx.type)}</span>
                          </div>
                        </td>
                        <td className="table-cell font-medium">
                          <span
                            className={
                              tx.type === 'withdrawal' || tx.type === 'transfer_out' || 
                              (tx.type === 'admin_adjust' && tx.balanceAfter < tx.balanceBefore)
                                ? 'text-red-600'
                                : 'text-green-700'
                            }
                          >
                            {tx.type === 'withdrawal' || tx.type === 'transfer_out' || 
                             (tx.type === 'admin_adjust' && tx.balanceAfter < tx.balanceBefore)
                               ? '-' : '+'}
                            {tx.amount.toLocaleString('ru-RU')} ₽
                          </span>
                        </td>
                        <td className="table-cell text-slate-600">
                          {tx.balanceBefore.toLocaleString('ru-RU')} →{' '}
                          {tx.balanceAfter.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="table-cell text-slate-600 max-w-xs truncate" title={tx.comment}>
                          {tx.comment}
                        </td>
                        <td className="table-cell text-slate-500 whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <div>
          {purchasedItems.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <ShoppingBag className="mx-auto mb-2 text-slate-400" size={32} />
              <p>У вас пока нет купленных товаров</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedItems.map((item) => (
                <div
                  key={item.uniqueId}
                  className="card-hover overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPurchase(item)}
                >
                  {/* Product Image (productImage - the deliverable file) */}
                  <div className="w-full h-48 bg-slate-100 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
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
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">
                      {item.quantity} шт × {item.price?.toLocaleString('ru-RU')} ₽
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail size={16} className="text-green-600" />
                      </div>
                      <p className="text-xs text-slate-500">Отправлено на {user?.email}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(item.purchasedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <div className="modal-overlay" onClick={() => setSelectedPurchase(null)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">{selectedPurchase.name}</h3>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Large product image */}
            <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden mb-4">
              {selectedPurchase.image ? (
                <img
                  src={selectedPurchase.image}
                  alt={selectedPurchase.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} className="text-slate-300" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Количество</span>
                <span className="font-medium">{selectedPurchase.quantity} шт</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Цена за шт</span>
                <span className="font-medium">{selectedPurchase.price?.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Итого</span>
                <span className="font-bold">
                  {(selectedPurchase.price * selectedPurchase.quantity)?.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Дата покупки</span>
                <span className="font-medium">
                  {new Date(selectedPurchase.purchasedAt).toLocaleString('ru-RU')}
                </span>
              </div>
              <div className="p-3 bg-green-50 rounded-xl flex items-center gap-2">
                <Mail size={16} className="text-green-600" />
                <span className="text-sm text-green-700">
                  Файл отправлен на {user?.email}
                </span>
              </div>
            </div>

            {selectedPurchase.image && (
              <a
                href={selectedPurchase.image}
                download={`${selectedPurchase.name}.jpg`}
                className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Скачать файл
              </a>
            )}
          </div>
        </div>
      )}

      {/* Deposit Modal - Step 1: Amount */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Wallet size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Пополнение баланса</h3>
                  <p className="text-sm text-slate-500">Шаг 1 из 2</p>
                </div>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Сумма пополнения
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max="10000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Например: 5000"
                    className="input-field text-lg pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    ₽
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {[500, 1000, 2500, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setDepositAmount(amount.toString())}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      {amount.toLocaleString('ru-RU')}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                  <AlertCircle size={14} className="text-orange-500" />
                  Максимальная сумма пополнения — 10 000 ₽
                </p>
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                Далее
                <ArrowUpRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal - Step 2: Payment Method */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Способы оплаты</h3>
                  <p className="text-sm text-slate-500">Шаг 2 из 2</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Card Info */}
              <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-100">Карта МИР</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-white/20 rounded" />
                    <div className="w-8 h-5 bg-white/20 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-2xl font-mono font-bold tracking-wider">
                    2200 1234 5678 9012
                  </p>
                  <button
                    onClick={copyCardNumber}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Копировать номер"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-200 mb-0.5">Получатель</p>
                    <p className="text-sm font-medium">ФИО: Иванов Иван Иванович</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-200 mb-0.5">Сумма</p>
                    <p className="text-xl font-bold">
                      {parseFloat(depositAmount).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 space-y-1">
                    <p className="font-medium">Инструкция по оплате:</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-700">
                      <li>Переведите указанную сумму на карту МИР</li>
                      <li>После перевода нажмите кнопку «Перевёл» для подтверждения</li>
                      <li>Администратор проверит поступление и зачислит средства на ваш баланс</li>
                    </ol>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePaymentConfirmed}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Перевёл
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
