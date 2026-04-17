import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFullLoginFlow = async () => {
    try {
      setLoading(true);

      // GIAI ĐOẠN 1: Lấy Token Auth
      // Gửi ApiKey trong Body (đúng theo code axios của Hoang)
      const preAuthRes = await axiosClient.post('/auth/token', {
        ApiKey: 'hoang_mit_super_secret_key_2026',
      });

      // TRÍCH XUẤT ĐÚNG KEY: preAuthToken từ data
      const tokenFromServer = preAuthRes.data.data.preAuthToken;

      if (tokenFromServer) {
        localStorage.setItem('key_token', tokenFromServer);
        console.log('✅ Đã lấy Pre-Auth Token thành công');
      }

      // GIAI ĐOẠN 2: Login chính thức
      const loginRes = await axiosClient.post('/auth/login', {
        username,
        password,
      });

      // Lưu Admin Token cuối cùng
      const adminToken = loginRes.data.data.token;
      localStorage.setItem('admin_token', adminToken);
      // localStorage.removeItem('key_token');

      window.location.href = '/videos';
    } catch (err: any) {
      console.error('Err', err.response?.data || err.message);
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-black p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Admin Portal
        </h2>

        <div className="space-y-5">
          <input
            type="text"
            value={username}
            className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFullLoginFlow()}
          />

          <button
            onClick={handleFullLoginFlow}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
