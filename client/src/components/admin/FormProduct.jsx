import React, { useEffect, useState, useMemo, useCallback } from 'react'
import useEcomStore from '../../store/ecom-store'
import { createProduct, deleteProduct } from '../../api/product'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pencil, Trash, Search } from "lucide-react";
import Uploadfile from './Uploadfiles'
import debounce from 'lodash/debounce';
import { useParams, useNavigate } from 'react-router-dom'
import { numberFormat } from '../../utils/Number'
import { dateTime } from '../../utils/DateTime'

const itemPages = 10

const initialState = {
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: '',
    images: []
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className='flex items-center justify-center gap-2 mt-4 mb-4'>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={20} />
            </button>

            <span className='px-4 py-2'>
                Page {currentPage} From {totalPages}
            </span>

            <button onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    )
}

const searchFields = [
    { id: 'title', label: 'By Name' },
    { id: 'description', label: 'By Description' },
    { id: 'price', label: 'By Price' },
];

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Debounce the search function
    const debouncedSearch = useCallback(
        debounce((term, field, prices) => {
            onSearch({ term, field, prices });
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value, selectedField, priceRange);
    };

    const handleFieldChange = (e) => {
        const value = e.target.value;
        setSelectedField(value);
        debouncedSearch(searchTerm, value, priceRange);
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const newPriceRange = { ...priceRange, [name]: value };
        setPriceRange(newPriceRange);
        debouncedSearch(searchTerm, selectedField, newPriceRange);
    };
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <select
                value={selectedField}
                onChange={handleFieldChange}
                className="border rounded-md px-4 py-2"
            >
                <option value="all">All</option>
                {searchFields.map(field => (
                    <option key={field.id} value={field.id}>
                        {field.label}
                    </option>
                ))}
            </select>

            <div className="flex gap-2 items-center">
                <input
                    type="number"
                    name="min"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    className="w-24 border rounded-md px-2 py-2"
                />
                <span>-</span>
                <input
                    type="number"
                    name="max"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    className="w-24 border rounded-md px-2 py-2"
                />
            </div>
        </div>
    );
};

