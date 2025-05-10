import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client, urlFor } from '../lib/sanityClient'; // Đảm bảo đường dẫn này chính xác
import { Search, MapPin, Hourglass, Calendar } from 'lucide-react';
import noResultsImage from '../assets/download.jpg'; // Import hình ảnh
 import { PhoneCall } from "lucide-react";

const Project = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Thêm state cho trạng thái tải
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true); // Bắt đầu tải
      try {
        const query = `*[_type == "project"] {
          _id,
          name,
          slug,
          location,
          status,
          startDate,
          image
        }`;
        const data = await client.fetch(query);
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        // Có thể thêm xử lý lỗi cho người dùng ở đây
      } finally {
        setIsLoading(false); // Kết thúc tải
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (locationFilter === '' || project.location === locationFilter) &&
      (statusFilter === '' || project.status === statusFilter) &&
      (startDateFilter === '' || project.startDate >= startDateFilter)
    );
  });

  // Xác định chiều cao tối thiểu cho khu vực danh sách dự án.
  // Bạn cần điều chỉnh giá trị này cho phù hợp với thiết kế.
  // Ví dụ: 'min-h-[400px]' hoặc 'min-h-[60vh]' (60% chiều cao viewport).
  // Một cách tiếp cận là ước lượng chiều cao của khoảng 1-2 hàng dự án.
  const projectListContainerMinHeight = "min-h-[500px]"; // Ví dụ: tối thiểu 500px

  return (
    // Thêm một lớp CSS để đảm bảo component cha cũng có thể linh hoạt nếu cần
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-16 flex flex-col">
       <a
        href="tel:+84243377383"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 cursor-pointer bg-red-600 flex items-center text-white px-5 py-3 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-full shadow-xl hover:bg-red-700 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105"
        aria-label="Gọi để nhận tư vấn miễn phí"
        title="Gọi để nhận tư vấn miễn phí"
      >
        <PhoneCall className="mr-2 h-5 w-5 md:h-6 md:w-6" />
        <span className="hidden sm:inline">Nhận tư vấn miễn phí</span> {/* Ẩn chữ trên màn hình quá nhỏ nếu cần */}
        <span className="sm:hidden">Gọi ngay</span> {/* Hiển thị chữ ngắn hơn trên màn hình nhỏ */}
      </a>
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Danh sách Dự án</h1>

      {/* Phần bộ lọc */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder="Tìm theo tên dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">Tất cả địa điểm</option>
          {!isLoading && [...new Set(projects.map((p) => p.location).filter(Boolean))].sort().map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <select
          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {!isLoading && [...new Set(projects.map((p) => p.status).filter(Boolean))].sort().map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
            type="date"
            className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            title="Lọc theo ngày bắt đầu (hoặc sau ngày này)"
        />
      </div>

      {/* Khu vực hiển thị danh sách dự án hoặc thông báo */}
      {/* Áp dụng chiều cao tối thiểu ở đây */}
      <div className={`flex-grow ${projectListContainerMinHeight}`}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-xl text-gray-500">Đang tải dự án...</p>
            {/* Bạn có thể thêm spinner ở đây */}
          </div>
        ) : filteredProjects.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <li
                key={project._id}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col" // Thêm h-full và flex flex-col để các card có chiều cao đều nhau nếu nội dung khác nhau
                onClick={() => navigate(`/du-an/${project.slug.current}`)}
              >
                {project.image ? (
                  <div className="w-full h-60 overflow-hidden">
                     <img
                        src={urlFor(project.image).width(400).height(300).fit('crop').url()} // Tối ưu ảnh với Sanity
                        alt={project.name || 'Hình ảnh dự án'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Không có ảnh</span>
                  </div>
                )}
                {/* Nội dung card */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate" title={project.name}>{project.name}</h2>
                        <p className="flex items-center gap-2 text-sm text-gray-600 mb-1.5">
                            <MapPin size={16} className="text-blue-500 flex-shrink-0" /> {project.location || 'N/A'}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-gray-600 mb-1.5">
                            <Hourglass size={16} className="text-green-500 flex-shrink-0" /> {project.status || 'N/A'}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} className="text-red-500 flex-shrink-0" /> {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                    </div>
                     {/* Overlay (hiển thị khi hover trên toàn card, có thể bỏ nếu không muốn phức tạp) */}
                     {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex flex-col justify-end items-center text-white p-4">
                       <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm">Xem chi tiết</button>
                     </div> */}
                </div>

              </li>
            ))}
          </ul>
        ) : (
          // Căn giữa thông báo "Không tìm thấy" bên trong khu vực có chiều cao tối thiểu
          <div className="flex flex-col justify-center items-center h-full text-center">
            <img src={noResultsImage}
            alt="Không tìm thấy dự án" className="w-50 h-50 mb-4 text-gray-400 rounded-xl mt-15 border-3 border-black-500" /> {/* Ví dụ: thêm ảnh SVG */}
           
            <p className="text-sm text-gray-400 mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;
