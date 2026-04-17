import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoApi } from '../api/videoApi';
import { useState } from 'react';

export const VideoPage = () => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('video'); // Mặc định là video
  const [maxResults, setMaxResults] = useState(10); // Số lượng video muốn lấy về, có thể điều chỉnh sau nếu cần

  // 1. Lấy danh sách video
  const { data, isLoading, error } = useQuery({
    queryKey: ['video', selectedType, maxResults], // Đặt queryKey rõ ràng hơn
    queryFn: () => videoApi.getAll(selectedType, maxResults),
  });

  // 2. Logic cho nút Sync
  const mutation = useMutation({
    mutationFn: (type: string) => videoApi.getAll(type, maxResults),
    onSuccess: () => {
      alert('Sync successful!'); // Thông báo thành công
      queryClient.invalidateQueries({ queryKey: ['video', selectedType] }); // Tải lại danh sách
    },
  });

  if (isLoading) return <div className="p-8">Connecting to MySQL...</div>;
  if (error)
    return <div className="p-8 text-red-500">Error connecting to Backend!</div>;

  const videos = data?.data?.data || [];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Video Wing Stars</h1>

        <div className="flex items-center gap-3">
          {/* Nút chọn kiểu dữ liệu */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            <option value="video">Video & Shorts</option>
            <option value="live">Live</option>
            <option value="playlist">Playlist</option>
          </select>

          <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            min="1"
            max="50"
          />

          {/* Nút Sync sử dụng type đã chọn */}
          <button
            onClick={() => mutation.mutate(selectedType)} // Truyền type từ state vào đây
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all active:scale-95 disabled:bg-gray-400 flex items-center gap-2"
          >
            {mutation.isPending ? (
              <>⏳ Syncing {selectedType}...</>
            ) : (
              <>🔄 Sync {selectedType} now</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v: any) => (
          <div
            key={v.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <img
              src={v.thumbnail}
              alt={v.title}
              className="w-full aspect-video object-cover"
            />
            <div className="p-4">
              <span className="text-xs font-bold uppercase px-2 py-1 bg-blue-100 text-blue-600 rounded">
                {v.type}
              </span>
              <h3 className="mt-2 font-semibold text-gray-900 line-clamp-2">
                {v.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{v.channel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
