import React from 'react'
import ContentCarousel from '../components/home/ContentCarousel'
import BestSeller from '../components/home/BestSeller'
import NewProduct from '../components/home/NewProduct'

const Home = () => {
  return (
    <div>
      <ContentCarousel />
      < p 
      className='text-4xl font-bold text-left my-4 mt-4 border-md rounded-md'>
      Best Seller</p>
      <BestSeller />
      < p 
      className='text-4xl font bold text-left my-4 mt-4 border-md rounded-md'>
      New Product</p>
      <NewProduct />
    </div>
  )
}

export default Home
