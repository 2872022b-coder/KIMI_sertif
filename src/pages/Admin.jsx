import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import storage from '../services/storage.js';
import { TRANSACTION_TYPES } from '../utils/constants.js';
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  UserCog,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  ImageIcon,
  ShoppingBag,
  Upload,
  AlertCircle
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

export function Admin() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    createTransaction,
    refresh,
    depositRequests,
    updateDepositRequest,
  } = useShop();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const users = storage.getUsers().filter((u) => u.role !== 'admin');
  const pendingRequests = depositRequests
    .filter((r) => r.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    gallery: [],
    productImage: '',
  });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [productImageFile, setProductImageFile] = useState(null);

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const base64s = await Promise.all(files.map(readFileAsBase64));
    setGalleryFiles(base64s);
  };

  const handleProductImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    setProductImageFile(base64);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock) {
      setToast({ message: 'Заполните обязательные поля', type: 'error' });
      return;
    }

    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      description: productForm.description,
      gallery: galleryFiles,
      productImage: productImageFile || '',
      createdAt: new Date().toISOString(),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...productData,
        id: editingProduct.id,
        gallery: galleryFiles.length > 0 ? galleryFiles : editingProduct.gallery,
        productImage: productImageFile || editingProduct.productImage,
      });
      setToast({ message: 'Товар обновлен', type: 'success' });
      setEditingProduct(null);
    } else {
      addProduct(productData);
      setToast({ message: 'Товар добавлен', type: 'success' });
    }

    setProductForm({ name: '', price: '', stock: '', description: '', gallery: [], productImage: '' });
    setGalleryFiles([]);
    setProductImageFile(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      gallery: product.gallery,
      productImage: product.productImage,
    });
    setGalleryFiles(product.gallery || []);
    setProductImageFile(product.productImage || null);
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Удалить товар?')) {
      deleteProduct(id);
      setToast({ message: 'Товар удален', type: 'success' });
    }
  };

  const handleApproveDeposit = (request) => {
    const users = storage.getUsers();
    const user = users.find((u) => u.id === request.userId);
    if (!user) return;

    const oldBalance = user.balance;
    user.balance += request.amount;
    storage.setUsers(users);

    createTransaction({
      userId: user.id,
      type: TRANSACTION_TYPES.DEPOSIT,
      amount: request.amount,
      balanceBefore: oldBalance,
      balanceAfter: user.balance,
      comment: `Пополнение через администратора (заявка ${request.id})`,
    });

    updateDepositRequest(request.id, { status: 'approved', processedAt: new Date().toISOString() });
    refreshUser();
    refresh();
    setToast({ message: 'Пополнение подтверждено', type: 'success' });
  };

  const handleRejectDeposit = (request) => {
    updateDepositRequest(request.id, { status: 'rejected', processedAt: new Date().toISOString() });
    refresh();
    setToast({ message: 'Заявка отклонена', type: 'success' });
  };

  const handleAdjustBalance = (userId, amount, type) => {
    const users = storage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const oldBalance = user.balance;
    const newBalance = type === 'add' ? oldBalance + amount : oldBalance - amount;

    if (newBalance < 0) {
      setToast({ message: 'Недостаточно средств', type: 'error' });
      return;
    }

    user.balance = newBalance;
    storage.setUsers(users);

    createTransaction({
      userId,
      type: TRANSACTION_TYPES.ADMIN_ADJUST,
      amount,
      balanceBefore: oldBalance,
      balanceAfter: newBalance,
      comment: type === 'add' ? 'Зачисление администратором' : 'Списание администратором',
    });

    refreshUser();
    refresh();
    setToast({ message: 'Баланс изменен', type: 'success' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
          <UserCog className="text-white" size={24} />
        </div>
        <div>
          <h1 className="section-title mb-0">Админ-панель</h1>
          <p className="section-subtitle">Управление товарами, пользователями и заявками</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'products', label: 'Товары', icon: Package, count: products.length },
          { id: 'requests', label: 'Заявки', icon: ArrowUpCircle, count: pendingRequests.length },
          { id: 'users', label: 'Пользователи', icon: UserCog, count: users.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Add/Edit Product Form */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Название <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Название товара"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Цена <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="input-field"
                      placeholder="1000"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Количество <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="input-field"
                      placeholder="10"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Описание товара"
                  rows={3}
                />
              </div>

              {/* Gallery Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Фото товара (1-5 шт)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-sm text-slate-500">
                      {galleryFiles.length > 0
                        ? `Загружено ${galleryFiles.length} фото`
                        : 'Нажмите для загрузки фото товара'}
                    </span>
                    <span className="text-xs text-slate-400">Максимум 5 изображений</span>
                  </label>
                </div>
                {galleryFiles.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {galleryFiles.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group">
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryFiles(galleryFiles.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Image Upload (deliverable file) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Файл-картинка для покупателя <span className="text-orange-500">*</span>
                </label>
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 hover:border-orange-400 transition-colors bg-orange-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageChange}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <ImageIcon size={24} className="text-orange-500" />
                    <span className="text-sm text-slate-600">
                      {productImageFile
                        ? 'Файл-картинка загружена'
                        : 'Загрузите картинку, которую получит покупатель'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Эта картинка будет отправлена на почту клиенту после покупки
                    </span>
                  </label>
                </div>
                {productImageFile && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-3">
                      <img src={productImageFile} alt="Product" className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Файл-картинка загружена</p>
                        <p className="text-xs text-slate-500">Будет отправлена покупателю на email</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductImageFile(null)}
                        className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save size={18} />
                  {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', price: '', stock: '', description: '', gallery: [], productImage: '' });
                      setGalleryFiles([]);
                      setProductImageFile(null);
                    }}
                    className="btn-secondary"
                  >
                    <X size={18} />
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Список товаров ({products.length})
              </h3>
            </div>
            {products.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Package className="mx-auto mb-2 text-slate-300" size={32} />
                <p>Товары еще не добавлены</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-header">Товар</th>
                      <th className="table-header">Цена</th>
                      <th className="table-header">Наличие</th>
                      <th className="table-header">Фото</th>
                      <th className="table-header">Файл</th>
                      <th className="table-header">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell">
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </td>
                        <td className="table-cell font-medium">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="table-cell">
                          <span
                            className={`badge ${
                              product.stock > 10
                                ? 'bg-green-100 text-green-700'
                                : product.stock > 0
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {product.stock} шт
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="badge-slate">{product.gallery?.length || 0} фото</span>
                        </td>
                        <td className="table-cell">
                          {product.productImage ? (
                            <span className="badge-green flex items-center gap-1 w-fit">
                              <CheckCircle size={12} />
                              Есть
                            </span>
                          ) : (
                            <span className="badge-red">Нет</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Редактировать"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <Trash2 size={16} />
                            </button>
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
      )}

      {/* Deposit Requests Tab */}
      {activeTab === 'requests' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpCircle size={20} className="text-blue-600" />
              Заявки на пополнение ({pendingRequests.length})
            </h3>
          </div>
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle className="mx-auto mb-2 text-slate-300" size={32} />
              <p>Нет ожидающих заявок</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-header">ID</th>
                    <th className="table-header">Пользователь</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Сумма</th>
                    <th className="table-header">Дата</th>
                    <th className="table-header">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell font-mono text-xs">{request.id}</td>
                      <td className="table-cell font-medium">{request.userName}</td>
                      <td className="table-cell text-slate-500">{request.userEmail}</td>
                      <td className="table-cell font-bold text-green-700">
                        {request.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="table-cell text-slate-500 whitespace-nowrap">
                        {new Date(request.createdAt).toLocaleString('ru-RU')}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleApproveDeposit(request)}
                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                            title="Подтвердить"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectDeposit(request)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Отклонить"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <UserCog size={20} className="text-blue-600" />
              Пользователи ({users.length})
            </h3>
          </div>
          {users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <UserCog className="mx-auto mb-2 text-slate-300" size={32} />
              <p>Нет зарегистрированных пользователей</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-header">ID</th>
                    <th className="table-header">Имя</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Баланс</th>
                    <th className="table-header">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell font-mono text-xs">{user.id}</td>
                      <td className="table-cell font-medium">{user.name}</td>
                      <td className="table-cell text-slate-500">{user.email}</td>
                      <td className="table-cell font-bold">
                        {user.balance.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const amount = parseFloat(prompt('Сумма зачисления:'));
                              if (amount > 0) handleAdjustBalance(user.id, amount, 'add');
                            }}
                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                            title="Зачислить"
                          >
                            <ArrowUpCircle size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const amount = parseFloat(prompt('Сумма списания:'));
                              if (amount > 0) handleAdjustBalance(user.id, amount, 'remove');
                            }}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Списать"
                          >
                            <ArrowDownCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
