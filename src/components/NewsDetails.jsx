import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { client, urlFor } from '../lib/sanityClient';
import { PortableText } from '@portabletext/react';
 import { PhoneCall } from "lucide-react";
// Thêm các icon cần thiết
import { CalendarDays, Facebook, ChevronsRight, ExternalLink, Edit2, Image as ImageIcon, AlertTriangle, Newspaper, Share2 } from 'lucide-react';

// --- Components con cho trạng thái UI ---

// Skeleton Loader cho nội dung chính
const ArticleSkeleton = () => (
  <div className="animate-pulse w-full">
    <div className="h-10 bg-gray-300 rounded-md w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-300 rounded-md w-1/3 mb-6"></div>
    <div className="h-72 bg-gray-300 rounded-lg w-full mb-8"></div>
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-5 bg-gray-300 rounded-md"></div>
      ))}
      <div className="h-5 bg-gray-300 rounded-md w-5/6"></div>
    </div>
  </div>
);

// Skeleton Loader cho tin liên quan
const RelatedNewsSkeleton = () => (
  <div className="animate-pulse w-full">
    <div className="h-7 bg-gray-300 rounded-md w-1/2 mb-6"></div>
    <ul className="space-y-5">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-300 rounded-md"></div>
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-gray-300 rounded-md"></div>
            <div className="h-3 bg-gray-300 rounded-md w-3/4"></div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// Component hiển thị lỗi
const ErrorDisplay = ({ message }) => (
  <div className="flex-grow flex flex-col items-center justify-center text-center py-20 px-4 bg-gray-50 min-h-[calc(100vh-200px)]">
    <AlertTriangle size={56} className="text-red-500 mb-5" />
    <h2 className="text-2xl font-semibold text-red-600 mb-3">Đã có lỗi xảy ra</h2>
    <p className="text-gray-700 max-w-md mb-8">{message || "Không thể tải nội dung. Vui lòng thử lại sau."}</p>
    <Link
      to="/tin-tuc"
      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 shadow-md hover:shadow-lg"
    >
      Về trang Tin Tức
    </Link>
  </div>
);

const News_Details = () => {
  const location = useLocation();
  const { item: initialItemData, list: initialList } = location.state || {}; // Giữ lại list nếu bạn dùng ở đâu đó
  const [post, setPost] = useState(null);
  // const [thumb, setThumb] = useState(null); // Sẽ lấy trực tiếp từ post.mainImage
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const portableTextComponents = {
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) return null;
        return (
          <figure className="my-6 md:my-8">
            <img
              src={urlFor(value).width(800).fit('max').auto('format').url()}
              alt={value.alt || value.caption || 'Hình ảnh trong bài viết'}
              className="mx-auto rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl max-w-full h-auto block"
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
    marks: {
      link: ({ children, value }) => {
        const isExternal = !value.href?.startsWith('/') && !value.href?.startsWith('#');
        return (
          <a
            href={value.href}
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-sky-600 hover:text-sky-700 underline decoration-sky-600/50 hover:decoration-sky-700 transition-colors font-medium"
          >
            {children}
            {isExternal && <ExternalLink size={14} className="inline-block ml-1 align-middle" />}
          </a>
        );
      },
    },
    // Tùy chỉnh thêm các block cơ bản cho "chuyên nghiệp" hơn
    block: {
        h1: ({children}) => <h1 className="text-3xl md:text-4xl font-bold my-6 md:my-8 text-slate-900">{children}</h1>,
        h2: ({children}) => <h2 className="text-2xl md:text-3xl font-semibold my-5 md:my-7 text-slate-800">{children}</h2>,
        h3: ({children}) => <h3 className="text-xl md:text-2xl font-semibold my-4 md:my-6 text-slate-800">{children}</h3>
        // Thêm h4, blockquote, etc. nếu cần, tương tự như phiên bản chi tiết trước đó
    },
    list: {
        bullet: ({children}) => <ul className="list-disc pl-6 my-4 md:my-5 space-y-2 text-slate-700">{children}</ul>,
        number: ({children}) => <ol className="list-decimal pl-6 my-4 md:my-5 space-y-2 text-slate-700">{children}</ol>,
    },
    listItem: {
        bullet: ({children}) => <li className="text-base md:text-lg leading-relaxed mb-1">{children}</li>,
        number: ({children}) => <li className="text-base md:text-lg leading-relaxed mb-1">{children}</li>,
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const postId = initialItemData?._id;

    if (!postId) {
      setError("Thông tin bài viết không hợp lệ hoặc không được cung cấp.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Reset lỗi mỗi khi fetch lại

    const fetchPostAndRelated = async () => {
      try {
        const postQuery = `*[_type == "post" && _id == $id][0] {
          _id,
          title,
          slug,
          mainImage,
          publishedAt,
          author->{name}, // Lấy tên tác giả
          body
        }`;
        // Giảm số lượng tin liên quan để sidebar gọn hơn
        const relatedQuery = `*[_type == "post" && _id != $id] | order(publishedAt desc) [0...4] {
          _id,
          title,
          slug,
          publishedAt,
          mainImage
        }`;

        const [postData, relatedData] = await Promise.all([
          client.fetch(postQuery, { id: postId }),
          client.fetch(relatedQuery, { id: postId })
        ]);

        if (!postData) {
          setError("Không tìm thấy bài viết bạn yêu cầu.");
          setPost(null);
        } else {
          setPost(postData);
        }
        setRelatedNews(relatedData || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndRelated();
  }, [initialItemData]); // Re-fetch nếu initialItemData thay đổi

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
         <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12"></div> {/* Placeholder for breadcrumbs height */}
        </nav>
        <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="lg:flex lg:gap-x-10 xl:gap-x-12">
            <div className="lg:flex-1"><ArticleSkeleton /></div>
            <div className="lg:w-[320px] xl:w-[360px] mt-10 lg:mt-0 flex-shrink-0"><RelatedNewsSkeleton /></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return <ErrorDisplay message={error || "Không tìm thấy bài viết bạn yêu cầu."} />;
  }

  const mainImageUrl = post.mainImage ? urlFor(post.mainImage).width(1200).height(675).fit('crop').auto('format').url() : null;

  return (
    <div className=" mt-25 flex flex-col min-h-screen bg-gray-100 selection:bg-sky-200 selection:text-sky-900">
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
      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40"> {/* Sticky breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-500 py-3">
            <li><Link to="/" className="hover:text-sky-600 transition-colors">Trang chủ</Link></li>
            <li><ChevronsRight size={14} className="text-gray-400" /></li>
            <li><Link to="/tin-tuc" className="hover:text-sky-600 transition-colors">Tin tức</Link></li>
            <li><ChevronsRight size={14} className="text-gray-400" /></li>
            <li className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md" title={post.title}>
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="lg:flex lg:gap-x-8 xl:gap-x-12">
          {/* Main Content */}
          <main className="lg:flex-1 bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10 overflow-hidden ring-1 ring-gray-200">
            <article>
              <header className="mb-6 md:mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-slate-900 !leading-tight">
                  {post.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarDays size={16} className="mr-1.5 text-sky-600" />
                    <span>Ngày đăng: {new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                  {post.author?.name && ( // Hiển thị tác giả nếu có
                    <div className="flex items-center">
                      <Edit2 size={16} className="mr-1.5 text-sky-600" />
                      <span>Tác giả: {post.author.name}</span>
                    </div>
                  )}
                </div>
              </header>

              {mainImageUrl && (
                <figure className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={mainImageUrl}
                    alt={`Ảnh bìa cho bài viết ${post.title}`}
                    className="w-full aspect-[16/9] object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </figure>
              )}
              
              <hr className="my-6 md:my-8 border-gray-200/80" />

              {/* Sử dụng plugin @tailwindcss/typography cho nội dung bài viết */}
              <div className="prose prose-lg lg:prose-xl max-w-none 
                              prose-headings:font-semibold prose-headings:text-slate-800 
                              prose-p:text-slate-700 prose-p:leading-relaxed
                              prose-a:text-sky-600 prose-a:font-medium hover:prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline
                              prose-strong:text-slate-800 prose-strong:font-semibold
                              prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50 prose-blockquote:text-sky-800 prose-blockquote:rounded-r-md prose-blockquote:shadow-sm
                              prose-li:marker:text-sky-600
                              prose-img:rounded-lg prose-img:shadow-md">
                {post.body ? (
                  <PortableText value={post.body} components={portableTextComponents} />
                ) : (
                  <p className="text-gray-500 italic py-10 text-center">Nội dung bài viết hiện đang được cập nhật.</p>
                )}
              </div>

              <hr className="my-8 md:my-10 border-gray-200/80" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div>
                  {/* Có thể thêm Tags hoặc Categories ở đây nếu muốn */}
                </div>
                <button
                  onClick={shareOnFacebook}
                  title="Chia sẻ bài viết này lên Facebook"
                  className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Facebook size={18} />
                  Chia sẻ Facebook
                </button>
              </div>
            </article>
          </main>

          {/* Related News Sidebar */}
          {relatedNews.length > 0 && (
            <aside className="lg:w-[320px] xl:w-[360px] mt-10 lg:mt-0 flex-shrink-0">
              <div className="sticky top-24 bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200">
                <h3 className="text-xl font-bold text-slate-900 mb-5 border-b border-gray-200 pb-3.5 flex items-center">
                  <Newspaper size={20} className="inline-block mr-2.5 text-sky-600" />
                  Tin tức liên quan
                </h3>
                <ul className="space-y-5">
                  {relatedNews.map((newsItem) => ( // Đổi tên biến để tránh xung đột
                    <li key={newsItem._id} className="group"> {/* Di chuyển group vào li */}
                      <Link 
                        to={`/tin-tuc/${newsItem.slug?.current}`} // Thêm optional chaining cho slug
                        state={{ item: newsItem, list: initialList }} // Truyền initialList nếu cần
                        className="flex items-start gap-4 p-2 -m-2 rounded-lg hover:bg-gray-100 transition-colors" // Thêm padding và margin âm để tăng vùng click
                      >
                        <div className="flex-shrink-0">
                          {newsItem.mainImage ? (
                            <img
                              src={urlFor(newsItem.mainImage).width(80).height(60).fit('crop').url()}
                              alt={newsItem.title}
                              className="w-20 h-[60px] object-cover rounded-md shadow-sm group-hover:opacity-80 transition-opacity"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-20 h-[60px] bg-gray-100 rounded-md flex items-center justify-center">
                              <ImageIcon size={24} className="text-gray-400"/>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0"> {/* min-w-0 để line-clamp hoạt động tốt */}
                          <h4
                            className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug"
                            title={newsItem.title}
                          >
                            {newsItem.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(newsItem.publishedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default News_Details;
