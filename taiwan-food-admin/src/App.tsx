import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { VideoPage } from './pages/VideoPages';
import { RestaurantPage } from './pages/RestaurantPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Các trang bên dưới chỉ được xem nếu đã login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="videos" element={<VideoPage />} />
            <Route path="restaurants" element={<RestaurantPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
