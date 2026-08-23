import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessages } from '../context/MessageContext.jsx';
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
  AlertCircle,
  Ban,
  History,
  MessageCircle,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Download,
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

function AdminMessageItem({ msg, onReply }) {
  const [replyText, setReplyText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim());
    setReplyText('');
    setIsExpanded(false);
  };

  return (
    <div className={`card overflow-hidden ${msg.status === 'pending' ? 'border-orange-300' : 'border-green-200'}`}>
      <div
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.status === 'pending' ? 'bg-orange-100' : 'bg-green-100'}`}>
          <Mail size={18} className={msg.status === 'pending' ? 'text-orange-600' : 'text-green-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-900 truncate">{msg.subject}</h4>
            {msg.status === 'pending' ? (
              <span className="badge-orange flex items-center gap-1">
                <Clock size={12} />
                Новый
              </span>
            ) : (
              <span className="badge-green flex items-center gap-1">
                <CheckCircle size={12} />
                Отвечено
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            От: <span className="font-medium text-slate-700">{msg.userName}</span> ({msg.userEmail})
          </p>
        </div>
        <span className="text-sm text-slate-400 flex-shrink-0">
          {new Date(msg.createdAt).toLocaleDateString('ru-RU')}
        </span>
        {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 animate-fade-in">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Вопрос клиента</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
          </div>

          {msg.reply ? (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-2">Ваш ответ</p>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{msg.reply}</p>
              <p className="text-xs text-green-600 mt-2">
                Отправлено: {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString('ru-RU') : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                placeholder="Введите ответ клиенту..."
                rows={3}
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                Отправить ответ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
    isProductPurchased,
    transactions,
  } = useShop();
  const { replyToMessage, getAllMessages, getPendingCount } = useMessages();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingProductData, setPendingProductData] = useState(null);

  // Filters for transactions
  const [txFilter, setTxFilter] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  const users = storage.getUsers().filter((u) => u.role !== 'admin');
  const allUsers = storage.getUsers();
  const pendingRequests = depositRequests
    .filter((r) => r.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const allMessages = getAllMessages();

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    gallery: [],
    productImages: [],
  });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [productImagesFiles, setProductImagesFiles] = useState([]);

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const base64s = await Promise.all(files.map(readFileAsBase64));
    setGalleryFiles(base64s);
  };

  const handleProductImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    const base64s = await Promise.all(files.map(readFileAsBase64));
    setProductImagesFiles(base64s);
  };

  const buildProductImages = (files, stock) => {
    return files.map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url,
      isIssued: false,
      issuedAt: null,
      orderId: null,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock) {
      setToast({ message: 'Заполните обязательные поля', type: 'error' });
      return;
    }

    const stock = parseInt(productForm.stock);
    const images = productImagesFiles.length > 0
      ? buildProductImages(productImagesFiles, stock)
      : [];

    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      stock: stock,
      description: productForm.description,
      gallery: galleryFiles,
      productImages: images,
      createdAt: new Date().toISOString(),
    };

    if (images.length > 0 && images.length !== stock) {
      setPendingProductData(productData);
      setShowConfirmDialog(true);
      return;
    }

    saveProduct(productData);
  };

  const saveProduct = (productData) => {
    if (editingProduct) {
      const isPurchased = isProductPurchased(editingProduct.id);
      const updates = {
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        gallery: galleryFiles.length > 0 ? galleryFiles : editingProduct.gallery,
      };
      if (!isPurchased && productData.productImages && productData.productImages.length > 0) {
        updates.productImages = productData.productImages;
      }
      updateProduct(editingProduct.id, updates);
      setToast({ message: 'Товар обновлен', type: 'success' });
      setEditingProduct(null);
    } else {
      addProduct(productData);
      setToast({ message: 'Товар добавлен', type: 'success' });
    }

    resetForm();
  };

  const handleConfirmDialog = (confirmed) => {
    setShowConfirmDialog(false);
    if (confirmed && pendingProductData) {
      const adjustedData = {
        ...pendingProductData,
        stock: pendingProductData.productImages.length,
      };
      saveProduct(adjustedData);
    } else if (pendingProductData) {
      setToast({ message: `Загружено ${pendingProductData.productImages.length} картинок. Нужно загрузить еще ${pendingProductData.stock - pendingProductData.productImages.length} для соответствия количеству товара (${pendingProductData.stock} шт).`, type: 'warning' });
    }
    setPendingProductData(null);
  };

  const resetForm = () => {
    setProductForm({ name: '', price: '', stock: '', description: '', gallery: [], productImages: [] });
    setGalleryFiles([]);
    setProductImagesFiles([]);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      gallery: product.gallery,
      productImages: product.productImages || [],
    });
    setGalleryFiles(product.gallery || []);
    setProductImagesFiles((product.productImages || []).map(img => img.url));
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

  const getIssuedCount = (product) => {
    if (!product.productImages) return 0;
    return product.productImages.filter(img => img.isIssued).length;
  };

  const getAvailableCount = (product) => {
    if (!product.productImages) return 0;
    return product.productImages.filter(img => !img.isIssued).length;
  };

  // Transaction filters
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch = txFilter === '' ||
        tx.comment?.toLowerCase().includes(txFilter.toLowerCase()) ||
        tx.id?.toLowerCase().includes(txFilter.toLowerCase()) ||
        allUsers.find((u) => u.id === tx.userId)?.name?.toLowerCase().includes(txFilter.toLowerCase());
      const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getTxIcon = (type) => {
    switch (type) {
      case 'deposit': return <Download className="text-green-600" size={18} />;
      case 'withdrawal': return <ArrowUpRight className="text-red-600" size={18} />;
      case 'transfer_out': return <Send className="text-orange-600" size={18} />;
      case 'transfer_in': return <ArrowDownLeft className="text-blue-600" size={18} />;
      case 'admin_adjust': return <Shield className="text-purple-600" size={18} />;
      default: return <History className="text-slate-600" size={18} />;
    }
  };

  const getTxLabel = (type) =>
    ({
      deposit: 'Пополнение',
      withdrawal: 'Списание (покупка)',
      transfer_out: 'Перевод',
      transfer_in: 'Зачисление',
      admin_adjust: 'Изменение баланса',
    }[type] || type);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
          <UserCog className="text-white" size={24} />
        </div>
        <div>
          <h1 className="section-title mb-0">Админ-панель</h1>
          <p className="section-subtitle">Управление товарами, пользователями, заявками и сообщениями</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'products', label: 'Товары', icon: Package, count: products.length },
          { id: 'requests', label: 'Заявки', icon: ArrowUpCircle, count: pendingRequests.length },
          { id: 'users', label: 'Пользователи', icon: UserCog, count: users.length },
          { id: 'all_transactions', label: 'Все операции', icon: History, count: transactions.length },
          { id: 'messages', label: 'Сообщения', icon: MessageCircle, count: getPendingCount() },
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
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tab.id === 'messages' && tab.count > 0
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
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

              {/* Product Images Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Файл-картинки для покупателей <span className="text-orange-500">*</span>
                  </label>
                  {editingProduct && isProductPurchased(editingProduct.id) && (
                    <span className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                      <Ban size={12} />
                      Товар уже куплен — картинки нельзя изменить
                    </span>
                  )}
                </div>
                <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                  editingProduct && isProductPurchased(editingProduct.id)
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-orange-300 hover:border-orange-400 bg-orange-50/50'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProductImagesChange}
                    className="hidden"
                    id="product-images-upload"
                    disabled={editingProduct && isProductPurchased(editingProduct.id)}
                  />
                  <label
                    htmlFor="product-images-upload"
                    className={`flex flex-col items-center gap-2 ${
                      editingProduct && isProductPurchased(editingProduct.id) ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <ImageIcon size={24} className="text-orange-500" />
                    <span className="text-sm text-slate-600">
                      {productImagesFiles.length > 0
                        ? `Загружено ${productImagesFiles.length} картинок`
                        : 'Загрузите картинки для покупателей (по 1 на каждую единицу товара)'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Количество картинок должно совпадать с количеством товара ({productForm.stock || 0} шт)
                    </span>
                  </label>
                </div>

                {editingProduct && editingProduct.productImages && editingProduct.productImages.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Картинки товара</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={12} />
                          Доступно: {getAvailableCount(editingProduct)}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <Ban size={12} />
                          Выдано: {getIssuedCount(editingProduct)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {editingProduct.productImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className={`aspect-square rounded-lg overflow-hidden relative group ${img.isIssued ? 'image-issued' : ''}`}
                          title={img.isIssued ? `Выдано: ${new Date(img.issuedAt).toLocaleDateString('ru-RU')}` : 'Доступно'}
                        >
                          <img src={img.url} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                          {img.isIssued && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Ban size={20} className="text-red-600 drop-shadow-lg" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!editingProduct && productImagesFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">Загружено картинок: {productImagesFiles.length}</p>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {productImagesFiles.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group">
                          <img src={img} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProductImagesFiles(productImagesFiles.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
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
                    onClick={() => { setEditingProduct(null); resetForm(); }}
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
                      <th className="table-header">Картинки</th>
                      <th className="table-header">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                      const issued = getIssuedCount(product);
                      const available = getAvailableCount(product);
                      const totalImages = product.productImages?.length || 0;
                      return (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                          <td className="table-cell">
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                            </div>
                          </td>
                          <td className="table-cell font-medium">{product.price.toLocaleString('ru-RU')} ₽</td>
                          <td className="table-cell">
                            <span className={`badge ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                              {product.stock} шт
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className="badge-slate">{product.gallery?.length || 0} фото</span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <span className="badge-green flex items-center gap-1 w-fit">
                                <CheckCircle size={12} />
                                {available} своб.
                              </span>
                              {issued > 0 && (
                                <span className="badge-red flex items-center gap-1 w-fit">
                                  <Ban size={12} />
                                  {issued} выд.
                                </span>
                              )}
                              {totalImages !== product.stock && (
                                <span className="badge-orange" title="Количество картинок не совпадает с остатком">
                                  <AlertCircle size={12} />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleEditProduct(product)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Редактировать">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Удалить">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                      <td className="table-cell font-bold text-green-700">{request.amount.toLocaleString('ru-RU')} ₽</td>
                      <td className="table-cell text-slate-500 whitespace-nowrap">{new Date(request.createdAt).toLocaleString('ru-RU')}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleApproveDeposit(request)} className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Подтвердить">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleRejectDeposit(request)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Отклонить">
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
                      <td className="table-cell font-bold">{user.balance.toLocaleString('ru-RU')} ₽</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { const amount = parseFloat(prompt('Сумма зачисления:')); if (amount > 0) handleAdjustBalance(user.id, amount, 'add'); }} className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Зачислить">
                            <ArrowUpCircle size={16} />
                          </button>
                          <button onClick={() => { const amount = parseFloat(prompt('Сумма списания:')); if (amount > 0) handleAdjustBalance(user.id, amount, 'remove'); }} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Списать">
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

      {/* All Transactions Tab */}
      {activeTab === 'all_transactions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={txFilter}
                  onChange={(e) => setTxFilter(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Поиск по ID, комментарию или имени пользователя..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                  className="input-field py-2"
                >
                  <option value="all">Все типы</option>
                  <option value="deposit">Пополнение</option>
                  <option value="withdrawal">Списание (покупка)</option>
                  <option value="transfer_out">Перевод</option>
                  <option value="transfer_in">Зачисление</option>
                  <option value="admin_adjust">Изменение баланса</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-blue-600" />
                Все финансовые операции ({filteredTransactions.length})
              </h3>
            </div>
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <History className="mx-auto mb-2 text-slate-300" size={32} />
                <p>Операций не найдено</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-header">ID</th>
                      <th className="table-header">Пользователь</th>
                      <th className="table-header">Тип</th>
                      <th className="table-header">Сумма</th>
                      <th className="table-header">Было / Стало</th>
                      <th className="table-header">Детали</th>
                      <th className="table-header">Дата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((tx) => {
                      const txUser = allUsers.find((u) => u.id === tx.userId);
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="table-cell font-mono text-xs">{tx.id}</td>
                          <td className="table-cell">
                            <div>
                              <p className="font-medium text-slate-900">{txUser?.name || '—'}</p>
                              <p className="text-xs text-slate-500">{txUser?.email || ''}</p>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              {getTxIcon(tx.type)}
                              <span>{getTxLabel(tx.type)}</span>
                            </div>
                          </td>
                          <td className="table-cell font-medium">
                            <span className={tx.type === 'withdrawal' || tx.type === 'transfer_out' || (tx.type === 'admin_adjust' && tx.balanceAfter < tx.balanceBefore) ? 'text-red-600' : 'text-green-700'}>
                              {tx.type === 'withdrawal' || tx.type === 'transfer_out' || (tx.type === 'admin_adjust' && tx.balanceAfter < tx.balanceBefore) ? '-' : '+'}
                              {tx.amount.toLocaleString('ru-RU')} ₽
                            </span>
                          </td>
                          <td className="table-cell text-slate-600">
                            {tx.balanceBefore.toLocaleString('ru-RU')} → {tx.balanceAfter.toLocaleString('ru-RU')} ₽
                          </td>
                          <td className="table-cell text-slate-600 max-w-xs truncate" title={tx.comment}>{tx.comment}</td>
                          <td className="table-cell text-slate-500 whitespace-nowrap">{new Date(tx.timestamp).toLocaleString('ru-RU')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              Вопросы от клиентов ({allMessages.length})
              {getPendingCount() > 0 && (
                <span className="badge-orange ml-2">{getPendingCount()} новых</span>
              )}
            </h3>
          </div>
          {allMessages.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <MessageCircle className="mx-auto mb-2 text-slate-300" size={32} />
              <p>Вопросов пока нет</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allMessages.map((msg) => (
                <AdminMessageItem
                  key={msg.id}
                  msg={msg}
                  onReply={(reply) => {
                    replyToMessage(msg.id, reply);
                    setToast({ message: 'Ответ отправлен клиенту', type: 'success' });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog Modal */}
      {showConfirmDialog && pendingProductData && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-orange-500" />
              <h3 className="text-lg font-bold text-slate-900">Несоответствие количества</h3>
            </div>
            <p className="text-slate-600 mb-4">
              Вы указали количество товара <strong>{pendingProductData.stock} шт.</strong>, но загрузили только{' '}
              <strong>{pendingProductData.productImages.length} картинок</strong>.
            </p>
            <div className="bg-orange-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-orange-800 mb-2">Выберите действие:</p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• <strong>Да</strong> — добавить товар с {pendingProductData.productImages.length} шт. (количество приведено к числу картинок)</li>
                <li>• <strong>Нет</strong> — вернуться и дозагрузить картинки</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleConfirmDialog(true)} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                Да, добавить {pendingProductData.productImages.length} шт.
              </button>
              <button onClick={() => handleConfirmDialog(false)} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <X size={18} />
                Нет, дозагрузить
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
