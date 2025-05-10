import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // check if link is active
  const getLinkClass = (path) => (
    location.pathname === path ? "text-blue-700 font-bold" : "text-bg-blue-700 hover:text-[#062059]"
  );

  return (
    <>
      <nav
        className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 
          ${isScrolled && !isOpen ? "w-16 h-16 rounded-full bg-blue-700 shadow-lg flex items-center justify-center" : "w-[95%] md:w-[80%] bg-white/95 shadow-md rounded-lg"}`}
      >
        {!isScrolled || isOpen ? (
          <div className="container mx-auto flex items-center justify-between py-4 px-6">
            <Link to="/" className="text-2xl font-bold text-logo-gradient">
              PICONS
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className={getLinkClass("/")}>Trang Chủ</Link>
              <Link to='/chung-toi' className={getLinkClass("/chung-toi")}>Chúng Tôi</Link>

              <Link to='/tin-tuc' className={getLinkClass("/tin-tuc")}>Tin Tức</Link>
              <Link to='/du-an' className={getLinkClass("/du-an")}>Dự Án</Link>
              <Link to='/lien-he' className={getLinkClass("/lien-he")}>Liên Hệ</Link>
              <Link to='/tuyen-dung' className={getLinkClass("/tuyen-dung")}>Tuyển Dụng</Link>
            </div>
            <div className="">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} className=" md:hidden" />}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-white/95 hover:bg-gray-200 shadow-lg flex items-center justify-center absolute"
          >
            <Menu size={24}/>
          </button>
        )}
      </nav>
      {isOpen && (
        <div className="fixed top-[90px] left-1/2 transform -translate-x-1/2 w-[95%] md:w-[80%] bg-white/95 z-50 shadow-md rounded-2xl flex flex-col items-center space-y-4 py-4 transition-all duration-300 md:hidden">
          <Link to="/" className={getLinkClass("/")} onClick={() => setIsOpen(false)}>Trang Chủ</Link>
          <Link to='/chung-toi' className={getLinkClass("/chung-toi")} onClick={() => setIsOpen(false)}>Chúng Tôi</Link>

          <Link to='/tin-tuc' className={getLinkClass("/tin-tuc")} onClick={() => setIsOpen(false)}>Tin Tức</Link>
          <Link to='/du-an' className={getLinkClass("/du-an")} onClick={() => setIsOpen(false)}>Dự Án</Link>
          <Link to='/lien-he' className={getLinkClass("/lien-he")} onClick={() => setIsOpen(false)}>Liên hệ</Link>
          <Link to='/tuyen-dung' className={getLinkClass("/tuyen-dung")} onClick={() => setIsOpen(false)}>Tuyển dụng</Link>
        </div>
      )}
    </>
  );
};

export default Navbar;

