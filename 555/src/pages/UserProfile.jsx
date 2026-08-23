import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Phone,
  FileText
} from 'lucide-react';
import { Toast } from '../components/Toast.jsx';

export function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { transactions, createTransaction } = useShop();
  const [activeTab, setActiveTab] = useState('history');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('add');
  const [toast, setToast] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="card p-8 text-center">
        <Shield className="mx-auto mb-2 text-red-400" size={32} />
        <p className="text-red-600">Доступ запрещен. Требуются права администратора.</p>
      </div>
    );
  }

  // Get target user
  const users = storage.getUsers();
  const targetUser = users.find((u) => u.id === userId);

  if (!targetUser) {
    return (
      <div className="card p-8 text-center">
        <User className="mx-auto mb-2 text-slate-400" size={32} />
        <p className="text-slate-500">Пользователь не найден</p>
        <button onClick={() => navigate('/admin')} className="mt-4 btn-secondary">
          <ArrowLeft size={16} className="inline mr-1" />
          Назад в админ-панель
        </button>
      </div>
    );
  }

  const userTx = transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Purchased items from new format
  const purchasedItems = userTx
    .filter((t) => t.type === 'withdrawal' && t.purchasedItems && t.purchasedItems.length > 0)
    .flatMap((t) =>
      t.purchasedItems.flatMap((item) =>
        (item.images || []).map((img, idx) => ({
          ...item,
          imageId: img.id,
          imageUrl: img.url,
          imageIndex: idx,
          transactionId: t.id,
          purchasedAt: t.timestamp,
          uniqueId: `${t.id}-${item.productId}-${img.id}`,
        }))
      )
    );

  const handleAdjustBalance = () => {
    const amount = parseFloat(adjustAmount);
    if (!amount || amount <= 0) {
      setToast({ message: 'Введите корректную сумму', type: 'error' });
      return;
    }

    const oldBalance = targetUser.balance;
    const newBalance = adjustType === 'add' ? oldBalance + amount : oldBalance - amount;

    if (newBalance < 0) {
      setToast({ message: 'Недостаточно средств для списания', type: 'error' });
      return;
    }

    targetUser.balance = newBalance;
    storage.setUsers(users);

    createTransaction({
      userId: targetUser.id,
      type: 'admin_adjust',
      amount: amount,
      balanceBefore: oldBalance,
      balanceAfter: newBalance,
      comment: adjustType === 'add' ? 'Зачисление администратором' : 'Списание администратором',
    });

    setShowAdjustModal(false);
    setAdjustAmount('');
    setToast({ message: 'Баланс изменен', type: 'success' });
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
      {/* Back button */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Назад в админ-панель
      </button>

      {/* User Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{targetUser.name || '—'}</h1>
              <p className="text-slate-500 text-sm flex items-center gap-1">
                <Mail size={12} />
                {targetUser.email}
              </p>
              <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                <Phone size={12} />
                <span className="font-mono">{targetUser.phone || '—'}</span>
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {targetUser.role === 'admin' ? 'Администратор' : 'Клиент'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAdjustType('add');
                setShowAdjustModal(true);
              }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <ArrowUpCircle size={16} />
              Зачислить
            </button>
            <button
              onClick={() => {
                setAdjustType('remove');
                setShowAdjustModal(true);
              }}
              className="btn-secondary flex items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50"
            >
              <ArrowDownCircle size={16} />
              Списать
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Личный ID</p>
            <p className="text-lg font-bold font-mono text-slate-900">{targetUser.id}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-1">Баланс</p>
            <p className="text-2xl font-bold text-green-800">
              {targetUser.balance?.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-1">Куплено картинок</p>
            <p className="text-2xl font-bold text-blue-800">{purchasedItems.length}</p>
          </div>
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
          <ShoppingBag size={16} className="inline mr-1" /> Покупки{' '}
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

      {/* Purchases Tab — TABLE FORMAT */}
      {activeTab === 'purchases' && (
        <div>
          {purchasedItems.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <ShoppingBag className="mx-auto mb-2 text-slate-400" size={32} />
              <p>У пользователя пока нет купленных товаров</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700 font-medium">
                    <tr>
                      <th className="table-header">Картинка</th>
                      <th className="table-header">Товар</th>
                      <th className="table-header">Цена</th>
                      <th className="table-header">Кол-во в заказе</th>
                      <th className="table-header">Номер картинки</th>
                      <th className="table-header">Дата</th>
                      <th className="table-header">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchasedItems.map((item) => (
                      <tr key={item.uniqueId} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="m-2 text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <p className="font-medium text-slate-900">{item.name}</p>
                        </td>
                        <td className="table-cell font-medium">
                          {item.price?.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="table-cell">
                          {item.quantity} шт
                        </td>
                        <td className="table-cell">
                          <span className="badge-blue">#{item.imageIndex + 1}</span>
                        </td>
                        <td className="table-cell text-slate-500 whitespace-nowrap">
                          {new Date(item.purchasedAt).toLocaleString('ru-RU')}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedPurchase(item)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Просмотр"
                            >
                              <FileText size={16} />
                            </button>
                            {item.imageUrl && (
                              <a
                                href={item.imageUrl}
                                download={`${item.name}_${item.imageIndex + 1}.jpg`}
                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                title="Скачать"
                              >
                                <Download size={16} />
                              </a>
                            )}
                          </div>
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

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <div className="modal-overlay" onClick={() => setSelectedPurchase(null)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">{selectedPurchase.name}</h3>
              <button onClick={() => setSelectedPurchase(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden mb-4">
              {selectedPurchase.imageUrl ? (
                <img src={selectedPurchase.imageUrl} alt={selectedPurchase.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} className="text-slate-300" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-500">Количество в заказе</span><span className="font-medium">{selectedPurchase.quantity} шт</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Цена за шт</span><span className="font-medium">{selectedPurchase.price?.toLocaleString('ru-RU')} ₽</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Итого</span><span className="font-bold">{(selectedPurchase.price * selectedPurchase.quantity)?.toLocaleString('ru-RU')} ₽</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Номер картинки</span><span className="font-medium">#{selectedPurchase.imageIndex + 1}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Дата покупки</span><span className="font-medium">{new Date(selectedPurchase.purchasedAt).toLocaleString('ru-RU')}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {adjustType === 'add' ? 'Зачисление на баланс' : 'Списание с баланса'}
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Текущий баланс</p>
                <p className="text-2xl font-bold text-slate-900">{targetUser.balance.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Сумма</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Например: 1000"
                    className="input-field text-lg pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₽</span>
                </div>
              </div>
              <button onClick={handleAdjustBalance} className="w-full btn-primary">
                {adjustType === 'add' ? 'Зачислить' : 'Списать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
