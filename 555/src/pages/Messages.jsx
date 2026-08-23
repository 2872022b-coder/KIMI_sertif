import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessages } from '../context/MessageContext.jsx';
import {
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  Mail,
  User,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Inbox,
  MessageSquare
} from 'lucide-react';
import { Toast } from '../components/Toast.jsx';

export function Messages() {
  const { user } = useAuth();
  const { sendMessage, getUserMessages, markAsRead } = useMessages();
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState(null);

  const [form, setForm] = useState({
    subject: '',
    content: '',
  });

  const userMessages = getUserMessages(user?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.content.trim()) {
      setToast({ message: 'Заполните тему и текст вопроса', type: 'error' });
      return;
    }

    sendMessage({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject: form.subject.trim(),
      content: form.content.trim(),
    });

    setForm({ subject: '', content: '' });
    setShowForm(false);
    setToast({ message: 'Вопрос отправлен администратору', type: 'success' });
  };

  const getStatusBadge = (msg) => {
    switch (msg.status) {
      case 'pending':
        return (
          <span className="badge-orange flex items-center gap-1">
            <Clock size={12} />
            Ожидает ответа
          </span>
        );
      case 'answered':
        return (
          <span className="badge-green flex items-center gap-1">
            <CheckCircle size={12} />
            Есть ответ
          </span>
        );
      case 'closed':
        return (
          <span className="badge-slate flex items-center gap-1">
            <CheckCircle size={12} />
            Закрыто
          </span>
        );
      default:
        return null;
    }
  };

  const toggleExpand = (msgId) => {
    const msg = userMessages.find((m) => m.id === msgId);
    if (msg && msg.status === 'answered' && expandedMsg !== msgId) {
      markAsRead(msgId);
    }
    setExpandedMsg(expandedMsg === msgId ? null : msgId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="text-white" size={24} />
          </div>
          <div>
            <h1 className="section-title mb-0">Сообщения</h1>
            <p className="section-subtitle">Задайте вопрос администратору</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <MessageSquare size={18} />
          {showForm ? 'Отменить' : 'Новый вопрос'}
        </button>
      </div>

      {/* New Question Form */}
      {showForm && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Send size={20} className="text-blue-600" />
            Новый вопрос администратору
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Тема <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input-field"
                placeholder="Например: Проблема с оплатой"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ваш вопрос <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="input-field min-h-[120px] resize-none"
                placeholder="Опишите ваш вопрос подробно..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Send size={18} />
                Отправить
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                <X size={18} />
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages List */}
      <div>
        {userMessages.length === 0 ? (
          <div className="card p-12 text-center">
            <Inbox className="mx-auto mb-4 text-slate-300" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Нет сообщений</h3>
            <p className="text-slate-500">
              У вас пока нет вопросов администратору. Нажмите «Новый вопрос» чтобы начать.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userMessages.map((msg) => (
              <div
                key={msg.id}
                className={`card overflow-hidden transition-all ${
                  msg.status === 'answered' ? 'border-green-300' : ''
                }`}
              >
                {/* Message Header */}
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpand(msg.id)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 truncate">{msg.subject}</h4>
                      {getStatusBadge(msg)}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 flex-shrink-0">
                    <span>{new Date(msg.createdAt).toLocaleDateString('ru-RU')}</span>
                    {expandedMsg === msg.id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedMsg === msg.id && (
                  <div className="border-t border-slate-100 p-4 space-y-4 animate-fade-in">
                    {/* Original Question */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">Ваш вопрос</span>
                        <span className="text-xs text-slate-400 ml-auto">
                          {new Date(msg.createdAt).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Admin Reply */}
                    {msg.reply && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                          <span className="text-xs font-medium text-green-700">Ответ администратора</span>
                          <span className="text-xs text-green-600 ml-auto">
                            {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString('ru-RU') : ''}
                          </span>
                        </div>
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{msg.reply}</p>
                      </div>
                    )}

                    {/* No reply yet */}
                    {msg.status === 'pending' && (
                      <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-xl p-3">
                        <Clock size={16} />
                        <span>Ожидает ответа администратора</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
