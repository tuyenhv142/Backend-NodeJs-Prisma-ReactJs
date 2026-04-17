import axiosClient from './axiosClient';

export const videoApi = {
  getAll: (type: string, maxResults: number) => {
    return axiosClient.get(
      `/youtube/channel?type=${type}&maxResults=${maxResults}`
    );
  },
};
