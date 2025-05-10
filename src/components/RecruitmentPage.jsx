import React, { useState, useEffect, Fragment } from 'react';
import { MapPin, Loader2, Briefcase, Users, Target, UploadCloud, Send, X, Building2, CheckCircle, AlertCircle } from 'lucide-react'; // Sử dụng Lucide cho đồng bộ
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { client } from '../lib/sanityClient';
import { Link, useLocation } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

// Skeleton loader cho Job Opening Card
const JobOpeningSkeleton = () => (
  <div className="border border-gray-200 bg-white p-6 rounded-xl shadow-lg animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/5 mb-3"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>
    <div className="h-10 bg-gray-300 rounded-md w-32"></div>
  </div>
);


const RecruitmentPage = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true); // State cho việc tải job openings
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cv: null,
    message: '',
    applyingForPosition: '', // Thêm trường này để biết ứng tuyển vị trí nào
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success, error

  useEffect(() => {
    const fetchJobOpenings = async () => {
      setLoadingJobs(true);
      try {
        const query = `*[_type == "jobOpening"] | order(_createdAt desc) { // Sắp xếp theo mới nhất
          _id,
          title,
          slug,
          description,
          location,
          employmentType, // Ví dụ: Full-time, Part-time
          department
        }`;
        const data = await client.fetch(query);
        setJobOpenings(data);
      } catch (err) {
        console.error('Error fetching job openings:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobOpenings();
  }, []);

  function closeModal() {
    setIsModalOpen(false);
    if (submitStatus !== 'success') {
      setFormData({ name: '', email: '', phone: '', cv: null, message: '', applyingForPosition: '' });
    }
  }

  function openModal(positionTitle = '') {
    setIsModalOpen(true);
    setSubmitStatus('idle');
    setFormData(prev => ({
        ...prev,
        name: '', email: '', phone: '', cv: null, message: '', 
        applyingForPosition: positionTitle ? `Ứng tuyển vị trí: ${positionTitle}` : ''
    }));
  }


  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'cv') {
      setFormData({ ...formData, cv: files ? files[0] : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
        Swal.fire('Thông tin thiếu', 'Vui lòng nhập Họ tên và Email.', 'warning');
        return;
    }
    if (formData.cv && formData.cv.size > 5 * 1024 * 1024) { // Giới hạn 5MB
        Swal.fire('CV quá lớn', 'Vui lòng chọn file CV có dung lượng dưới 5MB.', 'warning');
        return;
    }

    setIsSubmitting(true);
    setSubmitStatus('loading');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.phone) data.append('phone', formData.phone);
    const messageToSend = formData.applyingForPosition 
        ? `${formData.applyingForPosition}\n\n${formData.message || ''}` 
        : formData.message;
    if (messageToSend.trim()) data.append('message', messageToSend);

    if (formData.cv) {
      data.append('cvFile', formData.cv, formData.cv.name);
    }

    try {
    const baseApiUrl = import.meta.env.VITE_API_URL;

      const emailType = 'application';
      const apiUrl = `${baseApiUrl}/picon/mail/${emailType}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        Swal.fire({
          icon: 'success',
          title: 'Nộp hồ sơ thành công!',
          text: result.message || 'Chúng tôi đã nhận được hồ sơ của bạn và sẽ liên hệ sớm.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          closeModal();
          setFormData({ name: '', email: '', phone: '', cv: null, message: '', applyingForPosition: '' });
        });
      } else {
        setSubmitStatus('error');
        Swal.fire({
          icon: 'error',
          title: 'Nộp hồ sơ thất bại!',
          text: result.message || 'Có lỗi xảy ra từ máy chủ. Vui lòng thử lại.',
        });
      }
    } catch (error) {
      console.error('Submit Error:', error);
      setSubmitStatus('error');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi kết nối!',
        text: 'Không thể gửi hồ sơ. Vui lòng kiểm tra kết nối mạng và thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePositionApply = (jobId, jobTitle) => {
    openModal(jobTitle);
  };

  useEffect(() => {
    if (location.state?.openModal && location.state?.jobTitle) {
      openModal(location.state.jobTitle);
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);


  return (
    <div className="bg-slate-100 py-12 md:py-20 selection:bg-indigo-100 selection:text-indigo-700">
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
      <div className="container mx-auto px-4 space-y-16 md:space-y-20">
        {/* Banner */}
        <div
          className="relative text-white p-8 md:p-16 rounded-2xl shadow-2xl min-h-[480px]
                     text-center overflow-hidden bg-cover bg-center 
                     flex flex-col items-center justify-center isolate 
                     before:content-[''] before:absolute before:inset-0 
                     before:bg-black/70
                     before:rounded-2xl before:z-[-1]"
          style={{ backgroundImage: "url('https://apiweb.solenc.vn/public/1668315649131.jpg')" }}
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <Briefcase size={64} className="mx-auto mb-6 text-indigo-300" />
            <h1
              onClick={() => openModal()} // Thêm onClick để mở modal chung nếu người dùng không chọn vị trí cụ thể
              className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight cursor-pointer hover:text-indigo-200 transition-colors" // THÊM CURSOR VÀ HOVER
            >
              GIA NHẬP ĐỘI NGŨ CỦA CHÚNG TÔI!
            </h1>
            <p className="text-lg md:text-xl mb-10 text-indigo-100 max-w-2xl mx-auto">
              Chúng tôi luôn tìm kiếm những tài năng đam mê, sáng tạo và nhiệt huyết. Khám phá các cơ hội nghề nghiệp và cùng chúng tôi kiến tạo tương lai.
            </p>
            <button
              onClick={() => openModal()}
              className="bg-white text-indigo-600 font-semibold py-3.5 px-10 rounded-lg hover:bg-indigo-50 transition duration-300 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 cursor-pointer" // Thêm cursor-pointer
            >
              Nộp hồ sơ ngay
            </button>
          </div>
        </div>

        {/* About Us */}
        <section className="bg-white p-8 md:p-12 rounded-xl shadow-xl">
          <div className="max-w-4xl mx-auto text-center">
            <Building2 size={48} className="mx-auto mb-6 text-indigo-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Về Picons</h2>
            <p className="text-slate-700 leading-relaxed text-lg md:text-xl space-y-4">
              <span>
                Chào mừng bạn đến với Picons ! Chúng tôi tự hào là một trong những đơn vị tiên phong trong lĩnh vực. Sứ mệnh của chúng tôi là ví dụ: "mang đến những giải pháp đột phá, nâng tầm cuộc sống.
              </span>
              <span>
                Tại đây, chúng tôi xây dựng một môi trường làm việc năng động, sáng tạo, tôn trọng sự khác biệt và khuyến khích phát triển bản thân. Chúng tôi tin rằng con người là tài sản quý giá nhất và là yếu tố then chốt cho mọi thành công.
              </span>
            </p>
            {/* ĐÃ XÓA LINK "TÌM HIỂU THÊM" */}
          </div>
        </section>

        {/* Job Openings */}
        <section className="bg-transparent p-0 md:p-0 rounded-lg">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 md:mb-12 text-center flex items-center justify-center gap-3">
              <Users size={36} className="text-indigo-600" />
              Các vị trí đang tuyển dụng
            </h2>
            {loadingJobs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <JobOpeningSkeleton />
                <JobOpeningSkeleton />
              </div>
            ) : jobOpenings.length > 0 ? (
              <div className="space-y-8">
                {jobOpenings.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white border border-gray-200/80 p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 group"
                  >
                    <div className="md:flex md:justify-between md:items-start">
                        <div className="flex-grow mb-6 md:mb-0 md:mr-8">
                            <Link to={`/tuyen-dung/${job.slug?.current || job._id}`} className="block mb-2 group/title"> {/* Link sẽ có cursor-pointer mặc định */}
                                <h3 className="text-xl md:text-2xl font-semibold text-indigo-700 group-hover/title:text-indigo-900 group-hover/title:underline transition line-clamp-2" title={job.title}>
                                {job.title}
                                </h3>
                            </Link>
                            <div className="flex flex-wrap items-center text-sm text-slate-500 mb-4 gap-x-4 gap-y-1">
                                {job.location && (
                                    <span className="flex items-center">
                                        <MapPin size={15} className="mr-1.5 text-slate-400" /> {job.location}
                                    </span>
                                )}
                                {job.employmentType && (
                                    <span className="flex items-center">
                                        <Briefcase size={15} className="mr-1.5 text-slate-400" /> {job.employmentType}
                                    </span>
                                )}
                                {job.department && (
                                     <span className="flex items-center">
                                        <Target size={15} className="mr-1.5 text-slate-400" /> {job.department}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-600 text-base leading-relaxed line-clamp-3">{job.description}</p>
                        </div>
                        <div className="flex-shrink-0 mt-4 md:mt-0 text-center md:text-right space-y-3 md:space-y-0 md:flex md:flex-col md:items-end"> {/* Đảm bảo nút và link thẳng hàng */}
                            <button
                                onClick={() => handlePositionApply(job._id, job.title)}
                                className="bg-indigo-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap cursor-pointer w-full md:w-auto" // Thêm cursor-pointer
                            >
                                Ứng tuyển ngay
                            </button>
                             <Link to={`/tuyen-dung/${job.slug?.current || job._id}`} className="block mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"> {/* Link sẽ có cursor-pointer mặc định */}
                                Xem chi tiết &rarr;
                            </Link>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-600 text-lg py-12 bg-white rounded-xl shadow-md p-8">
                <Briefcase size={48} className="mx-auto mb-4 text-indigo-400" />
                <p className="font-semibold text-xl mb-2">Hiện tại chúng tôi chưa có vị trí nào đang mở.</p>
                <p>Vui lòng quay lại sau hoặc gửi hồ sơ của bạn để chúng tôi có thể liên hệ khi có vị trí phù hợp.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={isSubmitting ? () => {} : closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white p-6 sm:p-8 md:p-10 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 border-b border-gray-200 pb-4 mb-6 sm:mb-8 text-center sm:text-left">
                    NỘP HỒ SƠ ỨNG TUYỂN
                  </Dialog.Title>
                  
                   {submitStatus === 'error' && !isSubmitting && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <p className="text-sm">Có lỗi xảy ra khi gửi hồ sơ. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.</p>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      <div>
                        <label htmlFor="modal-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" name="name" id="modal-name" required
                          value={formData.name} onChange={handleFormChange}
                          className="block w-full rounded-lg border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3.5 text-base hover:bg-slate-100 disabled:opacity-70"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email" name="email" id="modal-email" required
                          value={formData.email} onChange={handleFormChange}
                          className="block w-full rounded-lg border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3.5 text-base hover:bg-slate-100 disabled:opacity-70"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label htmlFor="modal-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="tel" name="phone" id="modal-phone"
                          value={formData.phone} onChange={handleFormChange}
                          className="block w-full rounded-lg border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3.5 text-base hover:bg-slate-100 disabled:opacity-70"
                          disabled={isSubmitting}
                        />
                      </div>
                       <div className="sm:col-span-1">
                        <label htmlFor="modal-cv" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Tải lên CV (PDF, DOC, DOCX, <span className="text-indigo-600 font-medium">tối đa 5MB</span>)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-slate-50 hover:bg-slate-100 disabled:opacity-70 cursor-pointer group relative"> {/* Đã có cursor-pointer */}
                            <input
                                key={formData.cv ? 'file-selected' : 'no-file'}
                                id="modal-cv" name="cv" type="file"
                                onChange={handleFormChange}
                                accept=".pdf,.doc,.docx,.PDF,.DOC,.DOCX"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" // Đã có cursor-pointer
                                disabled={isSubmitting}
                            />
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                {formData.cv ? (
                                    <p className="text-sm text-indigo-600 font-semibold">{formData.cv.name}</p>
                                ) : (
                                    <div className="flex text-sm text-gray-600 group-hover:text-indigo-500 transition-colors">
                                        <p className="pl-1">Nhấp để chọn hoặc kéo thả file</p>
                                    </div>
                                )}
                                {!formData.cv && <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5MB)</p>}
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label htmlFor="modal-message" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Lời nhắn (Vị trí ứng tuyển)
                      </label>
                      <textarea
                        name="message" id="modal-message" rows="4"
                        value={formData.message} onChange={handleFormChange}
                        className="block w-full rounded-lg border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3.5 text-base hover:bg-slate-100 disabled:opacity-70"
                        placeholder="Ví dụ: Ứng tuyển vị trí ABC, mong muốn được đóng góp..."
                        disabled={isSubmitting}
                      ></textarea>
                    </div>
                    <p className="text-xs text-gray-500 mt-5">
                      <span className="text-red-500">*</span> là các trường bắt buộc.
                    </p>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
                      <button
                        type="button"
                        className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 cursor-pointer" // Thêm cursor-pointer
                        onClick={closeModal}
                        disabled={isSubmitting}
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className={`w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent px-6 py-2.5 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                                      ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 cursor-pointer'}`} // Thêm cursor-pointer khi không submitting
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send size={18} className="mr-2"/>}
                        {isSubmitting ? 'Đang gửi...' : 'Gửi hồ sơ'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RecruitmentPage;
