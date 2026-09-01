import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Users,
    UserRound,
    Phone,
    MapPin,
    Search,
    Plus,
    X,
    Sparkles,
    Pencil,
    Trash2,
    Hash,
    Upload,
    UserPlus,
    ClipboardList,
    Check,
    AlertCircle
} from "lucide-react";

import api from "../api/axios";

import "../styles/Customers.css";


// ======================================================
// CONFIG
// ======================================================

const CUSTOMER_API = "/customer";


// ======================================================
// CONSTANTS
// ======================================================

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    phone: "",
    address: ""
};


// ======================================================
// DATE
// ======================================================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "th-TH",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Asia/Bangkok"
        }
    );
}


// ======================================================
// PHONE
// ======================================================

function getPhoneDigits(value) {

    return String(value || "")
        .replace(/[^\d]/g, "");
}


function normalizePhone(value) {

    const digits = getPhoneDigits(value);

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


function looksLikePhone(value) {

    const digits = getPhoneDigits(value);

    return /^0\d{8,9}$/.test(digits);
}


// ======================================================
// TEXT CLEANUP
// ======================================================

function cleanPastedText(value) {

    return String(value || "")
        .replace(
            /\[([^\]]*)\]\(https?:\/\/[^)]+\)/g,
            "$1"
        )
        .replace(
            /\[([^\]]+)\]\([^)]+\)/g,
            "$1"
        )
        .replace(/\uFE0F/g, "")
        .replace(/\r/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


// ======================================================
// PHONE EXTRACTION
// ======================================================

function extractPhone(text) {

    const source = String(text || "");

    const patterns = [

        /\[\s*(0[\d\s-]{8,12})\s*\]/i,

        /\(\s*(0[\d\s-]{8,12})\s*\)/i,

        /(?:เบอร์โทร|เบอร์|โทร|tel|t)\.?\s*:?\s*(0[\d\s-]{8,12})/i,

        /(?<!\d)(0\d{8,9})(?!\d)/

    ];


    for (const pattern of patterns) {

        const match = source.match(pattern);

        if (!match) {
            continue;
        }

        const candidate =
            match[1] || match[0];

        if (!looksLikePhone(candidate)) {
            continue;
        }

        return {

            phone:
                normalizePhone(candidate),

            text:
                source
                    .replace(match[0], " ")
                    .replace(/\s+/g, " ")
                    .trim()

        };

    }


    return {

        phone: "",

        text: source

    };

}


// ======================================================
// ADDRESS
// ======================================================

const ADDRESS_START_RE =
    /(?:บ้านเลขที่|เลขที่|มบ\.?|หมู่บ้าน|หมู่ที่|หมู่\s+|คอนโด(?:มิเนียม)?|เดอะ|The|โครงการ|อาคาร|ตึก|เพลส|บ้านพัก|\d{1,5}\/\d+|\d{1,4}\s+(?:ม\.|มู่|หมู่|ซอย|ถนน|ต\.|อ\.|จ\.))/i;


function findAddressStart(text) {

    const match =
        String(text || "").match(
            ADDRESS_START_RE
        );

    if (!match) {
        return -1;
    }

    return match.index ?? -1;
}


// ======================================================
// NAME
// ======================================================

function cleanName(value) {

    let name =
        String(value || "").trim();


    name =
        name
            .replace(
                /^(นางสาว|น\.ส\.|นาย|นาง|คุณ|K\.|คุณหญิง|Mr\.?|Mrs\.?|Miss|Ms\.?)\s*/i,
                ""
            )
            .trim();


    name =
        name
            .replace(
                /^(จัดส่ง|ส่ง|วิน)\s*/i,
                ""
            )
            .trim();


    return name;

}


function splitName(fullName) {

    const cleaned =
        cleanName(fullName);

    const parts =
        cleaned
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length <= 1) {

        return {

            firstName:
                parts[0] || "",

            lastName:
                ""

        };

    }


    return {

        firstName:
            parts[0],

        lastName:
            parts
                .slice(1)
                .join(" ")

    };

}


// ======================================================
// BULK CUSTOMER PARSER
// ======================================================

