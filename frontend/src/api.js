import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://auction-nojr.onrender.com' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProducts = () => API.get('/products');
export const createProduct = (data) => API.post('/products', data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const placeBid = (data) => API.post('/bids', data);
export const submitDelivery = (data) => API.post('/orders', data);
export const checkDeliveryStatus = (productId) => API.get(`/orders/check/${productId}`);
export const getAdminOrders = () => API.get('/orders/admin/all');
export const updateOrderStatus = (id, status) => API.patch(`/orders/admin/${id}/status`, { status });
