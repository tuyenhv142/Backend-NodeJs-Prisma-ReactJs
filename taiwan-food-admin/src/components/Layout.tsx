import { LayoutDashboard, Video, Home, LogOut } from 'lucide-react'; // Đổi icon Logout cho đẹp
import { Link, Outlet, useNavigate } from 'react-router-dom';

export const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('key_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 font-bold text-2xl text-blue-600 tracking-tight">
          Admin Panel
        </div>

        <nav className="mt-4 flex-1">
          <Link
            to="/"
            className="flex items-center px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <LayoutDashboard className="mr-3" size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/videos"
            className="flex items-center px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Video className="mr-3" size={20} />
            <span className="font-medium">Video</span>
          </Link>

          <Link
            to="/restaurants"
            className="flex items-center px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Home className="mr-3" size={20} />
            <span className="font-medium">Restaurant</span>
          </Link>
        </nav>

        {/* Nút Logout ở dưới cùng */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="mr-3" size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
