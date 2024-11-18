import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const ContentCarousel = () => {
    const [data, setData] = useState([])
    useEffect(() => {
        hdlGetImage()
    }, [])
    const hdlGetImage = () => {
        //https://picsum.photos/v2/list?page=1&limit=15
        axios.get('https://picsum.photos/v2/list?page=1&limit=15')
            .then((res) => {
                setData(res.data)
                //console.log(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }
    return (
        <div>
            <Swiper
                 spaceBetween={30}
                 centeredSlides={true}
                 autoplay={{
                   delay: 2500,
                   disableOnInteraction: false,
                 }}
                
                 modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper h-80 object-cover rounded-md mb-2"
            >
                {
                    data?.map((item, i) =>
                        //ในCall back Fnมีข้อมูลให้ใช้3ตัว (()=>)
                        //ตัวแรกคือElementเป็นข้อมูลในArray(ส่วนใหญ่ตั้งชื่อว่าitem) ตัวที่สองIndex(ส่วนใหญ่ตั้งชื่อว่าindex) ตัวที่สามคือArrayแต่หลักๆจะใช้2ตัว
                        <SwiperSlide key={i} >
                            <img src={item.download_url} />
                        </SwiperSlide>

                    )
                }
            </Swiper>
            <Swiper
                slidesPerView={5}
                spaceBetween={10}
                pagination={true}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                className="mySwiper object-cover rounded-md "
            >

                {
                    data?.map((item, i) =>
                        //ในCall back Fnมีข้อมูลให้ใช้3ตัว (()=>)
                        //ตัวแรกคือElementเป็นข้อมูลในArray(ส่วนใหญ่ตั้งชื่อว่าitem) ตัวที่สองIndex(ส่วนใหญ่ตั้งชื่อว่าindex) ตัวที่สามคือArrayแต่หลักๆจะใช้2ตัว
                        <SwiperSlide key={i}>
                            <img
                            className='rounded-md'
                            src={item.download_url} />
                        </SwiperSlide>

                    )
                }

            </Swiper>
        </div>
    )
}

export default ContentCarousel
