  import React from "react";
  import { Swiper, SwiperSlide } from "swiper/react";
  import { Navigation, Autoplay } from "swiper/modules";
  import { Link } from "react-router-dom";
  import "swiper/css";
  import "swiper/css/navigation";

  // how to import ảnh
  import img1 from "../assets/home-image-1.jpg";
  import img2 from "../assets/home-image-2.jpg";
  import img3 from "../assets/home-image-3.jpg";
  import { PhoneCall } from "lucide-react";
  import Achievements from "./Achievements";
  import { ReactTyped } from "react-typed";

  const Home = () => {
    return (
    <>
      <div className="relative w-full h-screen">
        {/* Fullscreen Carousel */}
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 4000, disableOnInteraction: false }} // Thêm disableOnInteraction
          loop
          className="w-full h-full"
        >
          <SwiperSlide>
            <img src={img1} alt="Home 1" className="w-full h-full object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={img2} alt="Home 2" className="w-full h-full object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={img3} alt="Home 3" className="w-full h-full object-cover" />
          </SwiperSlide>
        </Swiper>

        {/* Overlay Text - Được căn giữa màn hình */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none">
          {/* Thêm -translate-y-1/2 để căn giữa hoàn hảo theo chiều dọc */}
          {/* pointer-events-none cho container này nếu chỉ muốn ReactTyped hiển thị và không chặn click */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-logo-gradient leading-tight text-logo-stroke-3">
            <ReactTyped
              strings={["XÂY DỰNG", "SÁNG TẠO", "ĐỔI MỚI"]}
              typeSpeed={40}
              backSpeed={30}
              loop
            />
          </h1>
        </div>
      </div>

      {/* NÚT GỌI ĐIỆN CỐ ĐỊNH - Đã được di chuyển ra ngoài và sửa lỗi */}
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
      
      <Achievements />

      <div className="w-full h-auto flex flex-col items-center text-center p-8 md:p-12 bg-slate-50"> {/* Thêm bg-slate-50 */}

        {/* Text Content */}
        <div className="w-full max-w-3xl mb-12 md:mb-16"> {/* Thêm mb */}
          <h2 className="text-indigo-600 text-lg font-semibold uppercase tracking-wider mb-2">Giới thiệu về chúng tôi</h2> {/* Thay đổi style */}
          <h1 className="text-logo-gradient text-4xl md:text-5xl font-extrabold mb-4">PICONS</h1> {/* Font lớn hơn, đậm hơn */}
          <p className="mt-4 text-slate-700 text-xl md:text-2xl font-semibold mb-6">
            Chúng tôi là ai?
          </p>
          <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed md:leading-loose"> {/* Tăng leading */}
           Với kinh nghiệm nhiều năm trong lĩnh vực thiết kế, lắp đặt và xây dựng các công trình công nghiệp, chúng tôi tự hào mang đến cho khách hàng những giải pháp tối ưu, an toàn và hiệu quả. Đội ngũ kỹ sư, chuyên gia của chúng tôi luôn sẵn sàng tư vấn và đồng hành cùng quý khách hàng trong từng giai đoạn, từ lên ý tưởng, thiết kế chi tiết cho đến thi công, lắp đặt hoàn thiện. Chúng tôi cam kết đáp ứng đầy đủ các tiêu chuẩn kỹ thuật, đảm bảo tiến độ thi công và tối ưu chi phí đầu tư cho các dự án nhà máy, xí nghiệp quy mô lớn nhỏ khác nhau
          </p>
        </div>

        {/* Image Grid Section */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8"> {/* Tăng max-w và gap */}
          {/* Image 1 */}
          <Link to="/chung-toi#tong-quan" className="relative group block aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"> {/* Thêm aspect ratio, rounded, shadow */}
            <img src={img1} alt="Tổng quan công ty" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg md:text-xl font-semibold text-center">TỔNG QUAN CÔNG TY</span>
            </div>
          </Link>

          {/* Image 2 */}
          <Link to="/chung-toi#su-menh" className="relative group block aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
            <img src={img2} alt="Tầm nhìn sứ mệnh" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg md:text-xl font-semibold text-center">TẦM NHÌN SỨ MỆNH</span>
            </div>
          </Link>

          {/* Image 3 */}
          <Link to="/chung-toi#gia-tri" className="relative group block aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
            <img src={img3} alt="Giá trị cốt lõi" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg md:text-xl font-semibold text-center">GIÁ TRỊ CỐT LÕI</span>
            </div>
          </Link>
        </div>

        {/* Learn More Button */}
        <Link 
          to='/chung-toi' 
          className="mt-10 md:mt-12 inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" // Style lại nút
        >
          Tìm hiểu thêm về PICONS &rarr;
        </Link>
      </div>
    </>
  );
};

export default Home;
