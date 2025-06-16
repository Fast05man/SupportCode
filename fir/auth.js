import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  await api.post('/register', userData);
};

export const logoutUser = () => {
  // На клиенте просто очищаем токен
};