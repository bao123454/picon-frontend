import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { client, urlFor } from '../lib/sanityClient'; // Đảm bảo đường dẫn này chính xác
import { Search, CalendarDays, Newspaper } from 'lucide-react'; // Thêm icon
import noResultsImage from '../assets/download.jpg'; // Import hình ảnh cho "không tìm thấy"
import { PhoneCall } from "lucide-react";
const News = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [allNewsItems, setAllNewsItems] = useState([]); // Tất cả tin tức gốc
  const [searchTitle, setSearchTitle] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filteredNewsItems, setFilteredNewsItems] = useState([]); // Tin tức đã lọc
  const [isSearching, setIsSearching] = useState(false); // Cờ để biết có đang tìm kiếm hay không
  const [isLoading, setIsLoading] = useState(true); // State cho trạng thái tải

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const query = `*[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          mainImage,
          publishedAt,
          author->{ name },
          body
        }`;
        const data = await client.fetch(query);
        setAllNewsItems(data);
        setFilteredNewsItems(data);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    let filtered = [...allNewsItems];

    if (searchTitle.trim() !== '') {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (searchDate) {
      filtered = filtered.filter((item) =>
        item.publishedAt && new Date(item.publishedAt).toISOString().slice(0, 10) === searchDate
      );
    }

    setFilteredNewsItems(filtered);
    setIsSearching(true);
    setCurrentPage(1);
    setIsLoading(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNewsItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    const totalPages = Math.ceil(filteredNewsItems.length / itemsPerPage);
    if (totalPages > 0 && (pageNumber < 1 || pageNumber > totalPages)) {
        return;
    }
    if (totalPages === 0 && pageNumber === 1) {
        setCurrentPage(pageNumber);
        return;
    }
    if (totalPages > 0 && pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
    }
  };

  const newsListMinHeight = "min-h-[600px]"; // Chiều cao tối thiểu cho container chính

  return (
    
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      <div className={`flex-grow max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full`}>
        <header className="text-center py-12 md:py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Chuyên mục Tin Tức</h1>
          <p className="text-gray-600 mt-4 sm:mt-6 text-lg">
            Cập nhật những tin tức mới nhất từ công ty chúng tôi.
          </p>
        </header>

        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          {/* ... Bộ lọc tìm kiếm ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <label htmlFor="searchTitle" className="block text-sm font-medium text-gray-700 mb-1">Tìm theo tiêu đề</label>
              <Newspaper className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" size={20} />
              <input
                id="searchTitle"
                type="text"
                placeholder="Nhập tiêu đề..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
              />
            </div>
            <div className="relative">
              <label htmlFor="searchDate" className="block text-sm font-medium text-gray-700 mb-1">Tìm theo ngày đăng</label>
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" size={20} />
              <input
                id="searchDate"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-cyan-600 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors duration-150 h-[46px] md:mt-0 mt-4"
            >
              <Search size={20} />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Div này sẽ có chiều cao tối thiểu cố định */}
        <div className={`${newsListMinHeight} flex flex-col`}>
          {isLoading ? (
            // Phần loading sẽ cố gắng chiếm toàn bộ không gian của div cha (nếu cần)
            <div className="flex-grow flex flex-col justify-center items-center text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
              <p className="text-xl text-gray-600 mt-4">Đang tải tin tức...</p>
            </div>
          ) : currentItems.length > 0 ? (
            // SỬA Ở ĐÂY: Bỏ `flex-grow` khỏi <section>
            // Section này sẽ chỉ cao bằng nội dung của nó (các card).
            // Nếu nội dung ít, section sẽ thấp, và không gian trống sẽ ở dưới section,
            // nhưng vẫn nằm trong div cha có min-h-[600px].
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <article
                  key={item._id}
                  className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <Link to={`/tin-tuc/${item.slug.current}`} state={{ item, list: allNewsItems }} className="block">
                    {item.mainImage ? (
                      <div className="w-full h-56 overflow-hidden">
                        <img
                          src={urlFor(item.mainImage).width(600).height(400).fit('crop').url()}
                          alt={item.title || 'Hình ảnh tin tức'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                        <Newspaper size={48} className="text-gray-400" />
                      </div>
                    )}
                  </Link>
                  <div className="p-5 flex flex-col flex-grow">
                    <Link to={`/tin-tuc/${item.slug.current}`} state={{ item, list: allNewsItems }}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 cursor-pointer group-hover:text-cyan-600 transition-colors line-clamp-2" title={item.title}>
                        {item.title}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <CalendarDays size={14} className="inline mr-1.5 align-text-bottom" />
                        Ngày đăng: {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                      {item.author?.name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tác giả: {item.author.name}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            // Phần "không tìm thấy" sẽ cố gắng chiếm toàn bộ không gian của div cha (nếu cần)
            <div className="flex-grow flex flex-col justify-center items-center text-center p-6">
              <img
                src={noResultsImage}
                alt="Không tìm thấy tin tức"
                className="w-60 h-60 mb-6 object-contain rounded-lg border-2 border-gray-300 p-2"
              />
              <p className="text-2xl font-semibold text-gray-700 mb-2">Không tìm thấy bài viết phù hợp.</p>
              {isSearching && (
                <p className="text-gray-500">Vui lòng thử lại với từ khóa hoặc ngày khác.</p>
              )}
              {!isSearching && allNewsItems.length === 0 && (
                <p className="text-gray-500">Hiện tại chưa có tin tức nào được đăng.</p>
              )}
            </div>
          )}
        </div>

        {/* Phân trang */}
        {!isLoading && filteredNewsItems.length > itemsPerPage && (
          <nav className="mt-10 flex justify-center pb-8">
            {/* ... Code phân trang giữ nguyên, đã có cursor-pointer đúng ... */}
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg 
                    hover:bg-gray-100 hover:text-gray-700 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${currentPage !== 1 ? 'cursor-pointer' : ''}`}
                >
                  Trước
                </button>
              </li>
              {[...Array(Math.ceil(filteredNewsItems.length / itemsPerPage)).keys()].map((number) => (
                <li key={number}>
                  <button
                    onClick={() => paginate(number + 1)}
                    className={`px-4 py-2 leading-tight border border-gray-300 
                      ${currentPage === number + 1
                        ? 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700 cursor-default' 
                        : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer'
                      }`}
                  >
                    {number + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredNewsItems.length / itemsPerPage)}
                  className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg 
                    hover:bg-gray-100 hover:text-gray-700 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${currentPage !== Math.ceil(filteredNewsItems.length / itemsPerPage) ? 'cursor-pointer' : ''}`}
                >
                  Sau
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default News;
