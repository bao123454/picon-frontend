import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Thêm Link
import { client } from '../lib/sanityClient';
import { ArrowLeft, MapPin, Briefcase, Building, CalendarCheck2, AlertTriangle, Send, ChevronsRight } from 'lucide-react'; // Thêm icons
import { PhoneCall } from 'lucide-react';
// Skeleton Loader cho chi tiết công việc
const JobDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="mb-6">
      <div className="h-6 bg-gray-300 rounded-md w-1/4"></div> {/* Back button placeholder */}
    </div>
    <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl">
      <div className="h-10 bg-gray-300 rounded-md w-3/4 mb-4"></div> {/* Title */}
      <div className="h-5 bg-gray-300 rounded-md w-1/3 mb-8"></div> {/* Location */}
      
      <div className="h-7 bg-gray-300 rounded-md w-1/2 mb-5"></div> {/* Subtitle */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded-md"></div>
        ))}
        <div className="h-4 bg-gray-300 rounded-md w-5/6"></div>
      </div>
      
      <div className="h-7 bg-gray-300 rounded-md w-1/2 mt-10 mb-5"></div> {/* Subtitle 2 */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded-md"></div>
        ))}
      </div>
      <div className="mt-10 h-12 bg-gray-300 rounded-lg w-48"></div> {/* Apply button */}
    </div>
  </div>
);

const RecruitmentDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Thêm state cho lỗi

  useEffect(() => {
    window.scrollTo(0,0); // Cuộn lên đầu trang khi vào
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mở rộng query để lấy thêm thông tin nếu có, ví dụ:
        const query = `*[_type == "jobOpening" && slug.current == $slug][0] {
          _id,
          title,
          description, // Giả sử đây là text đơn giản, nếu là PortableText cần query khác
          responsibilities, // array of strings
          qualifications, // array of strings
          benefits, // array of strings
          location,
          employmentType,
          department,
          publishedAt // Thêm ngày đăng nếu muốn hiển thị
        }`;
        const data = await client.fetch(query, { slug });
        if (data) {
          setJob(data);
        } else {
          setError("Vị trí tuyển dụng không tồn tại hoặc đã bị xóa.");
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError("Đã có lỗi xảy ra khi tải thông tin vị trí. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchJob();
    } else {
      setError("Không tìm thấy thông tin vị trí.");
      setLoading(false);
    }
  }, [slug]);

  // Hàm render các danh sách (trách nhiệm, yêu cầu, quyền lợi)
  const renderListSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">{title}</h2>
        <ul className="list-disc list-outside pl-5 space-y-2 text-slate-700">
          {items.map((item, index) => (
            <li key={index} className="text-base md:text-lg leading-relaxed">{item}</li>
          ))}
        </ul>
      </div>
    );
  };


  if (loading) {
    return (
        <div className="bg-slate-100 py-12 md:py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <JobDetailSkeleton />
            </div>
        </div>
    );
  }

  if (error || !job) {
    return (
        <div className="bg-slate-100 py-12 md:py-16 min-h-screen flex flex-col items-center justify-center text-center px-4">
            
            <AlertTriangle size={56} className="text-red-500 mb-5" />
            <h2 className="text-2xl font-semibold text-red-600 mb-3">Không tìm thấy nội dung</h2>
            <p className="text-slate-700 max-w-md mb-8">{error || "Vị trí tuyển dụng bạn tìm kiếm không tồn tại hoặc đã bị xóa."}</p>
            <button
                className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150 py-2.5 px-6 rounded-lg font-medium shadow-md hover:shadow-lg cursor-pointer"
                onClick={() => navigate('/tuyen-dung')}
            >
                <ArrowLeft className="w-5 h-5" />
                Về trang Tuyển dụng
            </button>
        </div>
    );
  }

  // Xử lý description nếu nó là một chuỗi dài có các đoạn ngăn cách bởi \n
  const descriptionParagraphs = job.description?.split('\n').filter(p => p.trim() !== '');

  return (
    <div className=" mt-15 bg-slate-100 py-8 md:py-12 min-h-screen selection:bg-indigo-100 selection:text-indigo-700">
      {/* Breadcrumbs */}
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
      <nav className="mb-6 md:mb-8">
        <div className="container mx-auto px-4">
            <ol className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                <li><Link to="/" className="hover:text-indigo-600 transition-colors cursor-pointer">Trang chủ</Link></li>
                <li><ChevronsRight size={14} className="text-gray-400" /></li>
                <li><Link to="/tuyen-dung" className="hover:text-indigo-600 transition-colors cursor-pointer">Tuyển dụng</Link></li>
                <li><ChevronsRight size={14} className="text-gray-400" /></li>
                <li className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md" title={job.title}>
                {job.title}
                </li>
            </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <button
          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors duration-150 mb-6 md:mb-8 font-medium group cursor-pointer"
          onClick={() => navigate('/tuyen-dung')} // Navigate về trang list tuyển dụng
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
          Quay lại danh sách
        </button>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl ring-1 ring-gray-200/80">
          <header className="mb-6 md:mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 !leading-tight mb-3">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              {job.location && (
                <span className="flex items-center">
                  <MapPin size={16} className="mr-1.5 text-indigo-600" /> {job.location}
                </span>
              )}
              {job.employmentType && (
                <span className="flex items-center">
                  <Briefcase size={16} className="mr-1.5 text-indigo-600" /> {job.employmentType}
                </span>
              )}
              {job.department && (
                <span className="flex items-center">
                  <Building size={16} className="mr-1.5 text-indigo-600" /> {job.department}
                </span>
              )}
               {job.publishedAt && (
                <span className="flex items-center">
                  <CalendarCheck2 size={16} className="mr-1.5 text-indigo-600" />
                  Đăng ngày: {new Date(job.publishedAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </header>
          
          <div className="prose prose-lg max-w-none 
                          prose-headings:font-semibold prose-headings:text-slate-800 prose-headings:mb-3 prose-headings:mt-6
                          prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                          prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:mb-4
                          prose-li:marker:text-indigo-600
                          prose-strong:font-semibold prose-strong:text-slate-800">
            
            {descriptionParagraphs && descriptionParagraphs.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4 border-b pb-2">Mô tả công việc</h2>
                    {descriptionParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            )}

            {renderListSection("Trách nhiệm chính", job.responsibilities)}
            {renderListSection("Yêu cầu ứng viên", job.qualifications)}
            {renderListSection("Quyền lợi được hưởng", job.benefits)}

            {(!job.description && !job.responsibilities && !job.qualifications && !job.benefits) && (
                <p className="italic text-slate-500">Thông tin chi tiết về vị trí này đang được cập nhật.</p>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200 text-center md:text-left">
            <button
              onClick={() => {
                navigate('/tuyen-dung', { state: { openModal: true, jobTitle: job.title } });
              }}
              className="inline-flex items-center gap-2.5 bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Send size={18} />
              Ứng tuyển ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentDetailsPage;
