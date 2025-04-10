import API from './api';

export const getTransactions = (userId, filters = {}) => {
  return API.get(`/transactions/user/${userId}`, { params: filters });
};

export const addTransaction = (transactionData) => {
  return API.post('/transactions', transactionData);
};

export const deleteTransaction = (transactionId) => {
  return API.delete(`/transactions/${transactionId}`);
};