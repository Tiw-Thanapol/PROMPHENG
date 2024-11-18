import React, { useEffect, useState } from 'react'
import useEcomStore from '../../store/ecom-store'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { numberFormat } from '../../utils/Number';


const SearchCard = () => {

    const getProduct = useEcomStore((state) => state.getProduct)
    const products = useEcomStore((state) => state.products)
    const actionSearchFilter = useEcomStore((state) => state.actionSearchFilters)

    const getCategory = useEcomStore((state) => state.getCategory)
    const categories = useEcomStore((state) => state.categories)

    const [text, setText] = useState('')
    const [categorySelected, setCategorySelected] = useState([])

    const [price, setPrice] = useState([1000, 30000])
    const [ok, setOk] = useState(false)

    //console.log(categories)
    useEffect(() => {
        getCategory()
    }, [])

    // Step 1 Search by text need Query
    // console.log(text)
    useEffect(() => {
        const delay = setTimeout(() => {
            if (text) {
                actionSearchFilter({ query: text })
            } else {
                getProduct(100)
            }
        }, 300)
        return () => clearTimeout(delay)
    }, [text])

    // Step 2 Search by category need Array
    const handleCheck = (e) => {
        //console.log(e.target.value)
        const inCheck = e.target.value // ค่าที่เราเช็คในเช็คบ็อก
        const inState = [...categorySelected] //[] เป็น arrayว่าง
        const findCheck = inState.indexOf(inCheck) // ถ้าไม่เจอจะreturn -1

        if (findCheck === -1) {
            inState.push(inCheck)
        } else {
            inState.splice(findCheck, 1)
        }
        setCategorySelected(inState)

        actionSearchFilter({ category: inState })
        if (inState.length > 0) {
            actionSearchFilter({ category: inState })
        } else {
            getProduct(100)
        }
    }
    //console.log(categorySelected)

    // Step 3 Search by price need Price
    useEffect(() => {
        actionSearchFilter({price})
    }, [ok])
    const handlePrice = (value) => {
        console.log(value)
        setPrice(value)
        setTimeout(()=>{
            setOk(!ok)
        },300)
    }


    return (
        <div>
            <div>
                <h1 className='text-xl font-bold mb-4' >Search Product</h1>
                {/* Search by text */}
                <input
                    onChange={(e) => setText(e.target.value)}
                    className='border rounded-md w-full mb-4 px-2'
                    placeholder='Search...'
                />
                <hr />

                {/* Search by category */}
                <div>
                    <h1 className='text-xl font-bold mb-4'>Category</h1>
                </div>
                <div>
                    {
                        categories.map((item, index) =>
                            <div className='flex gap-2'>
                                <input
                                    onChange={handleCheck}
                                    type='checkbox'
                                    value={item.id} />
                                <label>{item.name}</label>
                            </div>
                        )
                    }
                </div>
            </div>
            <hr />
            <div>
                <div>
                    <h1 className='text-xl font-bold mb-4'>Search by price</h1>
                    <div>
                        <div className='flex justify-between'>
                            <span>Min:  {numberFormat( price[0])}</span>
                            <span>Max: {numberFormat( price[1])}</span>
                        </div>
                        <Slider
                            onChange={handlePrice}
                            range
                            min={0}
                            max={100000}
                            defaultValue={[1000, 100000]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchCard
