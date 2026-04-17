import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8765/api',
});

axiosClient.interceptors.request.use((config) => {
  // Ưu tiên lấy admin_token nếu đã login, nếu chưa thì lấy key_token (pre-auth)
  const adminToken = localStorage.getItem('key_token');
  //   const keyToken = localStorage.getItem('admin_token');

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  console.log('🔍 Interceptor - Admin Token:', adminToken);
  //   } else if (keyToken) {
  //     config.headers.Authorization = `Bearer ${keyToken}`;
  //   }

  return config;
});

export default axiosClient;
