import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import storage from '../services/storage.js';
import { KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { Toast } from '../components/Toast.jsx';

export function ForgotPassword() {
  const [step, setStep] = useState('email'); // email | code | success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const navigate = useNavigate();

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    const users = storage.getUsers();
    const user = users.find((u) => u.email === email.trim());
    
    if (!user) {
      setToast({ message: 'Пользователь с таким email не найден', type: 'error' });
      return;
    }

    const newCode = generateCode();
    setGeneratedCode(newCode);
    
    setToast({ 
      message: `Код восстановления: ${newCode} (в реальном приложении отправлен на ${email})`, 
      type: 'success' 
    });
    
    setStep('code');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    if (code !== generatedCode) {
      setToast({ message: 'Неверный код подтверждения', type: 'error' });
      return;
    }
    
    if (newPassword.length < 6) {
      setToast({ message: 'Пароль должен быть минимум 6 символов', type: 'error' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Пароли не совпадают', type: 'error' });
      return;
    }

    const users = storage.getUsers();
    const userIndex = users.findIndex((u) => u.email === email.trim());
    
    if (userIndex >= 0) {
      users[userIndex].password = newPassword;
      storage.setUsers(users);
      setStep('success');
      setToast({ message: 'Пароль успешно изменён!', type: 'success' });
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-100 px-4'>
      <div className='bg-white p-8 rounded-xl shadow-md w-full max-w-md'>
        <div className='flex items-center justify-center gap-2 mb-6'>
          <div className='w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center'>
            <KeyRound size={20} className='text-white' />
          </div>
          <h1 className='text-2xl font-bold text-slate-900'>Восстановление пароля</h1>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className='space-y-4'>
            <p className='text-sm text-slate-500 text-center mb-4'>
              Введите email, указанный при регистрации. Мы отправим код подтверждения.
            </p>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1'>
                <Mail size={14} />
                Email
              </label>
              <input
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='you@example.com'
              />
            </div>
            <button
              type='submit'
              className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors'
            >
              Отправить код
            </button>
            <Link
              to='/login'
              className='flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mt-4'
            >
              <ArrowLeft size={16} />
              Вернуться к входу
            </Link>
          </form>
        )}

        {/* Step 2: Enter Code + New Password */}
        {step === 'code' && (
          <form onSubmit={handleResetPassword} className='space-y-4'>
            <div className='p-4 bg-blue-50 rounded-xl mb-4'>
              <p className='text-sm text-blue-700 flex items-center gap-2'>
                <CheckCircle size={16} />
                Код отправлен на <strong>{email}</strong>
              </p>
              <p className='text-xs text-blue-600 mt-1'>
                (В демо-режиме код отображается в уведомлении сверху)
              </p>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1'>
                Код подтверждения (6 цифр)
              </label>
              <input
                type='text'
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[0.5em] font-mono'
                placeholder='000000'
                maxLength={6}
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1'>
                <Lock size={14} />
                Новый пароль
              </label>
              <input
                type='password'
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Минимум 6 символов'
                minLength={6}
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1'>
                <Lock size={14} />
                Повторите пароль
              </label>
              <input
                type='password'
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Повторите новый пароль'
              />
            </div>
            
            <button
              type='submit'
              className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors'
            >
              Сменить пароль
            </button>
            
            <button
              type='button'
              onClick={() => setStep('email')}
              className='w-full py-2 text-sm text-slate-500 hover:text-blue-600 transition-colors'
            >
              Отправить код повторно
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
              <CheckCircle size={32} className='text-green-600' />
            </div>
            <h2 className='text-xl font-bold text-slate-900'>Пароль изменён!</h2>
            <p className='text-sm text-slate-500'>
              Теперь вы можете войти с новым паролем.
            </p>
            <Link
              to='/login'
              className='inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center'
            >
              Войти
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
