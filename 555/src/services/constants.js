export const STORAGE_KEYS = {
  USERS: 'fm_users',
  PRODUCTS: 'fm_products',
  CART: 'fm_cart',
  ORDERS: 'fm_orders',
  CURRENT_USER: 'fm_current_user',
  WITHDRAW_REQUESTS: 'fm_withdraw_requests',
};

export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
};

export const DEFAULT_USERS = [
  {
    id: 'admin-1',
    name: 'Администратор',
    email: 'admin@admin.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    balance: 0,
    blockedBalance: 0,
  },
  {
    id: 'client-1',
    name: 'Клиент',
    email: 'client@client.com',
    password: 'client123',
    role: ROLES.CLIENT,
    balance: 5000,
    blockedBalance: 0,
  },
];
