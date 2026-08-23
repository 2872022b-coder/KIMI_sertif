import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useWithdraw } from '../context/WithdrawContext.jsx';
import storage from '../services/storage.js';
import {
  X,
  ArrowDownCircle,
  CreditCard,
  Phone,
  AlertCircle,
  CheckCircle,
  Wallet
} from 'lucide-react';
import { Toast } from './Toast.jsx';

export function WithdrawModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const { createWithdrawRequest } = useWithdraw();
  const [toast, setToast] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [recipientType, setRecipientType] = useState('card');
  const [recipientValue, setRecipientValue] = useState('');
  const [step, setStep] = useState('form');

  const COMMISSION_RATE = 0.05;
  const MIN_AMOUNT = 100;
  const MAX_AMOUNT = 10000;

  const commission = amount ? Math.round(parseFloat(amount) * COMMISSION_RATE) : 0;
  const total = amount ? parseFloat(amount) + commission : 0;
  const receiveAmount = amount ? parseFloat(amount) : 0;

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setRecipientValue('');
      setRecipientType('card');
      setStep('form');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < MIN_AMOUNT) {
      setToast({ message: `Минимальная сумма вывода — ${MIN_AMOUNT} ₽`, type: 'error' });
      return;
    }
    if (numAmount > MAX_AMOUNT) {
      setToast({ message: `Максимальная сумма вывода — ${MAX_AMOUNT.toLocaleString('ru-RU')} ₽`, type: 'error' });
      return;
    }
    if (total > user?.balance) {
      setToast({ message: 'Недостаточно средств на балансе (учтите комиссию 5%)', type: 'error' });
      return;
    }
    if (!recipientValue.trim()) {
      setToast({ message: recipientType === 'card' ? 'Введите номер карты' : 'Введите номер телефона', type: 'error' });
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    
    const users = storage.getUsers();
    const currentUser = users.find((u) => u.id === user.id);
    if (currentUser) {
      currentUser.balance -= total;
      currentUser.blockedBalance = (currentUser.blockedBalance || 0) + total;
      storage.setUsers(users);
    }

    createWithdrawRequest({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: numAmount,
      commission,
      total,
      recipientType,
      recipientValue: recipientValue.trim(),
      balanceBefore: user.balance,
    });

    refreshUser();
    setStep('success');
    setToast({ message: 'Заявка на вывод отправлена администратору', type: 'success' });
  };

  const formatCard = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatPhone = (value) => {
    let clean = value.replace(/[^\d+]/g, '');
    if (clean.length > 0 && !clean.startsWith('+')) {
      clean = '+' + clean.replace(/\+/g, '');
    }
    return clean.slice(0, 12);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <ArrowDownCircle size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Вывод средств</h3>
              <p className="text-sm text-slate-500">Комиссия 5%</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Сумма вывода <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field text-lg pr-12"
                  placeholder={`От ${MIN_AMOUNT} до ${MAX_AMOUNT.toLocaleString('ru-RU')}`}
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₽</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[500, 1000, 2500, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    {preset.toLocaleString('ru-RU')}
                  </button>
                ))}
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Сумма к получению</span>
                  <span className="font-medium">{receiveAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Комиссия (5%)</span>
                  <span className="font-medium text-orange-600">{commission.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="border-t border-orange-200 pt-1 flex justify-between">
                  <span className="font-medium text-slate-700">Списано с баланса</span>
                  <span className="font-bold text-orange-700">{total.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Способ получения</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setRecipientType('card'); setRecipientValue(''); }}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                    recipientType === 'card'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCard size={18} />
                  Карта
                </button>
                <button
                  type="button"
                  onClick={() => { setRecipientType('phone'); setRecipientValue(''); }}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                    recipientType === 'phone'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Phone size={18} />
                  Телефон
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {recipientType === 'card' ? 'Номер карты' : 'Номер телефона'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientValue}
                onChange={(e) => setRecipientValue(
                  recipientType === 'card' ? formatCard(e.target.value) : formatPhone(e.target.value)
                )}
                className="input-field font-mono"
                placeholder={recipientType === 'card' ? '0000 0000 0000 0000' : '+71234567890'}
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Доступно на балансе</span>
                <span className={`font-medium ${total > user?.balance ? 'text-red-600' : 'text-slate-700'}`}>
                  {user?.balance?.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              {total > user?.balance && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Недостаточно средств (с учётом комиссии {total.toLocaleString('ru-RU')} ₽)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!amount || !recipientValue.trim() || total > user?.balance}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowDownCircle size={18} />
              Продолжить
            </button>
          </form>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-3">Подтвердите вывод</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Сумма</span>
                  <span className="font-medium">{receiveAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Комиссия (5%)</span>
                  <span className="font-medium text-orange-600">{commission.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="font-medium text-slate-700">Итого списано</span>
                  <span className="font-bold text-slate-900">{total.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Куда</span>
                  <span className="font-medium font-mono">{recipientValue}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800 flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  Средства будут заблокированы до подтверждения администратором. 
                  После подтверждения деньги будут переведены на указанные реквизиты.
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleConfirm} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                Подтвердить
              </button>
              <button onClick={() => setStep('form')} className="flex-1 btn-secondary">
                Назад
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Заявка отправлена!</h4>
            <p className="text-sm text-slate-600">
              Администратор рассмотрит заявку и переведёт деньги на указанные реквизиты.
            </p>
            <button onClick={onClose} className="btn-primary w-full">
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}