function extractCustomerFromBlock(rawBlock) {

    let block =
        cleanPastedText(rawBlock);


    block =
        block
            .replace(/^#+/g, "")
            .replace(/^[-–—_]+/g, "")
            .trim();


    if (!block) {
        return null;
    }


    // --------------------------------------------------
    // PHONE
    // --------------------------------------------------

    const phoneResult =
        extractPhone(block);


    let phone =
        phoneResult.phone;


    let working =
        phoneResult.text;


    // --------------------------------------------------
    // REMOVE ##
    // --------------------------------------------------

    working =
        working
            .replace(/\s*##\s*/g, " ")
            .trim();


    // --------------------------------------------------
    // SHIPPING
    // --------------------------------------------------

    const shippingRegex =
        /(?:^|\s)(?:ส่ง|วิน)\s*\d+(?:\s|$)/i;


    const shippingMatch =
        working.match(
            shippingRegex
        );


    if (shippingMatch) {

        const start =
            shippingMatch.index ?? 0;


        const afterShippingIndex =
            start +
            shippingMatch[0].length;


        working =
            working
                .slice(afterShippingIndex)
                .trim();

    }


    // --------------------------------------------------
    // ADDRESS
    // --------------------------------------------------

    const addressIndex =
        findAddressStart(working);


    let namePart =
        working;


    let address =
        "";


    if (addressIndex > 0) {

        namePart =
            working
                .slice(0, addressIndex)
                .trim();


        address =
            working
                .slice(addressIndex)
                .trim();

    } else if (addressIndex === 0) {

        namePart = "";

        address =
            working;

    }


    // --------------------------------------------------
    // SECOND PHONE SEARCH
    // --------------------------------------------------

    if (!phone) {

        const secondPhone =
            extractPhone(
                namePart +
                " " +
                address
            );


        phone =
            secondPhone.phone;


        if (secondPhone.phone) {

            const cleaned =
                secondPhone.text;


            const secondAddressIndex =
                findAddressStart(
                    cleaned
                );


            if (secondAddressIndex > 0) {

                namePart =
                    cleaned
                        .slice(
                            0,
                            secondAddressIndex
                        )
                        .trim();


                address =
                    cleaned
                        .slice(
                            secondAddressIndex
                        )
                        .trim();

            } else {

                namePart =
                    cleaned;

            }

        }

    }


    // --------------------------------------------------
    // CLEAN NAME
    // --------------------------------------------------

    namePart =
        namePart
            .replace(
                /\s+(?:ส่ง|วิน)\s*\d+.*$/i,
                ""
            )
            .trim();


    namePart =
        namePart
            .replace(
                /^(?:ที่อยู่|ชื่อ)\s*:?\s*/i,
                ""
            )
            .trim();


    // --------------------------------------------------
    // NAME HEURISTIC
    // --------------------------------------------------

    const nameCandidates =
        namePart
            .split(/\s{2,}/)
            .map(
                value =>
                    value.trim()
            )
            .filter(Boolean);


    if (
        nameCandidates.length > 1
    ) {

        const possible =
            nameCandidates[
                nameCandidates.length - 1
            ];


        if (
            possible &&
            !/\d{2,}/.test(possible) &&
            possible.length >= 2
        ) {

            namePart =
                possible;

        }

    }


    namePart =
        cleanName(namePart);


    namePart =
        namePart
            .replace(
                /^(?:จัดส่ง|จัดส่งให้|ส่งให้)\s*/i,
                ""
            )
            .trim();


    // --------------------------------------------------
    // EMPTY
    // --------------------------------------------------

    if (
        !namePart &&
        !address &&
        !phone
    ) {

        return null;

    }


    const names =
        splitName(namePart);


    return {

        firstName:
            names.firstName,

        lastName:
            names.lastName,

        name:
            [
                names.firstName,
                names.lastName
            ]
                .filter(Boolean)
                .join(" "),

        phone,

        address,

        raw:
            rawBlock

    };

}


// ======================================================
// BULK PARSER
// ======================================================

function parseBulkCustomers(raw) {

    let text =
        String(raw || "")
            .replace(/\r/g, "")
            .trim();


    if (!text) {
        return [];
    }


    // --------------------------------------------------
    // REMOVE LIVE HEADER
    // --------------------------------------------------

    text =
        text.replace(
            /^ยอดไลฟ์[^\n]*\n?/i,
            ""
        );


    // --------------------------------------------------
    // REMOVE ## SEPARATOR
    // --------------------------------------------------

    text =
        text.replace(
            /^\s*##\s*$/gm,
            ""
        );


    // --------------------------------------------------
    // SPLIT BLOCKS
    // --------------------------------------------------

    const blocks =
        text
            .split(
                /\s*(?:-{3,}|—{3,}|–{3,}|_{3,})\s*/g
            )
            .map(
                value =>
                    value.trim()
            )
            .filter(Boolean);


    const result = [];


    for (const block of blocks) {

        const customer =
            extractCustomerFromBlock(
                block
            );


        if (!customer) {
            continue;
        }


        if (
            customer.name ||
            customer.phone ||
            customer.address
        ) {

            result.push(
                customer
            );

        }

    }


    return result;

}


// ======================================================
// FALLBACK PARSER
// ======================================================

function parseBulkCustomersFallback(raw) {

    const text =
        cleanPastedText(raw);


    const phoneMatches = [
        ...text.matchAll(
            /0\d[\d\s-]{8,12}\d/g
        )
    ];


    if (!phoneMatches.length) {

        const one =
            extractCustomerFromBlock(
                text
            );


        return one
            ? [one]
            : [];

    }


    return phoneMatches
        .map(
            (match, index) => {

                const phone =
                    normalizePhone(
                        match[0]
                    );


                const previous =
                    phoneMatches[
                        index - 1
                    ];


                const next =
                    phoneMatches[
                        index + 1
                    ];


                const start =
                    index === 0
                        ? 0
                        : (
                            previous.index +
                            previous[0].length
                        );


                const end =
                    index ===
                    phoneMatches.length - 1
                        ? text.length
                        : next.index;


                const section =
                    text
                        .slice(
                            start,
                            end
                        )
                        .trim();


                const customer =
                    extractCustomerFromBlock(
                        section
                    );


                if (!customer) {
                    return null;
                }


                return {

                    ...customer,

                    phone

                };

            }
        )
        .filter(Boolean);

}


// ======================================================
// RESPONSE NORMALIZER
// ======================================================

function extractCustomerList(response) {

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


function extractCustomerFromResponse(response) {

    return (
        response?.data?.customer ||
        response?.data?.data ||
        null
    );

}


// ======================================================
// COMPONENT
// ======================================================

function Customers() {

    // --------------------------------------------------
    // STATE
    // --------------------------------------------------

    const [
        customers,
        setCustomers
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        search,
        setSearch
    ] = useState("");


    const [
        showModal,
        setShowModal
    ] = useState(false);


    const [
        modalTab,
        setModalTab
    ] = useState("single");


    const [
        editingCustomer,
        setEditingCustomer
    ] = useState(null);


    const [
        bulkText,
        setBulkText
    ] = useState("");


    const [
        bulkReview,
        setBulkReview
    ] = useState([]);


    const [
        showReview,
        setShowReview
    ] = useState(false);


    const [
        form,
        setForm
    ] = useState(EMPTY_FORM);


    // ==================================================
    // LOAD CUSTOMERS
    // ==================================================

    async function loadCustomers() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    CUSTOMER_API
                );


            const list =
                extractCustomerList(
                    response
                );


            setCustomers(
                Array.isArray(list)
                    ? list
                    : []
            );

        } catch (err) {

            console.error(
                "Load Customers Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "ไม่สามารถโหลดข้อมูลลูกค้าได้"
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadCustomers();

    }, []);


    // ==================================================
    // SUMMARY
    // ==================================================

    const totalCustomers =
        customers.length;


    const withPhone =
        customers.filter(
            customer =>
                Boolean(
                    customer.phone
                )
        ).length;


    const withAddress =
        customers.filter(
            customer =>
                Boolean(
                    customer.address
                )
        ).length;


    // ==================================================
    // FILTER
    // ==================================================

    const filteredCustomers =
        useMemo(() => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();


            if (!keyword) {
                return customers;
            }


            return customers.filter(
                customer => {

                    const id =
                        String(
                            customer.customerCode ||
                            customer.code ||
                            customer.id ||
                            ""
                        )
                            .toLowerCase();


                    const name =
                        String(
                            customer.name ||
                            [
                                customer.firstName,
                                customer.lastName
                            ]
                                .filter(Boolean)
                                .join(" ") ||
                            ""
                        )
                            .toLowerCase();


                    const phone =
                        String(
                            customer.phone ||
                            ""
                        )
                            .toLowerCase();


                    const address =
                        String(
                            customer.address ||
                            ""
                        )
                            .toLowerCase();


                    return (

                        id.includes(keyword) ||

                        name.includes(keyword) ||

                        phone.includes(keyword) ||

                        address.includes(keyword)

                    );

                }
            );

        }, [
            customers,
            search
        ]);


    // ==================================================
    // RESET MODAL
    // ==================================================

    function resetModalState() {

        setEditingCustomer(null);

        setForm({
            ...EMPTY_FORM
        });

        setBulkText("");

        setBulkReview([]);

        setShowReview(false);

        setModalTab("single");

    }


    // ==================================================
    // OPEN ADD
    // ==================================================

    function openAddModal() {

        resetModalState();

        setError("");

        setShowModal(true);

    }


    // ==================================================
    // OPEN EDIT
    // ==================================================

    function openEditModal(customer) {

        const names =
            customer.name
                ? splitName(
                    customer.name
                )
                : {

                    firstName:
                        customer.firstName ||
                        "",

                    lastName:
                        customer.lastName ||
                        ""

                };


        setEditingCustomer(
            customer
        );


        setForm({

            firstName:
                names.firstName,

            lastName:
                names.lastName,

            phone:
                customer.phone || "",

            address:
                customer.address || ""

        });


        setModalTab("single");

        setShowReview(false);

        setError("");

        setShowModal(true);

    }


    // ==================================================
    // CLOSE
    // ==================================================

    function closeModal() {

        if (saving) {
            return;
        }


        setShowModal(false);

        resetModalState();

    }


    // ==================================================
    // FORM CHANGE
    // ==================================================

    function handleFormChange(e) {

        const {
            name,
            value
        } = e.target;


        setForm(prev => ({

            ...prev,

            [name]:
                value

        }));

    }


    // ==================================================
    // SAVE SINGLE CUSTOMER
    // ==================================================

    async function handleSaveCustomer(e) {

        e.preventDefault();


        const firstName =
            String(
                form.firstName || ""
            ).trim();


        const lastName =
            String(
                form.lastName || ""
            ).trim();


        const fullName =
            [
                firstName,
                lastName
            ]
                .filter(Boolean)
                .join(" ");


        if (!fullName) {

            alert(
                "กรุณากรอกชื่อและนามสกุล"
            );

            return;

        }


        if (
            form.phone &&
            !looksLikePhone(
                form.phone
            )
        ) {

            alert(
                "รูปแบบเบอร์โทรไม่ถูกต้อง"
            );

            return;

        }


        if (
            !String(
                form.address || ""
            ).trim()
        ) {

            alert(
                "กรุณากรอกที่อยู่"
            );

            return;

        }


        try {

            setSaving(true);

            setError("");


            const payload = {

                name:
                    fullName,

                phone:
                    normalizePhone(
                        form.phone
                    ) || null,

                address:
                    String(
                        form.address || ""
                    ).trim()

            };


            let response;


            if (editingCustomer) {

                response =
                    await api.put(
                        `${CUSTOMER_API}/${editingCustomer.id}`,
                        payload
                    );

            } else {

                response =
                    await api.post(
                        CUSTOMER_API,
                        payload
                    );

            }


            const savedCustomer =
                extractCustomerFromResponse(
                    response
                );


            if (savedCustomer) {

                if (editingCustomer) {

                    setCustomers(
                        prev =>
                            prev.map(
                                item =>
                                    item.id ===
                                    editingCustomer.id
                                        ? savedCustomer
                                        : item
                            )
                    );

                } else {

                    setCustomers(
                        prev => [

                            savedCustomer,

                            ...prev

                        ]
                    );

                }

            } else {

                await loadCustomers();

            }


            setShowModal(false);

            resetModalState();

        } catch (err) {

            console.error(
                "Save Customer Error:",
                err
            );


            const message =
                err.response?.data?.message ||
                "ไม่สามารถบันทึกข้อมูลลูกค้าได้";


            setError(message);

            alert(message);

        } finally {

            setSaving(false);

        }

    }


    // ==================================================
    // BULK PREVIEW
    // ==================================================

    function handleParseBulk() {

        if (!bulkText.trim()) {

            alert(
                "กรุณาวางข้อมูลลูกค้าก่อนครับ"
            );

            return;

        }


        let parsed =
            parseBulkCustomers(
                bulkText
            );


        if (
            parsed.length === 0
        ) {

            parsed =
                parseBulkCustomersFallback(
                    bulkText
                );

        }


        if (
            parsed.length === 0
        ) {

            alert(
                "ระบบยังแยกข้อมูลลูกค้าไม่เจอ ลองตรวจสอบรูปแบบข้อมูลอีกครั้งครับ"
            );

            return;

        }


        setBulkReview(

            parsed.map(
                (item, index) => ({

                    ...item,

                    tempId:
                        `temp-${Date.now()}-${index}`

                })
            )

        );


        setShowReview(true);

    }


    // ==================================================
    // REVIEW CHANGE
    // ==================================================

    function updateReviewItem(
        index,
        field,
        value
    ) {

        setBulkReview(prev => {

            const next =
                [...prev];


            if (!next[index]) {
                return prev;
            }


            next[index] = {

                ...next[index],

                [field]:
                    value

            };


            return next;

        });

    }


    // ==================================================
    // REMOVE REVIEW
    // ==================================================

    function removeReviewItem(index) {

        setBulkReview(
            prev =>
                prev.filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
        );

    }


    // ==================================================
    // SAVE BULK
    // ==================================================

    async function saveBulkCustomers() {

        if (
            bulkReview.length === 0
        ) {

            return;

        }


        try {

            setSaving(true);

            setError("");


            const createdCustomers = [];


            for (
                const item
                of bulkReview
            ) {

                const fullName =
                    [
                        item.firstName,
                        item.lastName
                    ]
                        .map(
                            value =>
                                String(
                                    value || ""
                                ).trim()
                        )
                        .filter(Boolean)
                        .join(" ")
                        .trim();


                if (!fullName) {
                    continue;
                }


                const address =
                    String(
                        item.address || ""
                    ).trim();


                if (!address) {
                    continue;
                }


                const payload = {

                    name:
                        fullName,

                    phone:
                        normalizePhone(
                            item.phone
                        ) || null,

                    address

                };


                try {

                    const response =
                        await api.post(
                            CUSTOMER_API,
                            payload
                        );


                    const created =
                        extractCustomerFromResponse(
                            response
                        );


                    if (created) {

                        createdCustomers.push(
                            created
                        );

                    }

                } catch (itemError) {

                    console.error(
                        "Bulk Customer Error:",
                        itemError
                    );

                }

            }


            if (
                createdCustomers.length > 0
            ) {

                setCustomers(
                    prev => [

                        ...createdCustomers,

                        ...prev

                    ]
                );

            } else {

                await loadCustomers();

            }


            setBulkReview([]);

            setShowReview(false);

            setBulkText("");

            setShowModal(false);

            resetModalState();

        } catch (err) {

            console.error(
                "Bulk Save Error:",
                err
            );


            const message =
                err.response?.data?.message ||
                "ไม่สามารถเพิ่มลูกค้าหลายรายการได้";


            setError(message);

        } finally {

            setSaving(false);

        }

    }


    // ==================================================
    // DELETE
    // ==================================================

    async function handleDelete(customer) {

        const name =
            customer.name ||
            [
                customer.firstName,
                customer.lastName
            ]
                .filter(Boolean)
                .join(" ") ||
            "ลูกค้ารายนี้";


        const confirmed =
            window.confirm(
                `ต้องการลบ "${name}" หรือไม่?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `${CUSTOMER_API}/${customer.id}`
            );


            setCustomers(
                prev =>
                    prev.filter(
                        item =>
                            item.id !==
                            customer.id
                    )
            );

        } catch (err) {

            console.error(
                "Delete Customer Error:",
                err
            );


            alert(
                err.response?.data?.message ||
                "ไม่สามารถลบลูกค้าได้"
            );

        }

    }


    // ==================================================
    // ESC
    // ==================================================

    useEffect(() => {

        function handleEscape(e) {

            if (
                e.key === "Escape" &&
                showModal &&
                !saving
            ) {

                closeModal();

            }

        }


        window.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            window.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [
        showModal,
        saving
    ]);


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="customers-page">


            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div className="customers-background">

                <span className="customer-sparkle sparkle-1">
                    ✦
                </span>

                <span className="customer-sparkle sparkle-2">
                    ✧
                </span>

                <span className="customer-sparkle sparkle-3">
                    ⋆
                </span>

                <span className="customer-sparkle sparkle-4">
                    ✦
                </span>


                <div className="customer-cloud cloud-1">

                    <span className="cloud-bubble bubble-a" />
                    <span className="cloud-bubble bubble-b" />
                    <span className="cloud-bubble bubble-c" />
                    <span className="cloud-base" />

                </div>


                <div className="customer-cloud cloud-2">

                    <span className="cloud-bubble bubble-a" />
                    <span className="cloud-bubble bubble-b" />
                    <span className="cloud-bubble bubble-c" />
                    <span className="cloud-base" />

                </div>


                <div className="customer-tree tree-left">

                    <div className="tree-crown crown-one" />
                    <div className="tree-crown crown-two" />
                    <div className="tree-trunk" />

                </div>


                <div className="customer-tree tree-right">

                    <div className="tree-crown crown-one" />
                    <div className="tree-crown crown-two" />
                    <div className="tree-trunk" />

                </div>

            </div>


            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="customers-container">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="customers-header">

                    <div className="customers-title-area">

                        <div className="customers-title-icon">

                            <Users size={28} />

                        </div>


                        <div>

                            <div className="customers-title-line">

                                <h1>
                                    ลูกค้าของฉัน
                                </h1>

                                <span>
                                    ✨
                                </span>

                            </div>


                            <p>
                                จัดการข้อมูลลูกค้า
                                ชื่อ ที่อยู่ และเบอร์โทร
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="customers-add-button"
                        onClick={
                            openAddModal
                        }
                    >

                        <span className="button-icon">

                            <Plus size={20} />

                        </span>

                        <span>
                            เพิ่มลูกค้า
                        </span>

                    </button>

                </header>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="customers-error">

                        <AlertCircle size={17} />

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >

                            <X size={16} />

                        </button>

                    </div>

                )}


                {/* ==================================================
                    SUMMARY
                ================================================== */}

                <div className="customers-summary">

                    <CustomerSummary
                        icon={
                            <Users size={23} />
                        }
                        title="ลูกค้าทั้งหมด"
                        value={
                            totalCustomers
                        }
                        suffix=" คน"
                        variant="pink"
                    />


                    <CustomerSummary
                        icon={
                            <Phone size={23} />
                        }
                        title="มีเบอร์โทร"
                        value={
                            withPhone
                        }
                        suffix=" คน"
                        variant="purple"
                    />


                    <CustomerSummary
                        icon={
                            <MapPin size={23} />
                        }
                        title="มีที่อยู่"
                        value={
                            withAddress
                        }
                        suffix=" คน"
                        variant="yellow"
                    />


                    <CustomerSummary
                        icon={
                            <Sparkles size={23} />
                        }
                        title="พร้อมใช้งาน"
                        value={
                            totalCustomers
                        }
                        suffix=" รายการ"
                        variant="green"
                    />

                </div>


                {/* ==================================================
                    MAIN CARD
                ================================================== */}

                <section className="customers-content">


                    {/* ==================================================
                        TOOLBAR
                    ================================================== */}

                    <div className="customers-toolbar">

                        <div className="customers-section-title">

                            <div className="section-title-icon">

                                <UserRound size={19} />

                            </div>


                            <div>

                                <strong>
                                    รายชื่อลูกค้า
                                </strong>

                                <span>
                                    ข้อมูลทั้งหมดของลูกค้าในระบบ
                                </span>

                            </div>

                        </div>


                        <div className="customers-search">

                            <Search size={19} />

                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ เบอร์โทร หรือรหัสลูกค้า..."
                                value={
                                    search
                                }
                                onChange={e =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />


                            {search && (

                                <button
                                    type="button"
                                    className="clear-search"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >

                                    <X size={16} />

                                </button>

                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        TABLE
                    ================================================== */}

                    <div className="customers-table-wrapper">

                        {loading ? (

                            <div className="customers-loading">

                                <div className="loading-character">
                                    🧸
                                </div>

                                <strong>
                                    กำลังโหลดลูกค้า...
                                </strong>

                                <span>
                                    แป๊บเดียวนะ ✨
                                </span>

                            </div>

                        ) : (

                            <table className="customers-table">

                                <thead>

                                    <tr>

                                        <th>
                                            รหัสลูกค้า
                                        </th>

                                        <th>
                                            ลูกค้า
                                        </th>

                                        <th>
                                            เบอร์โทร
                                        </th>

                                        <th>
                                            ที่อยู่
                                        </th>

                                        <th>
                                            เพิ่มเมื่อ
                                        </th>

                                        <th />

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredCustomers.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="customers-empty"
                                            >

                                                <div className="empty-state">

                                                    <div className="empty-bubble">
                                                        🧸
                                                    </div>

                                                    <h3>
                                                        ยังไม่มีข้อมูลลูกค้า
                                                    </h3>

                                                    <p>
                                                        เพิ่มลูกค้าคนแรกกันนะ ✨
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            openAddModal
                                                        }
                                                    >

                                                        <Plus size={17} />

                                                        เพิ่มลูกค้า

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredCustomers.map(
                                            customer => {

                                                const customerName =
                                                    customer.name ||
                                                    [
                                                        customer.firstName,
                                                        customer.lastName
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ") ||
                                                    "-";


                                                const customerCode =
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


                                                return (

                                                    <tr
                                                        key={
                                                            customer.id
                                                        }
                                                    >

                                                        {/* CODE */}

                                                        <td>

                                                            <div className="customer-code">

                                                                <Hash
                                                                    size={14}
                                                                />

                                                                <span>
                                                                    {
                                                                        customerCode
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* NAME */}

                                                        <td>

                                                            <div className="customer-name">

                                                                <div className="customer-avatar">

                                                                    <UserRound
                                                                        size={18}
                                                                    />

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            customerName
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        ลูกค้า
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* PHONE */}

                                                        <td>

                                                            {customer.phone ? (

                                                                <div className="customer-phone">

                                                                    <span className="phone-icon">

                                                                        <Phone
                                                                            size={14}
                                                                        />

                                                                    </span>

                                                                    <span>
                                                                        {
                                                                            customer.phone
                                                                        }
                                                                    </span>

                                                                </div>

                                                            ) : (

                                                                <span className="empty-value">
                                                                    ไม่ได้ระบุ
                                                                </span>

                                                            )}

                                                        </td>


                                                        {/* ADDRESS */}

                                                        <td>

                                                            <div className="customer-address">

                                                                <MapPin
                                                                    size={15}
                                                                />

                                                                <span>

                                                                    {
                                                                        customer.address ||
                                                                        "ไม่ได้ระบุที่อยู่"
                                                                    }

                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* DATE */}

                                                        <td>

                                                            <span className="customer-date">

                                                                {formatDate(
                                                                    customer.createdAt
                                                                )}

                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td>

                                                            <div className="customer-actions">

                                                                <button
                                                                    type="button"
                                                                    className="customer-action-edit"
                                                                    title="แก้ไข"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            customer
                                                                        )
                                                                    }
                                                                >

                                                                    <Pencil
                                                                        size={16}
                                                                    />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="customer-action-delete"
                                                                    title="ลบ"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            customer
                                                                        )
                                                                    }
                                                                >

                                                                    <Trash2
                                                                        size={16}
                                                                    />

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )

                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>


                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    {!loading &&
                        filteredCustomers.length > 0 && (

                            <div className="customers-footer">

                                <span>

                                    แสดง{" "}

                                    <strong>
                                        {
                                            filteredCustomers.length
                                        }
                                    </strong>{" "}

                                    จาก{" "}

                                    <strong>
                                        {
                                            customers.length
                                        }
                                    </strong>{" "}

                                    รายการ

                                </span>


                                <span>
                                    ✨ ข้อมูลลูกค้าของคุณ
                                </span>

                            </div>

                        )}

                </section>

            </div>


            {/* ==================================================
                MODAL
            ================================================== */}

            {showModal && (

                <div
                    className="customer-modal-overlay"
                    onMouseDown={e => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div
                        className="customer-modal"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >


                        {/* ==================================================
                            DECOR
                        ================================================== */}

                        <div className="modal-cloud modal-cloud-one">
                            ☁
                        </div>

                        <div className="modal-cloud modal-cloud-two">
                            ☁
                        </div>

                        <div className="modal-sparkle modal-sparkle-one">
                            ✦
                        </div>

                        <div className="modal-sparkle modal-sparkle-two">
                            ✧
                        </div>


                        {/* ==================================================
                            CLOSE
                        ================================================== */}

                        <button
                            type="button"
                            className="customer-modal-close"
                            onClick={
                                closeModal
                            }
                            disabled={
                                saving
                            }
                        >

                            <X size={19} />

                        </button>


                        {/* ==================================================
                            HEADER
                        ================================================== */}

                        <div className="customer-modal-header">

                            <div className="customer-modal-icon">

                                <Users size={27} />

                                <span>
                                    ✨
                                </span>

                            </div>


                            <div>

                                <h2>
                                    {editingCustomer
                                        ? "แก้ไขข้อมูลลูกค้า"
                                        : "เพิ่มลูกค้า"}
                                </h2>

                                <p>
                                    เก็บข้อมูลลูกค้าไว้ให้เป็นระเบียบ
                                    น่ารัก ๆ กัน 🧸
                                </p>

                            </div>

                        </div>


                        {/* ==================================================
                            TABS
                        ================================================== */}

                        {!editingCustomer && (

                            <div className="customer-modal-tabs">

                                <button
                                    type="button"
                                    className={
                                        modalTab === "single"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setModalTab(
                                            "single"
                                        )
                                    }
                                >

                                    <UserPlus size={18} />

                                    <span>
                                        เพิ่มทีละคน
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    className={
                                        modalTab === "bulk"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setModalTab(
                                            "bulk"
                                        )
                                    }
                                >

                                    <ClipboardList
                                        size={18}
                                    />

                                    <span>
                                        เพิ่มหลายคน
                                    </span>

                                </button>

                            </div>

                        )}


                        {/* ==================================================
                            SINGLE FORM
                        ================================================== */}

                        {modalTab === "single" && (

                            <form
                                className="customer-form"
                                onSubmit={
                                    handleSaveCustomer
                                }
                            >

                                <div className="customer-form-row">

                                    <div className="customer-form-group">

                                        <label>

                                            <UserRound size={15} />

                                            ชื่อ

                                        </label>

                                        <input
                                            name="firstName"
                                            value={
                                                form.firstName
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="เช่น อริสสา"
                                            autoFocus
                                        />

                                    </div>


                                    <div className="customer-form-group">

                                        <label>
                                            นามสกุล
                                        </label>

                                        <input
                                            name="lastName"
                                            value={
                                                form.lastName
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="เช่น สุขชม"
                                        />

                                    </div>

                                </div>


                                <div className="customer-form-group">

                                    <label>

                                        <Phone size={15} />

                                        เบอร์โทร

                                        <small>
                                            ถ้ามี
                                        </small>

                                    </label>

                                    <input
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="เช่น 0824460808"
                                        inputMode="tel"
                                    />

                                </div>


                                <div className="customer-form-group">

                                    <label>

                                        <MapPin size={15} />

                                        ที่อยู่

                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            form.address
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="บ้านเลขที่ หมู่บ้าน ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                                        rows="5"
                                    />

                                </div>


                                {!editingCustomer && (

                                    <div className="customer-form-hint">

                                        <span>
                                            💡
                                        </span>

                                        <p>
                                            ระบบจะสร้างรหัสลูกค้าให้อัตโนมัติ
                                            ชื่อเหมือนกันก็ไม่เป็นไร
                                            เพราะแต่ละคนมีรหัสของตัวเอง
                                        </p>

                                    </div>

                                )}


                                <div className="customer-modal-actions">

                                    <button
                                        type="button"
                                        className="customer-cancel-button"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        ยกเลิก
                                    </button>


                                    <button
                                        type="submit"
                                        className="customer-save-button"
                                        disabled={
                                            saving
                                        }
                                    >

                                        {saving ? (

                                            <>

                                                <span className="customer-spinner" />

                                                กำลังบันทึก...

                                            </>

                                        ) : (

                                            <>

                                                <Check size={19} />

                                                {editingCustomer
                                                    ? "บันทึกการแก้ไข"
                                                    : "เพิ่มลูกค้า"}

                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        )}


                        {/* ==================================================
                            BULK
                        ================================================== */}

                        {modalTab === "bulk" && (

                            <div className="bulk-customer-area">

                                {!showReview ? (

                                    <>

                                        <div className="bulk-intro">

                                            <div className="bulk-intro-icon">

                                                <Upload size={21} />

                                            </div>


                                            <div>

                                                <strong>
                                                    โยนข้อมูลทั้งก้อนมาได้เลย
                                                </strong>

                                                <p>
                                                    ระบบจะพยายามแยกชื่อ
                                                    เบอร์โทร และที่อยู่ให้อัตโนมัติ
                                                </p>

                                            </div>

                                        </div>


                                        <textarea
                                            className="bulk-customer-input"
                                            value={
                                                bulkText
                                            }
                                            onChange={e =>
                                                setBulkText(
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
`ตัวอย่าง

คัพเค้กคิระ (750) พี่แก้ม ส่ง 50
อริสสา สุขชม [082-4460808] 31 ม.2 ต.บ้านนา อ.บ้านนา จ.นครนายก 26110
-----
ปังฉีก 390 เฟิน ส่ง 60
นิว 0872084100 344/8 ม.5 ต.บ้านสวน อ.เมือง จ.ชลบุรี`
                                            }
                                        />


                                        <div className="bulk-parser-note">

                                            <Sparkles
                                                size={16}
                                            />

                                            <span>
                                                หลังแยกแล้วระบบจะให้ตรวจสอบ
                                                ก่อนบันทึกจริงทุกครั้ง
                                            </span>

                                        </div>


                                        <div className="customer-modal-actions">

                                            <button
                                                type="button"
                                                className="customer-cancel-button"
                                                onClick={
                                                    closeModal
                                                }
                                            >
                                                ยกเลิก
                                            </button>


                                            <button
                                                type="button"
                                                className="customer-save-button"
                                                onClick={
                                                    handleParseBulk
                                                }
                                            >

                                                <Sparkles
                                                    size={19}
                                                />

                                                แยกข้อมูลให้เลย

                                            </button>

                                        </div>

                                    </>

                                ) : (

                                    <>

                                        <div className="bulk-review-header">

                                            <div>

                                                <strong>
                                                    ตรวจสอบข้อมูลก่อนบันทึก
                                                </strong>

                                                <span>
                                                    พบ {bulkReview.length} รายการ
                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowReview(
                                                        false
                                                    )
                                                }
                                            >
                                                ← กลับไปแก้ข้อความ
                                            </button>

                                        </div>


                                        <div className="bulk-review-list">

                                            {bulkReview.map(
                                                (item, index) => (

                                                    <div
                                                        className="bulk-review-item"
                                                        key={
                                                            item.tempId ||
                                                            index
                                                        }
                                                    >

                                                        <div className="bulk-review-item-head">

                                                            <div>

                                                                <span className="review-number">
                                                                    {index + 1}
                                                                </span>

                                                                <strong>
                                                                    ลูกค้ารายที่{" "}
                                                                    {index + 1}
                                                                </strong>

                                                            </div>


                                                            <button
                                                                type="button"
                                                                className="review-remove"
                                                                onClick={() =>
                                                                    removeReviewItem(
                                                                        index
                                                                    )
                                                                }
                                                            >

                                                                <Trash2
                                                                    size={15}
                                                                />

                                                                เอาออก

                                                            </button>

                                                        </div>


                                                        <div className="bulk-review-grid">


                                                            <div className="customer-form-group">

                                                                <label>
                                                                    ชื่อ
                                                                </label>

                                                                <input
                                                                    value={
                                                                        item.firstName ||
                                                                        ""
                                                                    }
                                                                    onChange={e =>
                                                                        updateReviewItem(
                                                                            index,
                                                                            "firstName",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                            </div>


                                                            <div className="customer-form-group">

                                                                <label>
                                                                    นามสกุล
                                                                </label>

                                                                <input
                                                                    value={
                                                                        item.lastName ||
                                                                        ""
                                                                    }
                                                                    onChange={e =>
                                                                        updateReviewItem(
                                                                            index,
                                                                            "lastName",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                            </div>


                                                            <div className="customer-form-group">

                                                                <label>
                                                                    เบอร์โทร
                                                                </label>

                                                                <input
                                                                    value={
                                                                        item.phone ||
                                                                        ""
                                                                    }
                                                                    onChange={e =>
                                                                        updateReviewItem(
                                                                            index,
                                                                            "phone",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    inputMode="tel"
                                                                />

                                                            </div>


                                                            <div className="customer-form-group bulk-address-group">

                                                                <label>
                                                                    ที่อยู่
                                                                </label>

                                                                <textarea
                                                                    rows="3"
                                                                    value={
                                                                        item.address ||
                                                                        ""
                                                                    }
                                                                    onChange={e =>
                                                                        updateReviewItem(
                                                                            index,
                                                                            "address",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                            </div>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>


                                        <div className="customer-modal-actions">

                                            <button
                                                type="button"
                                                className="customer-cancel-button"
                                                onClick={
                                                    closeModal
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                ยกเลิก
                                            </button>


                                            <button
                                                type="button"
                                                className="customer-save-button"
                                                onClick={
                                                    saveBulkCustomers
                                                }
                                                disabled={
                                                    saving ||
                                                    bulkReview.length === 0
                                                }
                                            >

                                                {saving ? (

                                                    <>

                                                        <span className="customer-spinner" />

                                                        กำลังบันทึก...

                                                    </>

                                                ) : (

                                                    <>

                                                        <Check size={19} />

                                                        ยืนยันเพิ่ม{" "}
                                                        {bulkReview.length} คน

                                                    </>

                                                )}

                                            </button>

                                        </div>

                                    </>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}


// ======================================================
// SUMMARY CARD
// ======================================================

function CustomerSummary({
    icon,
    title,
    value,
    suffix,
    variant
}) {

    return (

        <div
            className={
                `customer-summary-card summary-${variant}`
            }
        >

            <div className="customer-summary-icon">

                {icon}

            </div>


            <div>

                <p>
                    {title}
                </p>

                <h2>

                    {value}

                    {suffix}

                </h2>

            </div>


            <span>
                ✦
            </span>

        </div>

    );

}


export default Customers;