const FormProduct = () => {
    const { id } = useParams()
    const {
        token,
        getCategory,
        categories,
        getProduct,
        products,
    } = useEcomStore()

    const [currentPage, setCurrentPage] = useState(1);

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: 0 ,
        quantity: 0,
        categoryId: '',
        images: []
    });

    const [searchParams, setSearchParams] = useState({
        term: '',
        field: 'all',
        prices: { min: '', max: '' }
    });
    //console.log(products)

    useEffect(() => {
        getCategory()
        getProduct(120)
    }, [])
    // useEffect(() => {
    //     getCategory(token)
    //     getProduct(token, 120)
    // }, [getCategory, getProduct, token])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchParams]);

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev, [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await createProduct(token, form)
            console.log(res)
            toast.success(`Add Product ${res.data.title} complete!!`)
            setForm(initialState)
            getProduct(120)

        } catch (err) {
            toast.error('Add product failed!')
            console.log(err)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await deleteProduct(token, id);
                console.log(res)
                setForm(initialState)
                getProduct(120);
                toast.success('Product has been deleted!');
            } catch (err) {
                toast.error('Delete failed!');
                console.log(err);
            }
        }
    };
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Check if the product matches the search term
            const matchesTerm = searchParams.term === '' || (
                searchParams.field === 'all' ? (
                    product.title.toLowerCase().includes(searchParams.term.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchParams.term.toLowerCase())
                ) : (
                    String(product[searchParams.field])
                        .toLowerCase()
                        .includes(searchParams.term.toLowerCase())
                )
            );

            // Check if the product price is within the specified range
            const { min, max } = searchParams.prices;
            const matchesPrice = (
                (min === '' || product.price >= Number(min)) &&
                (max === '' || product.price <= Number(max))
            );

            return matchesTerm && matchesPrice;
        });
    }, [products, searchParams]);

    const totalPages = Math.ceil(filteredProducts.length / itemPages)
    const startIndex = (currentPage - 1) * itemPages
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemPages)

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }


    const handleSearch = (searchConfig) => {
        setSearchParams(searchConfig);
    };

    return (
        <div className='container mx-auto p-4 bg-white shadow-md'>
            <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <h1 className='text-2xl font-bold mb-4'>Add Product</h1>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <input
                            className='border'
                            value={form.title}
                            onChange={handleOnChange}
                            placeholder='Title'
                            name='title'
                        />
                        <input
                            className='border'
                            value={form.description}
                            onChange={handleOnChange}
                            placeholder='Description'
                            name='description'
                        />
                        <input
                            type='number'
                            className='border'
                            value={form.price}
                            onChange={handleOnChange}
                            placeholder='Price'
                            name='price'
                        />
                        <input
                            type='number'
                            className='border'
                            value={form.quantity}
                            onChange={handleOnChange}
                            placeholder='Quantity'
                            name='quantity'
                        />
                        <select
                            className='border'
                            name='categoryId'
                            onChange={handleOnChange}
                            required
                            value={form.categoryId}
                        >
                            <option value="" disabled>Please Select</option>

                            {categories.map((item, index) =>
                                <option
                                    key={index} value={item.id}>{item.name}
                                </option>)}

                        </select>
                    </div>
                    <hr />
                    {/* Up load file */}
                    <Uploadfile form={form} setForm={setForm} />

                    <button
                        className='bg-blue-500 rounded-md text-white p-1 m-1 mt-2'>
                        Add Product
                    </button>
                </form>

            </div>

            <div className='bg-white shadow-md rounded-lg overflow-hidden'>
                <div className='p-4 border-b'>
                    <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                        <h2 className='text-xl font-semibold'>Products List</h2>
                        <SearchBar onSearch={handleSearch} />
                        <div className='flex gap-2 items-center'></div>
                        <span className='text-gray-500'>
                            Show {startIndex + 1}-{Math.min(startIndex + itemPages, filteredProducts.length)}
                            From {filteredProducts.length} list
                        </span>
                    </div>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className="min-w-full bg-white" id="project-table">
                    <thead className='bg-gray-50'>
                        <tr className="text-left text-gray-600 bg-gray-100 uppercase text-sm leading-normal">
                            <th className="py-3 px-6">No.</th>
                            <th className="py-3 px-6">picture</th>
                            <th className="py-3 px-6">Product</th>
                            <th className="py-3 px-6">Description</th>
                            <th className="py-3 px-6">Price</th>
                            <th className="py-3 px-6">Quantity</th>
                            <th className="py-3 px-6">Sold</th>
                            <th className="py-3 px-6">Updated on</th>
                            <th className="py-3 px-6">Actions</th>
                        </tr>
                    </thead>


                    {/* //ใส่รูป */}
                    <tbody className="text-gray-700 text-sm">
                        {paginatedProducts.map((item, index) => (
                            <tr key={item.id} className='border-b hover:bg-gray-50'>
                                <td className='p-4'>{startIndex + index + 1}</td>
                                <td className='p-4'>
                                    {item.images?.length > 0 ? (
                                        <img
                                            className="w-24 h-24 rounded-lg shadow-md object-cover"
                                            src={item.images[0].url}
                                            alt={item.title}
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center shadow-sm">
                                            No Image
                                        </div>
                                    )}
                                </td>

                                <td className='p-4'>{item.title}</td>
                                <td className='p-4'>{item.description}</td>
                                <td className='p-4'>{numberFormat (item.price)} THB.</td>
                                <td className='p-4'>{item.quantity}</td>
                                <td className='p-4'>{item.sold || 0}</td>
                                <td className='p-4'>{dateTime(item.updatedAt)}
                                    {/* {new Date(item.updatedAt).toLocaleDateString('th-TH')} */}
                                </td>
                                <td className='p-4'>
                                    <div className='flex gap-2'>
                                        <Link
                                            to={`/admin/product/${item.id}`}
                                            className='p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors'
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className='p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>

    );
};


export default FormProduct;