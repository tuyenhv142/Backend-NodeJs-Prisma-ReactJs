import React, { useMemo } from 'react';
import { MapPin, PlayCircle, Users, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { restaurantApi } from '../api/restaurantApi';
import { useQuery } from '@tanstack/react-query';

const trafficData = [
  { day: 'Monday', views: 400 },
  { day: 'Tuesday', views: 300 },
  { day: 'Wednesday', views: 550 },
  { day: 'Thursday', views: 450 },
  { day: 'Friday', views: 700 },
  { day: 'Saturday', views: 1200 },
  { day: 'Sunday', views: 1500 },
];

export const Dashboard = () => {
  const { data } = useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantApi.getAll,
  });

  // 1. LẤY ĐÚNG MẢNG: Bóc 2 lớp .data của Axios và Backend
  const restaurantList = data?.data?.data || [];

  // 2. TỰ ĐỘNG NHÓM DỮ LIỆU CHO BIỂU ĐỒ CỘT
  const categoryData = useMemo(() => {
    if (restaurantList.length === 0) return [];

    // Đếm số lượng quán theo từng Category
    const counts = restaurantList.reduce((acc: any, restaurant: any) => {
      const cat = restaurant.category || 'Khác';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Chuyển thành mảng cho biểu đồ Recharts
    return Object.keys(counts).map((key) => ({
      name: key,
      count: counts[key],
    }));
  }, [restaurantList]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* 1. Các thẻ thống kê (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Restaurants"
          // SỬ DỤNG .length THAY VÌ .count
          value={restaurantList.length}
          icon={<MapPin size={24} className="text-orange-500" />}
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Video "
          value="125"
          icon={<PlayCircle size={24} className="text-blue-500" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title=""
          value=""
          icon={<Users size={24} className="text-green-500" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title=""
          value=""
          icon={<TrendingUp size={24} className="text-purple-500" />}
          bgColor="bg-purple-50"
        />
      </div>

      {/* 2. Khu vực Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Biểu đồ Cột: Thống kê danh mục */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Category Distribution
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Đường: Lượt truy cập */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Traffic Overview
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trafficData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#F97316"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#F97316' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Đã cập nhật value: string | number để TypeScript không báo lỗi
const StatCard = ({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-full ${bgColor}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);
