import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../api/axios";


// ======================================================
// CONFIG
// ======================================================

const CUSTOMER_API = "/customer";
const PRODUCT_API = "/consignment-items";
const SALE_API = "/sale";


// ======================================================
// CONSTANTS
// ======================================================

const EMPTY_NEW_CUSTOMER = {
    firstName: "",
    lastName: "",
    phone: "",
    address: ""
};


// ======================================================
// HELPERS
// ======================================================

function getCustomerName(customer) {

    return (
        customer?.name ||
        [
            customer?.firstName,
            customer?.lastName
        ]
            .filter(Boolean)
            .join(" ")
            .trim()
    );

}


function isWalkinCustomer(customer) {

    const name =
        String(
            getCustomerName(customer) || ""
        )
            .trim()
            .toLowerCase();

    return name === "walkin customer";

}


function getPhoneDigits(value) {

    return String(value || "")
        .replace(/[^\d]/g, "");

}


function normalizePhone(value) {

    const digits =
        getPhoneDigits(value);

    if (digits.length === 10) {

        return (
            digits.slice(0, 3) +
            "-" +
            digits.slice(3, 6) +
            "-" +
            digits.slice(6)
        );

    }

    return String(value || "").trim();

}


function isValidPhone(value) {

    if (!value) {
        return true;
    }

    const digits =
        getPhoneDigits(value);

    return /^0\d{8,9}$/.test(digits);

}


function extractCustomers(response) {

    const data =
        response?.data;

    const candidates = [

        data?.customers,

        data?.customer,

        data?.data,

        data

    ];

    for (const candidate of candidates) {

        if (Array.isArray(candidate)) {
            return candidate;
        }

    }

    return [];

}


function extractCustomer(response) {

    return (
        response?.data?.customer ||
        response?.data?.data ||
        null
    );

}


function extractProducts(response) {

    return Array.isArray(
        response?.data?.items
    )
        ? response.data.items
        : [];

}


// ======================================================
// COMPONENT
// ======================================================

