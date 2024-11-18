import React from 'react'
import { ShoppingCart } from 'lucide-react';
import useEcomStore from '../../store/ecom-store';
import { numberFormat } from '../../utils/Number';
import { motion } from 'framer-motion'
import { AiOutlineShoppingCart } from 'react-icons/ai';


const ProductCard = ({ item }) => {
    if (!item) {
        return <div>Loading...</div>;
    }
    const actionAddtoCart = useEcomStore((state)=>state.actionAddtoCart)
    console.log(item)


    return (
        <motion.div
      className="box"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{duration:0.5}}
    >
        <div className="p-4">
                {/* Product Image */}
                <div className="relative">
                    {item.images && item.images.length > 0
                        ? <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-full h-56 object-cover rounded-lg transform hover:scale-110 transition-transform duration-300"
                        />
                        : <div className="w-full h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-lg">
                            No Image
                        </div>
                    }
                </div>
            <div className='py-2'>
                <p className='text-xl font-bold truncate' >
                    {item.title}
                </p>
                <p className='text-sm text-gray-500'>
                    {item.description}
                </p>
            </div>

            <div>
                <div className='flex justify-between items-center'>
                    <span className='text-sm font-bold'>{numberFormat(item.price)}</span>
                    <div>
                    <button 
                    onClick={()=>actionAddtoCart(item)}
                    className="flex rounded items-center bg-pink text-white m px-4 py-2 cursor-pointer 
                hover:bg-accent"
                        ><div><AiOutlineShoppingCart /></div>
                         Add To Cart
                    </button>
                    </div>

                </div>
            </div>

        </div>
        </motion.div>
    )
}

export default ProductCard


// import React from 'react'
// import { motion } from 'framer-motion'
// import { AiOutlineShoppingCart } from 'react-icons/ai';
// import useEcomStore from '../../store/ecom-store';
// import { numberFormat } from '../../utils/Number';

// const ProductCard = ({ item }) => {
//     if (!item) {
//         return <div>Loading...</div>;
//     }

//     const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);

//     return (
//         <motion.div
//             className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out"
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//         >
//             <div className="p-4">
//                 {/* Product Image */}
//                 <div className="relative">
//                     {item.images && item.images.length > 0
//                         ? <img
//                             src={item.images[0].url}
//                             alt={item.title}
//                             className="w-full h-56 object-cover rounded-lg transform hover:scale-110 transition-transform duration-300"
//                         />
//                         : <div className="w-full h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-lg">
//                             No Image
//                         </div>
//                     }
//                 </div>

//                 {/* Product Title and Description */}
//                 <div className="mt-4">
//                     <h3 className="text-lg font-semibold text-gray-800 truncate">{item.title}</h3>
//                     <p className="text-sm text-gray-500 mt-1">{item.description}</p>
//                 </div>

//                 {/* Price and Add to Cart Button */}
//                 <div className="mt-4 flex justify-between items-center">
//                     <span className="text-xl font-semibold text-pink-600">{numberFormat(item.price)}</span>
//                     {/* เพิ่มปุ่ม Add to Cart */}
//                     <button
//                         onClick={() => {
//                             console.log("Adding to cart:", item); // สำหรับการดีบัก
//                             actionAddtoCart(item);
//                         }}
//                         className="flex items-center bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300"
//                     >
//                         <AiOutlineShoppingCart className="mr-2" /> Add to Cart
//                     </button>
//                 </div>
//             </div>
//         </motion.div>
//     );
// };

// export default ProductCard;
