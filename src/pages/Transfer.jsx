import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import storage from '../services/storage.js';
import { TRANSACTION_TYPES } from '../utils/constants.js';
import {
  Send,
  UserCheck,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Wallet,
  User,
  Clock
} from 'lucide-react';
import { Toast } from '../components/Toast.jsx';

export function Transfer() {
  const { user, refreshUser } = useAuth();
  const { createTransaction, transactions } = useShop();
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [toast, setToast] = useState(null);

  // Filter transfer transactions for current user
  const transferTx = transactions
    .filter(
      (t) =>
        t.userId === user?.id &&
        (t.type === TRANSACTION_TYPES.TRANSFER_OUT || t.type === TRANSACTION_TYPES.TRANSFER_IN)
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleSubmit = (e) => {
    e.preventDefault();
    const sum = parseFloat(amount);
    if (!sum || sum <= 0) {
      setToast({ message: 'Введите корректную сумму', type: 'error' });
      return;
    }
    if (recipientId === user.id) {
      setToast({ message: 'Нельзя перевести самому себе', type: 'error' });
      return;
    }

    const users = storage.getUsers();
    const senderIndex = users.findIndex((u) => u.id === user.id);
    const recipientIndex = users.findIndex((u) => u.id === recipientId);

    if (recipientIndex === -1) {
      setToast({ message: 'Получатель не найден', type: 'error' });
      return;
    }
    if (users[senderIndex].balance < sum) {
      setToast({ message: 'Недостаточно средств на балансе', type: 'error' });
      return;
    }

    const senderBefore = users[senderIndex].balance;
    users[senderIndex].balance -= sum;
    const recipientBefore = users[recipientIndex].balance;
    users[recipientIndex].balance += sum;
    storage.setUsers(users);

    createTransaction({
      userId: user.id,
      type: TRANSACTION_TYPES.TRANSFER_OUT,
      amount: sum,
      balanceBefore: senderBefore,
      balanceAfter: users[senderIndex].balance,
      targetUserId: users[recipientIndex].id,
      targetUserName: users[recipientIndex].name,
      productIds: [],
      comment: `Перевод пользователю ${users[recipientIndex].name} (${users[recipientIndex].id})`,
    });

    createTransaction({
      userId: users[recipientIndex].id,
      type: TRANSACTION_TYPES.TRANSFER_IN,
      amount: sum,
      balanceBefore: recipientBefore,
      balanceAfter: users[recipientIndex].balance,
      targetUserId: user.id,
      targetUserName: user.name,
      productIds: [],
      comment: `Зачисление от ${user.name} (${user.id})`,
    });

    refreshUser();
    setRecipientId('');
    setAmount('');
    setToast({
      message: `Успешно переведено ${sum.toLocaleString('ru-RU')} ₽`,
      type: 'success',
    });
  };

  const getTransferIcon = (type) => {
    if (type === TRANSACTION_TYPES.TRANSFER_OUT) {
      return <ArrowUpRight className="text-red-600" size={18} />;
    }
    return <ArrowDownLeft className="text-green-600" size={18} />;
  };

  const getTransferLabel = (type) => {
    if (type === TRANSACTION_TYPES.TRANSFER_OUT) {
      return 'Перевод';
    }
    return 'Поступление';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="section-title mb-1">Перевод средств</h1>
        <p className="section-subtitle">Отправьте деньги другому пользователю по ID</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={18} className="text-blue-600" />
                <p className="text-sm text-blue-700 font-medium">Ваш текущий баланс</p>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {user?.balance?.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ID получателя
                </label>
                <div className="relative">
                  <UserCheck
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    required
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value.toUpperCase())}
                    placeholder="Например: SRT00002"
                    className="input-field pl-10 font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Введите личный ID получателя из его профиля
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Сумма перевода
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Например: 1000"
                    className="input-field pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    ₽
                  </span>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                <Send size={18} />
                Отправить
              </button>
            </form>
          </div>
        </div>

        {/* Transfer History */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <History size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-900">История переводов</h3>
              <span className="badge-slate ml-2">{transferTx.length}</span>
            </div>

            {transferTx.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <History className="mx-auto mb-2 text-slate-300" size={32} />
                <p>История переводов пуста</p>
                <p className="text-xs text-slate-400 mt-1">
                  Здесь будут отображаться ваши переводы и поступления
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-header">Тип</th>
                      <th className="table-header">Сумма</th>
                      <th className="table-header">Контрагент</th>
                      <th className="table-header">Баланс</th>
                      <th className="table-header">Дата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transferTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            {getTransferIcon(tx.type)}
                            <span className="font-medium">{getTransferLabel(tx.type)}</span>
                          </div>
                        </td>
                        <td className="table-cell font-bold">
                          <span
                            className={
                              tx.type === TRANSACTION_TYPES.TRANSFER_OUT
                                ? 'text-red-600'
                                : 'text-green-700'
                            }
                          >
                            {tx.type === TRANSACTION_TYPES.TRANSFER_OUT ? '-' : '+'}
                            {tx.amount.toLocaleString('ru-RU')} ₽
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User size={14} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{tx.targetUserName}</p>
                              <p className="text-xs text-slate-500 font-mono">{tx.targetUserId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-slate-600">
                          {tx.balanceBefore.toLocaleString('ru-RU')} →{' '}
                          {tx.balanceAfter.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="table-cell text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(tx.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
