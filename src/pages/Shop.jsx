import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  Store,
  Search,
  SlidersHorizontal,
  ImageIcon,
  CheckCircle,
  X
} from 'lucide-react';
import { Toast } from '../components/Toast.jsx';

export function Shop() {
  const { products, addToCart, cart } = useShop();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('newest');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, quantity);
    setToast({
      message: `${selectedProduct.name} добавлен в корзину (${quantity} шт)`,
      type: 'success',
    });
    setSelectedProduct(null);
    setQuantity(1);
  };

  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 100000;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title mb-1">Магазин</h1>
          <p className="section-subtitle">
            {filteredProducts.length} товаров доступно
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ShoppingCart size={16} />
            Корзина
            {cartCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 text-sm ${
            showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : ''
          }`}
        >
          <SlidersHorizontal size={16} />
          Фильтры
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Цена: до {priceRange[1].toLocaleString('ru-RU')} ₽
              </label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Сортировка
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="newest">Сначала новые</option>
                <option value="price_asc">Цена: по возрастанию</option>
                <option value="price_desc">Цена: по убыванию</option>
                <option value="name">По названию</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="card p-12 text-center">
          <Store className="mx-auto mb-4 text-slate-300" size={48} />
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {searchQuery ? 'Товары не найдены' : 'Магазин пуст'}
          </h3>
          <p className="text-slate-500">
            {searchQuery
              ? 'Попробуйте изменить параметры поиска'
              : 'Администратор еще не добавил товары'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="card-hover overflow-hidden group cursor-pointer"
              onClick={() => {
                setSelectedProduct(product);
                setQuantity(1);
              }}
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {product.gallery?.[0] ? (
                  <img
                    src={product.gallery[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-slate-300" />
                  </div>
                )}
                {product.gallery?.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                    +{product.gallery.length - 1} фото
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="badge-blue">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    В наличии: {product.stock} шт
                  </span>
                  <button className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedProduct.name}
              </h3>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setQuantity(1);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Gallery */}
            <div className="mb-4">
              {selectedProduct.gallery?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedProduct.gallery.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                      <img
                        src={img}
                        alt={`${selectedProduct.name} ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
                  <ImageIcon size={48} className="text-slate-300" />
                </div>
              )}
            </div>

            <p className="text-slate-600 mb-4">{selectedProduct.description}</p>

            <div className="flex items-center justify-between mb-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-500">Цена</p>
                <p className="text-2xl font-bold text-slate-900">
                  {selectedProduct.price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">В наличии</p>
                <p className="text-lg font-bold text-slate-900">
                  {selectedProduct.stock} шт
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-slate-700">Количество:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                В корзину
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setQuantity(1);
                }}
                className="btn-secondary"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
