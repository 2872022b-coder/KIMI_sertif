import React, { useState } from 'react';
import storage from '../services/storage.js';
import { Calendar, Filter, Download, X } from 'lucide-react';

export function AdminOrders() {
  const [filterType, setFilterType] = useState('all');
  const [dateValue, setDateValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const allOrders = storage.getOrders();

  const filtered = allOrders.filter((order) => {
    const d = new Date(order.createdAt);
    if (filterType === 'all') return true;
    if (filterType === 'day') {
      const target = new Date(dateValue);
      return d.toDateString() === target.toDateString();
    }
    if (filterType === 'month') {
      const [year, month] = dateValue.split('-');
      return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1;
    }
    if (filterType === 'year') {
      return d.getFullYear() === parseInt(dateValue);
    }
    if (filterType === 'interval') {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59);
      return d >= s && d <= e;
    }
    return true;
  });

  const totalSum = filtered.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Заказы</h1>

      <div className="card mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Фильтр</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">Все время</option>
              <option value="day">День</option>
              <option value="month">Месяц</option>
              <option value="year">Год</option>
              <option value="interval">Интервал</option>
            </select>
          </div>

          {filterType === 'day' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {filterType === 'month' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Месяц</label>
              <input
                type="month"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {filterType === 'year' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Год</label>
              <input
                type="number"
                placeholder="2024"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="input-field w-32"
              />
            </div>
          )}

          {filterType === 'interval' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">От</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">До</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
              </div>
            </>
          )}

          <button
            onClick={() => { setFilterType('all'); setDateValue(''); setStartDate(''); setEndDate(''); }}
            className="btn-secondary flex items-center gap-1"
          >
            <X size={14} />
            Сбросить
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Показано: {filtered.length} заказов</p>
          <p className="text-lg font-bold text-slate-900">Сумма: {totalSum.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((order) => (
          <div key={order.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{order.productName}</p>
                <p className="text-sm text-slate-500">Клиент: {order.userName || order.userEmail}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(order.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{order.total.toLocaleString('ru-RU')} ₽</p>
                <p className="text-xs text-slate-500">{order.quantity} шт</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">Заказы не найдены</div>
        )}
      </div>
    </div>
  );
}