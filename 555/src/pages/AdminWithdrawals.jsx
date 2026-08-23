import React from 'react';
import { useWithdraw } from '../context/WithdrawContext.jsx';
import { CheckCircle, XCircle, ArrowDownCircle, User } from 'lucide-react';

export function AdminWithdrawals() {
  const { requests, approveWithdrawRequest, rejectWithdrawRequest } = useWithdraw();

  const pending = requests.filter((r) => r.status === 'pending');
  const processed = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Заявки на вывод</h1>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">Ожидают подтверждения ({pending.length})</h2>
      <div className="space-y-4 mb-8">
        {pending.map((req) => (
          <div key={req.id} className="card border-l-4 border-l-orange-400">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className="text-slate-400" />
                  <span className="font-medium text-slate-900">{req.userName}</span>
                  <span className="text-xs text-slate-500">{req.userEmail}</span>
                </div>
                <p className="text-sm text-slate-600">
                  Сумма: <span className="font-bold">{req.amount.toLocaleString('ru-RU')} ₽</span> 
                  {' '}· Комиссия: {req.commission.toLocaleString('ru-RU')} ₽
                  {' '}· Итого списано: <span className="font-bold text-orange-700">{req.total.toLocaleString('ru-RU')} ₽</span>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {req.recipientType === 'card' ? 'Карта' : 'Телефон'}: <span className="font-mono font-medium">{req.recipientValue}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">{new Date(req.createdAt).toLocaleString('ru-RU')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveWithdrawRequest(req.id)}
                  className="btn-success flex items-center gap-1 text-sm"
                >
                  <CheckCircle size={16} />
                  Подтвердить
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Причина отклонения:');
                    if (reason) rejectWithdrawRequest(req.id, reason);
                  }}
                  className="btn-danger flex items-center gap-1 text-sm"
                >
                  <XCircle size={16} />
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        ))}
        {pending.length === 0 && <div className="text-center py-8 text-slate-500">Нет ожидающих заявок</div>}
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">Обработанные ({processed.length})</h2>
      <div className="space-y-4">
        {processed.map((req) => (
          <div key={req.id} className={`card border-l-4 ${req.status === 'approved' ? 'border-l-green-400' : 'border-l-red-400'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{req.userName} · {req.amount.toLocaleString('ru-RU')} ₽</p>
                <p className="text-sm text-slate-500">{req.recipientType === 'card' ? 'Карта' : 'Телефон'}: {req.recipientValue}</p>
                <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleString('ru-RU')}</p>
              </div>
              <span className={`badge-${req.status === 'approved' ? 'green' : 'red'}`}>
                {req.status === 'approved' ? 'Подтверждено' : 'Отклонено'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}