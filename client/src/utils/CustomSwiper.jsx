import React from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const CustomSwiper = ({ children, slidesPerView = 5 }) => {
    return (
        <div>
            <SwiperComponent
                slidesPerView={slidesPerView}
                spaceBetween={10}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                className="mySwiper object-cover rounded-md"
                breakpoints={{
                    // เมื่อหน้าจอแคบกว่า 640px
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                    },
                    // เมื่อหน้าจอกว้างกว่า 640px
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 10,
                    },
                    // เมื่อหน้าจอกว้างกว่า 768px
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 10,
                    },
                    // เมื่อหน้าจอกว้างกว่า 1024px
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 10,
                    },
                    // เมื่อหน้าจอกว้างกว่า 1024px
                    1280: {
                        slidesPerView: 6,
                        spaceBetween: 10,
                    },
                }}
            >
                {children}
            </SwiperComponent>
        </div>
    );
};

export default CustomSwiper;