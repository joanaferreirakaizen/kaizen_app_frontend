import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const materiaPrimaAPI = {
  getAll: () => api.get('/materia-prima'),
  getById: (id) => api.get(`/materia-prima/${id}`),
  create: (data) => api.post('/materia-prima', data),
  update: (id, data) => api.put(`/materia-prima/${id}`, data),
  delete: (id) => api.delete(`/materia-prima/${id}`),
};

export const stocksAPI = {
  getAll: (params) => api.get('/stocks', { params }),
  create: (data) => api.post('/stocks', data),
};

export default api;
