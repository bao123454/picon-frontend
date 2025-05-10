import { CheckCircle, Users, ShieldCheck, Lightbulb, Handshake } from "lucide-react";
import img1 from "../assets/home-image-1.jpg";
import StaffCarousel from "./StaffCarousel";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PhoneCall } from "lucide-react";

const About = () => {
    const { hash } = useLocation();
    useEffect(() => {
        if (hash) {
          setTimeout(() => {
            const element = document.querySelector(hash);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100); // Add delay to ensure elements are loaded
        }
      }, [hash]);
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto mt-16">
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
      <section className="text-center mb-12" id="tong-quan">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Tổng quan về công ty
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
          Chào mừng đến với <span className="font-bold text-logo-gradient">Picons Construction</span>,
          đối tác đáng tin cậy của bạn trong việc xây dựng tương lai. Với hơn 20 năm kinh nghiệm,
          chúng tôi mang đến các giải pháp sáng tạo và đáng tin cậy cho các dự án dân dụng, thương mại
          và công nghiệp.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img src={img1} alt="Construction site" className="rounded-lg shadow-lg" />
        </div>
        <section id="su-menh">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sứ mệnh của chúng tôi
          </h3>
          <p className="text-lg md:text-xl text-gray-600 mb-4">
            Tại <span className="font-bold text-logo-gradient">Picons Construction</span>,
            sứ mệnh của chúng tôi là biến tầm nhìn thành hiện thực thông qua tay nghề thủ công chất
            lượng cao và cam kết về sự xuất sắc. Chúng tôi xây dựng mối quan hệ lâu dài với khách hàng
            bằng sự uy tín và chất lượng vượt trội.
          </p>
        </section>
      </div>

      <section className="mt-16" id="gia-tri">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8">
          Giá trị cốt lõi
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: CheckCircle, title: "Chính trực", desc: "Duy trì các tiêu chuẩn đạo đức cao nhất." },
            { icon: ShieldCheck, title: "An toàn", desc: "Ưu tiên sự an toàn cho nhóm và cộng đồng." },
            { icon: Lightbulb, title: "Đổi mới", desc: "Áp dụng công nghệ hiện đại." },
            { icon: Users, title: "Sự hài lòng của khách hàng", desc: "Khách hàng là trung tâm của mọi việc." },
            { icon: Handshake, title: "Chất lượng", desc: "Đảm bảo chất lượng với quy trình tỉ mỉ." },
          ].map(({ icon: Icon, title, desc }, index) => (
            <div key={index} className="flex items-start space-x-4">
              <Icon className="text-green-500 w-12 h-12" />
              <div>
                <h4 className="text-xl md:text-2xl font-semibold">{title}</h4>
                <p className="text-lg text-gray-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-20">
        <StaffCarousel />
      </div>
    </section>
  );
};

export default About;

