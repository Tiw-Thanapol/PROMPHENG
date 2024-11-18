import React, { useEffect, useState } from 'react'
import { listProductBy } from '../../api/product'
import ProductCard from '../Card/ProductCard'
import CustomSwiper from '../../utils/CustomSwiper'
import { SwiperSlide } from 'swiper/react'

const BestSeller = () => {
    const [data, setData] = useState([])
    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        listProductBy('sold', 'desc', 12)
            .then((res) => {
                setData(res.data)
                console.log(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }
    console.log(data)
    return (
        <CustomSwiper>
            {
                data?.map((item, index) =>
                    <SwiperSlide>
                        <ProductCard item={item} key={index} />
                    </SwiperSlide>
                )

            }
        </CustomSwiper>
    )
}

export default BestSeller
