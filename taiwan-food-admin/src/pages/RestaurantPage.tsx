import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../api/restaurantApi';
import { Trash2, Edit, Plus, X } from 'lucide-react';
import { useState } from 'react';

export const RestaurantPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State quản lý form đơn giản
  const [formData, setFormData] = useState({
    name: '',
    placeId: '',
    address: '',
    category: '',
    city: '',
    rating: 0,
    imageUrl: `https://scontent.fkhh1-1.fna.fbcdn.net/v/t39.30808-6/660879819_2211674296269538_1128590823479298922_n.jpg?stp=cp6_dst-jpegr_tt6&_nc_cat=105&ccb=1-7&_nc_sid=2a1932&_nc_ohc=XxYWQyYeRXwQ7kNvwHaHjB6&_nc_oc=Adqy6mgVUVGOWt1iGyUfuuT4w-75XGBjYARF0Cly-TLF2rbGFnkvYRZSU-G75TkRW6M&_nc_zt=23&se=-1&_nc_ht=scontent.fkhh1-1.fna&_nc_gid=3rebVgccarpNest7J5EPSQ&_nc_ss=7a3a8&oh=00_Af02JKDFPTfps9CssKVpS7AtJCxMzhU-S3wdPfsdefLbkg&oe=69E2926F`, // Ảnh ngẫu nhiên từ Unsplash
    lat: 0,
    lng: 0,
  });

  // 1. Lấy danh sách
  const { data } = useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantApi.getAll,
  });

  // 2. Mutation để Thêm mới
  const addMutation = useMutation({
    mutationFn: (newData: any) => restaurantApi.create(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setIsModalOpen(false); // Đóng modal
      setFormData({
        name: '',
        address: '',
        placeId: '',
        city: '',
        rating: 0,
        category: '',
        imageUrl: `https://source.unsplash.com/400x300/?restaurant,food&${Date.now()}`,
        lat: 0,
        lng: 0,
      }); // Reset form
      alert('Created successfully!');
    },
    onError: () => alert('Lỗi rồi Hoang ơi, check lại Backend nhé!'),
  });

  // 3. Mutation để Xóa
  const deleteMutation = useMutation({
    mutationFn: (id: number) => restaurantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      alert('Deleted successfully!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const restaurants = data?.data?.data || [];

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Restaurants in Taiwan
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus size={20} /> Add New
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Name</th>
              <th className="p-4 font-semibold text-gray-700">Address</th>
              <th className="p-4 font-semibold text-gray-700">Category</th>
              <th className="p-4 text-center font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((res: any) => (
              <tr
                key={res.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 font-medium">{res.name}</td>
                <td className="p-4 text-gray-600">{res.address}</td>
                <td className="p-4 italic text-sm text-gray-500">
                  {res.category}
                </td>
                <td className="p-4 flex justify-center gap-3">
                  <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure to delete this item?'))
                        deleteMutation.mutate(res.id);
                    }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm nhà hàng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Add New Restaurant</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PPlaceId
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.placeId}
                  onChange={(e) =>
                    setFormData({ ...formData, placeId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lat: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lng: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-gray-400 mt-4"
              >
                {addMutation.isPending ? 'Saving...' : 'Save Restaurant'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
