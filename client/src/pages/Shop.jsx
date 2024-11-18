import React, { useState, useEffect } from 'react'
import ProductCard from '../components/Card/ProductCard'
import useEcomStore from '../store/ecom-store'
import SearchCard from '../components/Card/SearchCard'
import Cart from '../components/Card/Cart'

const Shop = () => {
  const getProduct = useEcomStore((state) => state.getProduct)
  const products = useEcomStore((state) => state.products)

  useEffect(() => {
    getProduct()
  }, [])


  return (
    <div className='flex'>



      {/* SearchBar */}
      <div
        className='w-1/4 p-4 bg-gray-100 h-screen'>
        <SearchCard />
      </div >





      {/* Product */}
      <div
        className='w-1/2 p-4 h-screen overflow-y-auto'>
        <p className='font-bold mb-4 text-2xl'> All Product </p>

        <div className='flex flex-wrap gap-5'>
          {/* Product Card */}
          {products.map((item, index) =>
            <ProductCard key={index} item={item} />
          )}
          {/* Product Card */}
        </div>
      </div>

      {/* Cart */}
      <div
        className='w-1/4 p-4 bg-gray-100 h-screen 
        overflow-y-auto'>
        <Cart />
      </div>

    </div>
  )
}

export default Shop
