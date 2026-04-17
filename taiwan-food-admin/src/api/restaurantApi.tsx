import axiosClient from './axiosClient';

export const restaurantApi = {
  getAll: () => axiosClient.get('/restaurants'),
  getById: (id: number) => axiosClient.get(`/restaurants/${id}`),
  create: (data: any) => axiosClient.post('/restaurants', data),
  update: (id: number, data: any) =>
    axiosClient.put(`/restaurants/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/restaurants/${id}`),
};
