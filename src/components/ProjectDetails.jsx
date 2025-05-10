import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { client, urlFor } from '../lib/sanityClient';
import { PortableText } from '@portabletext/react';
import { ArrowLeft, MapPin, Hourglass, CalendarCheck2, Image as ImageIcon, AlertTriangle, ChevronsRight, ExternalLink, Layers } from 'lucide-react'; // Thêm Layers icon
import { PhoneCall } from 'lucide-react';
// --- Components con cho trạng thái UI ---

const ProjectDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="mb-8">
      <div className="h-6 bg-gray-300 rounded-md w-1/4"></div>
    </div>
    <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl">
      <div className="h-10 bg-gray-300 rounded-lg w-3/4 mb-6"></div>
      <div className="h-72 md:h-80 lg:h-96 bg-gray-300 rounded-lg w-full mb-8"></div> {/* Main Image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded-md w-1/3"></div>
            <div className="h-5 bg-gray-300 rounded-md w-2/3"></div>
          </div>
        ))}
      </div>
      <div className="h-8 bg-gray-300 rounded-lg w-1/2 mb-6"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-5 bg-gray-300 rounded-md"></div>
        ))}
        <div className="h-5 bg-gray-300 rounded-md w-5/6"></div>
      </div>
      {/* Skeleton cho related projects */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="h-8 bg-gray-300 rounded-lg w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
        </div>
      </div>
    </div>
  </div>
);

const NotFoundDisplay = ({ message }) => (
  <div className="flex-grow flex flex-col items-center justify-center text-center py-20 px-4 min-h-[calc(100vh-200px)]">
    <AlertTriangle size={56} className="text-red-500 mb-5" />
    <h2 className="text-2xl font-semibold text-red-600 mb-3">Không tìm thấy dự án</h2>
    <p className="text-slate-700 max-w-md mb-8">{message || "Dự án bạn tìm kiếm không tồn tại hoặc đã bị xóa."}</p>
    <Link
      to="/du-an"
      className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150 py-2.5 px-6 rounded-lg font-medium shadow-md hover:shadow-lg cursor-pointer"
    >
      <ArrowLeft className="w-5 h-5" />
      Xem tất cả dự án
    </Link>
  </div>
);


const ProjectDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]); // State cho dự án liên quan
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const portableTextComponents = {
    types: {
      image: ({ value }) => { // Component này render ảnh BÊN TRONG project.body (PortableText)
        if (!value?.asset?._ref) return null;
        return (
          <figure className="my-6 md:my-8">
            <img
              src={urlFor(value).width(768).fit('max').auto('format').url()} // Kích thước cho ảnh trong nội dung
              alt={value.alt || value.caption || 'Hình ảnh trong nội dung dự án'}
              className="mx-auto rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl max-w-3xl h-auto block"
              loading="lazy"
            />
            {value.caption && (
              <figcaption className="mt-2 text-center text-sm text-gray-600 italic">
                {value.caption}
              </figcaption>
            )}
          </figure>
        );
      },
    },
    marks: { /* Giữ nguyên */ },
    block: { /* Giữ nguyên */ },
    list: { /* Giữ nguyên */ },
    listItem: { /* Giữ nguyên */ }
  };

  useEffect(() => {
    window.scrollTo(0,0);
    if (!slug) {
      setError("Không có thông tin slug dự án.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchProjectData = async () => {
      try {
        const projectQuery = `*[_type == "project" && slug.current == $slug][0] {
          _id, name, location, status, startDate, endDate, 
          investor, area, image, 
          gallery[]{asset->{_id, url, metadata{dimensions}}, alt, caption},
          body,
          "categories": categories[]->{_id, title} // Lấy ID và title của category
        }`;
        
        const currentProject = await client.fetch(projectQuery, { slug });

        if (currentProject) {
          setProject(currentProject);

          // Fetch related projects (ví dụ: 3 dự án khác, ưu tiên cùng category nếu có)
          let relatedQuery = `*[_type == "project" && slug.current != $currentSlug] | order(startDate desc, _createdAt desc) [0...3] {
            _id, name, slug, image, location
          }`;
          let relatedParams = { currentSlug: slug };

          if (currentProject.categories && currentProject.categories.length > 0) {
            const categoryIds = currentProject.categories.map(cat => cat._id);
            // Query ưu tiên các dự án có ít nhất một category giống với dự án hiện tại
            // và loại trừ dự án hiện tại, lấy 3 dự án.
            relatedQuery = `*[_type == "project" && slug.current != $currentSlug && count((categories[]->_id)[@ in $categoryIds]) > 0] | order(startDate desc, _createdAt desc) [0...3] {
                _id, name, slug, image, location
            }`;
            relatedParams = { currentSlug: slug, categoryIds };
          }
          
          let relatedData = await client.fetch(relatedQuery, relatedParams);

          // Nếu không đủ 3 tin liên quan theo category, lấy thêm các tin mới nhất khác
          if (relatedData.length < 3) {
            const fallbackQuery = `*[_type == "project" && slug.current != $currentSlug && !(_id in $excludeIds)] | order(startDate desc, _createdAt desc) [0...${3 - relatedData.length}] {
                _id, name, slug, image, location
            }`;
            const excludeIds = [slug, ...relatedData.map(p => p._id)]; // Loại trừ dự án hiện tại và các dự án đã có
            const fallbackData = await client.fetch(fallbackQuery, { currentSlug: slug, excludeIds });
            relatedData = [...relatedData, ...fallbackData];
          }
          
          setRelatedProjects(relatedData.slice(0, 3)); // Đảm bảo chỉ có tối đa 3 dự án

        } else {
          setError(`Không tìm thấy dự án với slug: ${slug}`);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError("Đã xảy ra lỗi khi tải dữ liệu dự án.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [slug]);

  if (loading) {
    return (
        <div className="bg-slate-100 py-12 md:py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <ProjectDetailSkeleton />
            </div>
        </div>
    );
  }

  if (error || !project) {
    return <NotFoundDisplay message={error || "Dự án không tồn tại hoặc đã bị xóa."} />;
  }

  const mainImageUrl = project.image 
    ? urlFor(project.image).width(1200).height(600).fit('crop').auto('format').url() 
    : null;

  return (
    <div className="bg-slate-100 py-8 md:py-12 min-h-screen selection:bg-indigo-100 selection:text-indigo-700">
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
      <nav className="mb-6 md:mb-8"> {/* Breadcrumbs */} </nav>

      <div className="container mx-auto px-4">
        <button
          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors duration-150 mb-6 md:mb-8 font-medium group cursor-pointer text-sm"
          onClick={() => navigate('/du-an')}
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Tất cả dự án
        </button>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl ring-1 ring-gray-200/80">
          <header className="mb-6 md:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 !leading-tight">
              {project.name}
            </h1>
          </header>

          {mainImageUrl && (
            <figure className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-xl">
              <img
                src={mainImageUrl}
                alt={`Hình ảnh dự án ${project.name}`}
                className="w-full aspect-[2/1] md:aspect-[16/7] object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                loading="lazy"
              />
            </figure>
          )}
          
          <section className="mb-8 md:mb-10 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            {/* ... Thông tin tổng quan giữ nguyên ... */}
            <h2 className="text-xl font-semibold text-indigo-800 mb-5">Thông tin tổng quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 text-slate-700">
              {project.location && (
                <div className="flex items-start">
                  <MapPin size={20} className="text-indigo-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-600">Vị trí:</strong>
                    <span className="text-base">{project.location}</span>
                  </div>
                </div>
              )}
              {project.status && (
                <div className="flex items-start">
                  <Hourglass size={20} className="text-indigo-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-600">Trạng thái:</strong>
                    <span className="text-base font-medium text-green-600">{project.status}</span>
                  </div>
                </div>
              )}
              {project.startDate && (
                <div className="flex items-start">
                  <CalendarCheck2 size={20} className="text-indigo-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-600">Ngày khởi công:</strong>
                    <span className="text-base">{new Date(project.startDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              )}
              {project.endDate && (
                <div className="flex items-start">
                   <CalendarCheck2 size={20} className="text-indigo-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-600">Ngày hoàn thành (dự kiến):</strong>
                    <span className="text-base">{new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              )}
               {project.investor && (
                <div className="flex items-start">
                  <ImageIcon size={20} className="text-indigo-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-600">Chủ đầu tư:</strong>
                    <span className="text-base">{project.investor}</span>
                  </div>
                </div>
              )}
              {project.area && (
                <div className="flex items-start">
                   <MapPin size={20} className="text-indigo-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-600">Diện tích:</strong>
                    <span className="text-base">{project.area}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {project.body && (
            <section className="mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4 md:mb-6 pt-6 border-t border-gray-200">
                Chi tiết dự án
              </h2>
              <div className="prose prose-lg lg:prose-xl max-w-none 
                              prose-headings:font-semibold prose-headings:text-slate-800 
                              prose-p:text-slate-700 prose-p:leading-relaxed
                              prose-a:text-sky-600 prose-a:font-medium hover:prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline
                              prose-strong:text-slate-800 prose-strong:font-semibold
                              prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50 prose-blockquote:text-sky-800 prose-blockquote:rounded-r-md prose-blockquote:shadow-sm
                              prose-ul:list-disc prose-ul:list-outside prose-ul:pl-5 prose-ul:space-y-1
                              prose-li:marker:text-sky-600
                              prose-img:rounded-lg prose-img:shadow-md">
                <PortableText value={project.body} components={portableTextComponents} />
              </div>
            </section>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <section className="mb-8 md:mb-10"> {/* Thêm margin bottom cho section này */}
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4 md:mb-6 pt-6 border-t border-gray-200">
                    Thư viện hình ảnh
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {project.gallery.map((img, index) => (
                        img.asset?.url && (
                            <a key={img.asset._id || index} href={urlFor(img.asset).url()} target="_blank" rel="noopener noreferrer" className="block group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow aspect-square cursor-pointer">
                                <img 
                                    src={urlFor(img.asset).width(400).height(400).fit('crop').auto('format').url()} 
                                    alt={img.alt || img.caption || `Hình ảnh dự án ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </a>
                        )
                    ))}
                </div>
            </section>
          )}

          {/* PHẦN MỚI: DỰ ÁN LIÊN QUAN */}
          {relatedProjects && relatedProjects.length > 0 && (
            <section className="pt-8 md:pt-12 mt-8 md:mt-12 border-t border-gray-200">
              <div className="flex items-center mb-6 md:mb-8">
                <Layers size={28} className="text-red-600 mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-red-600 uppercase tracking-wider">
                  Dự án liên quan
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {relatedProjects.map((relatedPrj) => (
                  <Link 
                    to={`/du-an/${relatedPrj.slug?.current}`} 
                    key={relatedPrj._id}
                    className="block group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
                    onClick={() => setLoading(true)} // Set loading khi click để UX tốt hơn khi chuyển trang
                  >
                    <div className="relative">
                      {relatedPrj.image ? (
                        <img
                          src={urlFor(relatedPrj.image).width(400).height(250).fit('crop').auto('format').url()}
                          alt={relatedPrj.name}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <ImageIcon size={40} className="text-gray-400" />
                        </div>
                      )}
                       {/* Lớp phủ và tên dự án giống ảnh bạn gửi */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight shadow-text">
                            {relatedPrj.name}
                          </h3>
                          {/* Optional: Thêm vị trí nếu muốn */}
                          {/* {relatedPrj.location && (
                            <p className="text-xs text-gray-200 mt-1 flex items-center">
                              <MapPin size={12} className="mr-1" /> {relatedPrj.location}
                            </p>
                          )} */}
                      </div>
                    </div>
                    {/* Phần thông tin thêm dưới ảnh nếu muốn, ví dụ:
                    <div className="p-4">
                        <p className="text-sm text-gray-600">{relatedPrj.location || 'N/A'}</p>
                    </div> 
                    */}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
