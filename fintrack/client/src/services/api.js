import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getTransactions = async (userId) => {
  try {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getWeeklyActivity = async (userId) => {
  try {
    const response = await api.get(`/transactions/summary/${userId}`, {
      params: { period: 'week' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    throw error;
  }
};

export default api;