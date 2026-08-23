import { STORAGE_KEYS } from '../utils/constants.js';

function migrateProductImages(products) {
  return products.map((p) => {
    if (p.productImages && Array.isArray(p.productImages)) {
      return p;
    }
    const oldImg = p.productImage || '';
    const images = [];
    for (let i = 0; i < (p.stock || 1); i++) {
      images.push({
        id: `img-${p.id}-${i}`,
        url: oldImg,
        isIssued: false,
        issuedAt: null,
        orderId: null,
      });
    }
    const { productImage, ...rest } = p;
    return { ...rest, productImages: images };
  });
}

const storage = {
  getUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  setUsers: (users) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),

  getProducts: () => {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    return migrateProductImages(raw);
  },
  setProducts: (products) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)),

  getTransactions: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]'),
  setTransactions: (transactions) => localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)),

  getCart: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]'),
  setCart: (cart) => localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)),

  getAuth: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH) || 'null'),
  setAuth: (auth) => localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth)),

  getDepositRequests: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPOSIT_REQUESTS) || '[]'),
  setDepositRequests: (requests) => localStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(requests)),

  getMessages: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]'),
  setMessages: (messages) => localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages)),

  generateUserId: () => {
    const users = storage.getUsers();
    const nextNum = users.length + 1;
    return `SRT${String(nextNum).padStart(5, '0')}`;
  },

  generateTransactionId: () => {
    const transactions = storage.getTransactions();
    const nextNum = transactions.length + 1;
    return `T${String(nextNum).padStart(6, '0')}`;
  },

  generateDepositRequestId: () => {
    const requests = storage.getDepositRequests();
    const nextNum = requests.length + 1;
    return `DR${String(nextNum).padStart(6, '0')}`;
  },

  generateMessageId: () => {
    const messages = storage.getMessages();
    const nextNum = messages.length + 1;
    return `MSG${String(nextNum).padStart(6, '0')}`;
  },
};

export default storage;
