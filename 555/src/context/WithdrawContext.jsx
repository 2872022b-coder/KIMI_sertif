import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../services/storage.js';

const WithdrawContext = createContext(null);

export function WithdrawProvider({ children }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests(storage.getWithdrawRequests());
  }, []);

  const refreshRequests = () => {
    setRequests(storage.getWithdrawRequests());
  };

  const createWithdrawRequest = (data) => {
    const req = storage.addWithdrawRequest(data);
    refreshRequests();
    return req;
  };

  const approveWithdrawRequest = (requestId) => {
    const reqs = storage.getWithdrawRequests();
    const req = reqs.find((r) => r.id === requestId);
    if (!req) return;
    req.status = 'approved';
    req.processedAt = new Date().toISOString();

    const users = storage.getUsers();
    const user = users.find((u) => u.id === req.userId);
    if (user) {
      user.blockedBalance = (user.blockedBalance || 0) - req.total;
      storage.setUsers(users);
    }
    storage.setWithdrawRequests(reqs);
    refreshRequests();
  };

  const rejectWithdrawRequest = (requestId, reason) => {
    const reqs = storage.getWithdrawRequests();
    const req = reqs.find((r) => r.id === requestId);
    if (!req) return;
    req.status = 'rejected';
    req.rejectReason = reason;
    req.processedAt = new Date().toISOString();

    const users = storage.getUsers();
    const user = users.find((u) => u.id === req.userId);
    if (user) {
      user.balance += req.total;
      user.blockedBalance = (user.blockedBalance || 0) - req.total;
      storage.setUsers(users);
    }
    storage.setWithdrawRequests(reqs);
    refreshRequests();
  };

  const getUserRequests = (userId) => {
    return requests.filter((r) => r.userId === userId);
  };

  return (
    <WithdrawContext.Provider
      value={{ requests, createWithdrawRequest, approveWithdrawRequest, rejectWithdrawRequest, getUserRequests, refreshRequests }}
    >
      {children}
    </WithdrawContext.Provider>
  );
}

export function useWithdraw() {
  return useContext(WithdrawContext);
}
