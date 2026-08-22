import { STORAGE_KEYS, ROLES, TRANSACTION_TYPES } from './constants.js';

const SEED_VERSION = '2';

export function initSeedData() {
  const currentVersion = localStorage.getItem('fm_seed_version');
  const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

  // Reset data if version changed or no users exist
  if (currentVersion !== SEED_VERSION || existingUsers.length === 0) {
    localStorage.clear();
    localStorage.setItem('fm_seed_version', SEED_VERSION);
  } else {
    return;
  }

  const now = new Date().toISOString();
  const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

  const users = [
    {
      id: 'SRT00001',
      email: 'admin@admin.com',
      password: 'admin123',
      name: 'Администратор',
      role: ROLES.ADMIN,
      balance: 999999,
      createdAt: now
    },
    {
      id: 'SRT00002',
      email: 'client@client.com',
      password: 'client123',
      name: 'Клиент Тестовый',
      role: ROLES.USER,
      balance: 5000,
      createdAt: now
    },
    {
      id: 'SRT00003',
      email: 'user@user.com',
      password: 'user123',
      name: 'Пользователь',
      role: ROLES.USER,
      balance: 2500,
      createdAt: now
    },
  ];

  const products = [
    {
      id: 'P1',
      name: 'Беспроводные наушники',
      price: 1500,
      stock: 10,
      description: 'Отличный звук, 20 ч автономности.',
      gallery: [placeholderImg],
      productImage: placeholderImg,
      createdAt: now
    },
    {
      id: 'P2',
      name: 'Механическая клавиатура',
      price: 3000,
      stock: 5,
      description: 'Blue switches, RGB-подсветка.',
      gallery: [placeholderImg, placeholderImg],
      productImage: placeholderImg,
      createdAt: now
    },
    {
      id: 'P3',
      name: 'Игровая мышь',
      price: 1200,
      stock: 8,
      description: '12000 DPI, эргономичный дизайн.',
      gallery: [placeholderImg],
      productImage: placeholderImg,
      createdAt: now
    },
    {
      id: 'P4',
      name: 'USB-C хаб',
      price: 1800,
      stock: 12,
      description: '7 в 1: HDMI, USB 3.0, SD-картридер.',
      gallery: [placeholderImg, placeholderImg, placeholderImg],
      productImage: placeholderImg,
      createdAt: now
    },
    {
      id: 'P5',
      name: 'Портативная зарядка',
      price: 2000,
      stock: 7,
      description: '20000 мАч, быстрая зарядка 65W.',
      gallery: [placeholderImg],
      productImage: placeholderImg,
      createdAt: now
    },
  ];

  const transactions = [
    {
      id: 'T1',
      userId: 'SRT00002',
      type: TRANSACTION_TYPES.DEPOSIT,
      amount: 5000,
      balanceBefore: 0,
      balanceAfter: 5000,
      timestamp: now,
      targetUserId: null,
      targetUserName: null,
      productIds: [],
      comment: 'Начальное пополнение'
    },
    {
      id: 'T2',
      userId: 'SRT00003',
      type: TRANSACTION_TYPES.DEPOSIT,
      amount: 2500,
      balanceBefore: 0,
      balanceAfter: 2500,
      timestamp: now,
      targetUserId: null,
      targetUserName: null,
      productIds: [],
      comment: 'Начальное пополнение'
    },
  ];

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}