export default function CreateSale() {


    // ==================================================
    // PRODUCTS
    // ==================================================

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        cart,
        setCart
    ] = useState([]);


    // ==================================================
    // CUSTOMERS
    // ==================================================

    const [
        customers,
        setCustomers
    ] = useState([]);


    const [
        customerMode,
        setCustomerMode
    ] = useState("existing");


    const [
        selectedCustomerId,
        setSelectedCustomerId
    ] = useState("");


    const [
        customerSearch,
        setCustomerSearch
    ] = useState("");


    const [
        newCustomer,
        setNewCustomer
    ] = useState({
        ...EMPTY_NEW_CUSTOMER
    });


    const [
        customerLoading,
        setCustomerLoading
    ] = useState(false);


    // ==================================================
    // SALE
    // ==================================================

    const [
        shippingCost,
        setShippingCost
    ] = useState(0);


    const [
        discount,
        setDiscount
    ] = useState(0);


    const [
        note,
        setNote
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    // ==================================================
    // ERROR
    // ==================================================

    const [
        customerError,
        setCustomerError
    ] = useState("");


    const [
        productError,
        setProductError
    ] = useState("");


    // ==================================================
    // LOAD INITIAL DATA
    // ==================================================

    useEffect(() => {

        loadProducts();
        loadCustomers();

    }, []);


    // ==================================================
    // LOAD PRODUCTS
    // ==================================================

    async function loadProducts() {

        try {

            setProductError("");

            const response =
                await api.get(
                    PRODUCT_API
                );


            const list =
                extractProducts(
                    response
                );


            const available =
                list.filter(
                    item =>
                        item.status ===
                        "AVAILABLE"
                );


            setProducts(
                available
            );

        } catch (err) {

            console.error(
                "Load Products Error:",
                err
            );


            setProductError(
                err.response?.data?.message ||
                "ไม่สามารถโหลดสินค้าได้"
            );

        }

    }


    // ==================================================
    // LOAD CUSTOMERS
    // ==================================================

    async function loadCustomers() {

        try {

            setCustomerLoading(true);

            setCustomerError("");


            const response =
                await api.get(
                    CUSTOMER_API
                );


            const list =
                extractCustomers(
                    response
                );


            // ------------------------------------------
            // ไม่แสดง Walkin Customer
            // ------------------------------------------

            const realCustomers =
                list.filter(
                    customer =>
                        customer &&
                        !isWalkinCustomer(
                            customer
                        )
                );


            setCustomers(
                realCustomers
            );

        } catch (err) {

            console.error(
                "Load Customers Error:",
                err
            );


            setCustomerError(
                err.response?.data?.message ||
                "ไม่สามารถโหลดข้อมูลลูกค้าได้"
            );

        } finally {

            setCustomerLoading(false);

        }

    }


    // ==================================================
    // FILTER CUSTOMER
    // ==================================================

    const filteredCustomers =
        useMemo(() => {

            const keyword =
                String(
                    customerSearch || ""
                )
                    .trim()
                    .toLowerCase();


            // ------------------------------------------
            // ไม่มี keyword
            // ------------------------------------------

            if (!keyword) {

                return customers.filter(
                    customer =>
                        customer &&
                        !isWalkinCustomer(
                            customer
                        )
                );

            }


            // ------------------------------------------
            // Search Customer
            // ------------------------------------------

            return customers.filter(
                customer => {

                    // Safety:
                    // ห้าม Walkin Customer แสดง
                    if (
                        !customer ||
                        isWalkinCustomer(
                            customer
                        )
                    ) {

                        return false;

                    }


                    const name =
                        String(
                            getCustomerName(
                                customer
                            ) || ""
                        )
                            .toLowerCase();


                    const phone =
                        String(
                            customer.phone || ""
                        )
                            .toLowerCase();


                    const code =
                        String(
                            customer.customerCode ||
                            customer.code ||
                            customer.id ||
                            ""
                        )
                            .toLowerCase();


                    const address =
                        String(
                            customer.address || ""
                        )
                            .toLowerCase();


                    return (

                        name.includes(
                            keyword
                        ) ||

                        phone.includes(
                            keyword
                        ) ||

                        code.includes(
                            keyword
                        ) ||

                        address.includes(
                            keyword
                        )

                    );

                }
            );

        }, [
            customers,
            customerSearch
        ]);


    // ==================================================
    // ADD PRODUCT
    // ==================================================

    function addProduct(product) {

        const exists =
            cart.find(
                item =>
                    item.consignmentItemId ===
                    product.id
            );


        if (exists) {

            return;

        }


        setCart(
            prev => [

                ...prev,

                {

                    consignmentItemId:
                        product.id,

                    name:
                        product.name,

                    costPrice:
                        Number(
                            product.costPrice
                        ),

                    salePrice:
                        Number(
                            product.costPrice
                        )

                }

            ]
        );

    }


    // ==================================================
    // UPDATE PRICE
    // ==================================================

    function updatePrice(
        id,
        value
    ) {

        setCart(
            prev =>
                prev.map(
                    item =>
                        item.consignmentItemId ===
                        id
                            ? {

                                ...item,

                                salePrice:
                                    Number(
                                        value
                                    )

                            }
                            : item
                )
        );

    }


    // ==================================================
    // REMOVE ITEM
    // ==================================================

    function removeItem(id) {

        setCart(
            prev =>
                prev.filter(
                    item =>
                        item.consignmentItemId !==
                        id
                )
        );

    }


    // ==================================================
    // CUSTOMER FORM CHANGE
    // ==================================================

    function handleCustomerChange(e) {

        const {
            name,
            value
        } = e.target;


        setNewCustomer(
            prev => ({

                ...prev,

                [name]:
                    value

            })
        );

    }


    // ==================================================
    // SELECT EXISTING CUSTOMER
    // ==================================================

    function selectCustomer(id) {

        setSelectedCustomerId(
            String(id)
        );

    }


    // ==================================================
    // CHANGE CUSTOMER MODE
    // ==================================================

    function changeCustomerMode(mode) {

        setCustomerMode(
            mode
        );


        setCustomerError("");


        if (mode === "existing") {

            setNewCustomer({
                ...EMPTY_NEW_CUSTOMER
            });

        } else {

            setSelectedCustomerId("");

        }

    }


    // ==================================================
    // TOTALS
    // ==================================================

    const subtotal =
        cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.salePrice || 0
                ),
            0
        );


    const total =
        Math.max(
            0,
            subtotal +
            Number(
                shippingCost || 0
            ) -
            Number(
                discount || 0
            )
        );


    // ==================================================
    // CREATE NEW CUSTOMER
    // ==================================================

    async function createNewCustomer() {

        const firstName =
            String(
                newCustomer.firstName || ""
            ).trim();


        const lastName =
            String(
                newCustomer.lastName || ""
            ).trim();


        const fullName =
            [
                firstName,
                lastName
            ]
                .filter(Boolean)
                .join(" ")
                .trim();


        const address =
            String(
                newCustomer.address || ""
            ).trim();


        if (!fullName) {

            throw new Error(
                "กรุณากรอกชื่อและนามสกุลลูกค้า"
            );

        }


        if (
            newCustomer.phone &&
            !isValidPhone(
                newCustomer.phone
            )
        ) {

            throw new Error(
                "รูปแบบเบอร์โทรลูกค้าไม่ถูกต้อง"
            );

        }


        if (!address) {

            throw new Error(
                "กรุณากรอกที่อยู่ลูกค้า"
            );

        }


        const payload = {

            name:
                fullName,

            phone:
                normalizePhone(
                    newCustomer.phone
                ) || null,

            address

        };


        const response =
            await api.post(
                CUSTOMER_API,
                payload
            );


        const customer =
            extractCustomer(
                response
            );


        if (!customer?.id) {

            throw new Error(
                "สร้างลูกค้าใหม่สำเร็จ แต่ไม่พบรหัสลูกค้า"
            );

        }


        return customer;

    }


    // ==================================================
    // VALIDATE CUSTOMER
    // ==================================================

    function validateCustomer() {

        setCustomerError("");


        if (
            customerMode ===
            "existing"
        ) {

            if (!selectedCustomerId) {

                setCustomerError(
                    "กรุณาเลือกลูกค้าเดิม"
                );

                return false;

            }

            return true;

        }


        const firstName =
            String(
                newCustomer.firstName || ""
            ).trim();


        const lastName =
            String(
                newCustomer.lastName || ""
            ).trim();


        const address =
            String(
                newCustomer.address || ""
            ).trim();


        if (!firstName && !lastName) {

            setCustomerError(
                "กรุณากรอกชื่อลูกค้า"
            );

            return false;

        }


        if (
            newCustomer.phone &&
            !isValidPhone(
                newCustomer.phone
            )
        ) {

            setCustomerError(
                "รูปแบบเบอร์โทรไม่ถูกต้อง"
            );

            return false;

        }


        if (!address) {

            setCustomerError(
                "กรุณากรอกที่อยู่ลูกค้า"
            );

            return false;

        }


        return true;

    }


    // ==================================================
    // SUBMIT SALE
    // ==================================================

    async function submitSale() {

        // ----------------------------------------------
        // PRODUCT VALIDATION
        // ----------------------------------------------

        if (cart.length === 0) {

            alert(
                "กรุณาเลือกสินค้า"
            );

            return;

        }


        // ----------------------------------------------
        // CUSTOMER VALIDATION
        // ----------------------------------------------

        if (!validateCustomer()) {

            return;

        }


        try {

            setLoading(true);

            setCustomerError("");


            let customerId =
                null;


            // ------------------------------------------
            // EXISTING CUSTOMER
            // ------------------------------------------

            if (
                customerMode ===
                "existing"
            ) {

                customerId =
                    Number(
                        selectedCustomerId
                    );

            }


            // ------------------------------------------
            // NEW CUSTOMER
            // ------------------------------------------

            if (
                customerMode ===
                "new"
            ) {

                const createdCustomer =
                    await createNewCustomer();


                customerId =
                    createdCustomer.id;

            }


            // ------------------------------------------
            // SALE BODY
            // ------------------------------------------

            const body = {

                customerId,

                items:
                    cart.map(
                        item => ({

                            consignmentItemId:
                                item.consignmentItemId,

                            costPrice:
                                Number(
                                    item.costPrice
                                ),

                            salePrice:
                                Number(
                                    item.salePrice
                                )

                        })
                    ),

                shippingCost:
                    Number(
                        shippingCost || 0
                    ),

                discount:
                    Number(
                        discount || 0
                    ),

                note:
                    String(
                        note || ""
                    ).trim()

            };


            const response =
                await api.post(
                    SALE_API,
                    body
                );


            const saleId =
                response?.data?.sale?.id;


            alert(
                saleId
                    ? `ขายสำเร็จ Sale ID : ${saleId}`
                    : "ขายสำเร็จ"
            );


            // ------------------------------------------
            // RESET
            // ------------------------------------------

            setCart([]);

            setNote("");

            setShippingCost(0);

            setDiscount(0);

            setSelectedCustomerId("");

            setCustomerSearch("");

            setCustomerMode(
                "existing"
            );

            setNewCustomer({
                ...EMPTY_NEW_CUSTOMER
            });


            await loadProducts();

            await loadCustomers();


        } catch (err) {

            console.error(
                "Submit Sale Error:",
                err
            );


            const message =
                err.response?.data?.message ||
                err.message ||
                "เกิดข้อผิดพลาด";


            alert(
                message
            );

        } finally {

            setLoading(false);

        }

    }


    // ==================================================
    // SELECTED CUSTOMER
    // ==================================================

    const selectedCustomer =
        customers.find(
            customer =>
                String(
                    customer.id
                ) ===
                String(
                    selectedCustomerId
                )
        );


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="p-3 sm:p-6 max-w-7xl mx-auto">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-5">

                <h1 className="text-2xl font-bold">

                    สร้างรายการขาย

                </h1>

                <p className="text-gray-500 mt-1">

                    เลือกลูกค้า สินค้า และรายละเอียดการขาย

                </p>

            </div>


            {/* ==================================================
                CUSTOMER
            ================================================== */}

            <section className="border rounded-xl p-4 sm:p-5 mb-5 bg-white">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                    <div>

                        <h2 className="font-bold text-lg">

                            ลูกค้า

                        </h2>

                        <p className="text-sm text-gray-500">

                            เลือกลูกค้าเดิม หรือเพิ่มลูกค้าใหม่

                        </p>

                    </div>


                    <div className="flex gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                changeCustomerMode(
                                    "existing"
                                )
                            }
                            className={
                                customerMode ===
                                "existing"
                                    ? "px-4 py-2 rounded-lg bg-blue-600 text-white"
                                    : "px-4 py-2 rounded-lg border"
                            }
                        >

                            ลูกค้าเดิม

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                changeCustomerMode(
                                    "new"
                                )
                            }
                            className={
                                customerMode ===
                                "new"
                                    ? "px-4 py-2 rounded-lg bg-green-600 text-white"
                                    : "px-4 py-2 rounded-lg border"
                            }
                        >

                            ลูกค้าใหม่

                        </button>

                    </div>

                </div>


                {/* ==================================================
                    EXISTING CUSTOMER
                ================================================== */}

                {customerMode ===
                    "existing" && (

                    <div>

                        <div className="mb-3">

                            <input
                                type="text"
                                value={
                                    customerSearch
                                }
                                onChange={e =>
                                    setCustomerSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="ค้นหาชื่อ เบอร์โทร หรือรหัสลูกค้า..."
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>


                        {customerLoading ? (

                            <div className="text-gray-500 py-3">

                                กำลังโหลดลูกค้า...

                            </div>

                        ) : filteredCustomers.length === 0 ? (

                            <div className="border rounded-lg p-4 text-gray-500">

                                ไม่พบลูกค้า

                            </div>

                        ) : (

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto">

                                {filteredCustomers.map(
                                    customer => {

                                        const name =
                                            getCustomerName(
                                                customer
                                            ) ||
                                            "-";


                                        const code =
                                            customer.customerCode ||
                                            customer.code ||
                                            (
                                                customer.id
                                                    ? `CUS-${String(
                                                        customer.id
                                                    ).padStart(
                                                        5,
                                                        "0"
                                                    )}`
                                                    : "-"
                                            );


                                        const selected =
                                            String(
                                                selectedCustomerId
                                            ) ===
                                            String(
                                                customer.id
                                            );


                                        return (

                                            <button
                                                type="button"
                                                key={
                                                    customer.id
                                                }
                                                onClick={() =>
                                                    selectCustomer(
                                                        customer.id
                                                    )
                                                }
                                                className={
                                                    selected
                                                        ? "text-left border-2 border-blue-500 bg-blue-50 rounded-lg p-3"
                                                        : "text-left border rounded-lg p-3 hover:bg-gray-50"
                                                }
                                            >

                                                <div className="font-semibold">

                                                    {name}

                                                </div>


                                                <div className="text-sm text-gray-500 mt-1">

                                                    {code}

                                                </div>


                                                {customer.phone && (

                                                    <div className="text-sm text-gray-500">

                                                        {customer.phone}

                                                    </div>

                                                )}

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        )}


                        {selectedCustomer && (

                            <div className="mt-4 border rounded-lg bg-blue-50 p-3">

                                <div className="font-semibold">

                                    ลูกค้าที่เลือก:
                                    {" "}
                                    {
                                        getCustomerName(
                                            selectedCustomer
                                        )
                                    }

                                </div>


                                {selectedCustomer.phone && (

                                    <div className="text-sm text-gray-600">

                                        โทร:
                                        {" "}
                                        {
                                            selectedCustomer.phone
                                        }

                                    </div>

                                )}


                                {selectedCustomer.address && (

                                    <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">

                                        ที่อยู่:
                                        {" "}
                                        {
                                            selectedCustomer.address
                                        }

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                )}


                {/* ==================================================
                    NEW CUSTOMER
                ================================================== */}

                {customerMode ===
                    "new" && (

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>

                            <label className="block font-medium mb-1">

                                ชื่อ

                            </label>

                            <input
                                name="firstName"
                                value={
                                    newCustomer.firstName
                                }
                                onChange={
                                    handleCustomerChange
                                }
                                placeholder="เช่น อริสสา"
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>


                        <div>

                            <label className="block font-medium mb-1">

                                นามสกุล

                            </label>

                            <input
                                name="lastName"
                                value={
                                    newCustomer.lastName
                                }
                                onChange={
                                    handleCustomerChange
                                }
                                placeholder="เช่น สุขชม"
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>


                        <div className="sm:col-span-2">

                            <label className="block font-medium mb-1">

                                เบอร์โทร

                                <span className="text-gray-400 ml-1">

                                    (ถ้ามี)

                                </span>

                            </label>

                            <input
                                name="phone"
                                value={
                                    newCustomer.phone
                                }
                                onChange={
                                    handleCustomerChange
                                }
                                placeholder="เช่น 0824460808"
                                inputMode="tel"
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>


                        {/* ==================================================
                            ADDRESS
                        ================================================== */}

                        <div className="sm:col-span-2">

                            <label className="block font-medium mb-1">

                                ที่อยู่

                                <span className="text-red-500 ml-1">

                                    *

                                </span>

                            </label>


                            <textarea
                                name="address"
                                value={
                                    newCustomer.address
                                }
                                onChange={
                                    handleCustomerChange
                                }
                                placeholder={
                                    "บ้านเลขที่ หมู่บ้าน ถนน\nตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                                }
                                rows={6}
                                className="w-full border rounded-lg px-3 py-3 resize-y min-h-[150px] leading-6"
                            />


                            <p className="text-xs text-gray-400 mt-1">

                                สามารถกรอกที่อยู่หลายบรรทัดได้

                            </p>

                        </div>

                    </div>

                )}


                {customerError && (

                    <div className="mt-3 text-red-600 text-sm">

                        {customerError}

                    </div>

                )}

            </section>


            {/* ==================================================
                MAIN GRID
            ================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


                {/* ==================================================
                    STOCK
                ================================================== */}

                <section className="border rounded-xl p-4 sm:p-5 bg-white">

                    <div className="flex items-center justify-between mb-3">

                        <h2 className="font-bold text-lg">

                            สินค้าใน Stock

                        </h2>


                        <span className="text-sm text-gray-500">

                            {products.length}
                            {" "}
                            รายการ

                        </span>

                    </div>


                    {productError && (

                        <div className="text-red-600 text-sm mb-3">

                            {productError}

                        </div>

                    )}


                    {products.length === 0 ? (

                        <div className="border rounded-lg p-5 text-center text-gray-500">

                            ไม่มีสินค้าใน Stock

                        </div>

                    ) : (

                        <div className="space-y-2 max-h-[550px] overflow-y-auto">

                            {products.map(
                                product => {

                                    const alreadyAdded =
                                        cart.some(
                                            item =>
                                                item.consignmentItemId ===
                                                product.id
                                        );


                                    return (

                                        <div
                                            key={
                                                product.id
                                            }
                                            className="border rounded-lg p-3"
                                        >

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                                <div>

                                                    <div className="font-semibold">

                                                        {
                                                            product.name
                                                        }

                                                    </div>


                                                    <div className="text-sm text-gray-500">

                                                        ต้นทุน:
                                                        {" "}
                                                        {
                                                            product.costPrice
                                                        }

                                                    </div>

                                                </div>


                                                <button
                                                    type="button"
                                                    disabled={
                                                        alreadyAdded
                                                    }
                                                    className={
                                                        alreadyAdded
                                                            ? "bg-gray-300 text-gray-600 px-4 py-2 rounded-lg"
                                                            : "bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                    }
                                                    onClick={() =>
                                                        addProduct(
                                                            product
                                                        )
                                                    }
                                                >

                                                    {alreadyAdded
                                                        ? "เพิ่มแล้ว"
                                                        : "เพิ่ม"}

                                                </button>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    CART
                ================================================== */}

                <section className="border rounded-xl p-4 sm:p-5 bg-white">

                    <h2 className="font-bold text-lg mb-3">

                        รายการขาย

                    </h2>


                    {cart.length === 0 ? (

                        <div className="border rounded-lg p-5 text-center text-gray-500">

                            ยังไม่มีสินค้าในรายการขาย

                        </div>

                    ) : (

                        <div className="space-y-2">

                            {cart.map(
                                item => (

                                    <div
                                        key={
                                            item.consignmentItemId
                                        }
                                        className="border rounded-lg p-3"
                                    >

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                                            <div className="flex-1">

                                                <div className="font-semibold">

                                                    {
                                                        item.name
                                                    }

                                                </div>


                                                <div className="text-xs text-gray-500">

                                                    ต้นทุน:
                                                    {" "}
                                                    {
                                                        item.costPrice
                                                    }

                                                </div>

                                            </div>


                                            <div className="flex items-center gap-2">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        item.salePrice
                                                    }
                                                    onChange={e =>
                                                        updatePrice(
                                                            item.consignmentItemId,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border rounded-lg p-2 w-full sm:w-28"
                                                />


                                                <button
                                                    type="button"
                                                    className="text-red-500 px-2 py-2"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.consignmentItemId
                                                        )
                                                    }
                                                >

                                                    ลบ

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {/* ==================================================
                        SUMMARY
                    ================================================== */}

                    <div className="mt-5 border-t pt-4 space-y-3">

                        <div className="flex justify-between">

                            <span>
                                สินค้า
                            </span>

                            <strong>
                                {subtotal.toFixed(2)}
                            </strong>

                        </div>


                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                            <span>
                                ค่าขนส่ง
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    shippingCost
                                }
                                onChange={e =>
                                    setShippingCost(
                                        e.target.value
                                    )
                                }
                                className="border rounded-lg p-2 w-full sm:w-32"
                            />

                        </div>


                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                            <span>
                                ส่วนลด
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    discount
                                }
                                onChange={e =>
                                    setDiscount(
                                        e.target.value
                                    )
                                }
                                className="border rounded-lg p-2 w-full sm:w-32"
                            />

                        </div>


                        <div>

                            <label className="block font-medium mb-1">

                                หมายเหตุ

                            </label>

                            <textarea
                                value={
                                    note
                                }
                                onChange={e =>
                                    setNote(
                                        e.target.value
                                    )
                                }
                                placeholder="หมายเหตุเพิ่มเติม"
                                rows={3}
                                className="border rounded-lg p-2 w-full resize-y"
                            />

                        </div>


                        <div className="flex justify-between items-center border-t pt-3">

                            <span className="font-bold">

                                รวมทั้งหมด

                            </span>


                            <span className="text-xl font-bold">

                                {total.toFixed(2)}

                            </span>

                        </div>


                        {/* ==================================================
                            SUBMIT
                        ================================================== */}

                        <button
                            type="button"
                            disabled={
                                loading ||
                                cart.length === 0
                            }
                            onClick={
                                submitSale
                            }
                            className="w-full bg-green-600 disabled:bg-gray-300 text-white font-bold px-5 py-3 rounded-lg mt-2"
                        >

                            {loading
                                ? "กำลังบันทึก..."
                                : "ยืนยันขาย"}

                        </button>

                    </div>

                </section>

            </div>

        </div>

    );

}