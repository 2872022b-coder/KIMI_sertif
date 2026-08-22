import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import {
  Wallet,
  ShoppingCart,
  ArrowRightLeft,
  Store,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { products, cart } = useShop();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const recentProducts = products.slice(0, 4);

  const quickActions = [
    {
      title: 'Пополнить баланс',
      description: 'Быстрое пополнение до 10 000 ₽',
      icon: Wallet,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      link: '/profile',
    },
    {
      title: 'Магазин',
      description: `${products.length} товаров доступно`,
      icon: Store,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      link: '/shop',
    },
    {
      title: 'Корзина',
      description: cartCount > 0 ? `${cartCount} товаров в корзине` : 'Корзина пуста',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      link: '/cart',
    },
    {
      title: 'Перевод',
      description: 'Перевод между пользователями',
      icon: ArrowRightLeft,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      link: '/transfer',
    },
  ];

  const features = [
    { icon: Shield, title: 'Безопасность', desc: 'Защищенные транзакции' },
    { icon: Zap, title: 'Скорость', desc: 'Мгновенные переводы' },
    { icon: Clock, title: '24/7', desc: 'Работаем круглосуточно' },
    { icon: CheckCircle, title: 'Надежность', desc: 'Гарантия качества' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="gradient-hero rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-orange-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Добро пожаловать, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Оплачивайте товары, переводите средства и управляйте своим балансом в одном месте
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className="btn-accent inline-flex items-center gap-2">
              <Store size={18} />
              В магазин
              <ArrowRight size={16} />
            </Link>
            <Link to="/profile" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 backdrop-blur-sm">
              <Wallet size={18} />
              Пополнить баланс
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="card-hover p-6 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
              <p className="text-sm text-slate-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title mb-1">Ваш баланс</h2>
              <p className="section-subtitle">Управляйте своими средствами</p>
            </div>
            <Link
              to="/profile"
              className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
            >
              <Wallet size={16} />
              Пополнить
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Доступно</p>
              <p className="text-2xl font-bold text-green-800">
                {user?.balance?.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-1">В корзине</p>
              <p className="text-2xl font-bold text-slate-800">
                {cartCount} шт
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-1">Товаров</p>
              <p className="text-2xl font-bold text-slate-800">
                {products.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Преимущества</h3>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      {recentProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title mb-1">Новые товары</h2>
              <p className="section-subtitle">Последние поступления в магазин</p>
            </div>
            <Link
              to="/shop"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              Все товары
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                to="/shop"
                className="card-hover overflow-hidden group"
              >
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {product.gallery?.[0] ? (
                    <img
                      src={product.gallery[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store size={32} className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="badge-blue">{product.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
