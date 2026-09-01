import React, { useEffect, useMemo, useState } from 'react'
import {
    Package,
    Plus,
    Search,
    RefreshCw,
    X,
    ShoppingBag,
    Ban,
    Trash2,
    Pencil,
    DollarSign,
    TrendingUp,
    Boxes
} from 'lucide-react'

import axios from '../api/axios'
import '../styles/Stock.css'

const Stock = () => {
    // ======================================================
    // STATE
    // ======================================================

    const [stocks, setStocks] = useState([])
    const [summary, setSummary] = useState({
        totalItems: 0,
        available: 0,
        sold: 0,
        cancelled: 0,
        availableCostValue: 0,
        soldCostValue: 0,
        salesValue: 0,
        profit: 0
    })

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')

    // ADD / EDIT
    const [showForm, setShowForm] = useState(false)
    const [editingStock, setEditingStock] = useState(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        name: '',
        description: '',
        costPrice: '',
        quantity: '1',
        purchaseDate: '',
        note: ''
    })

    // SELL
    const [sellingStock, setSellingStock] = useState(null)
    const [sellQuantity, setSellQuantity] = useState('1')
    const [sellPrice, setSellPrice] = useState('')
    const [selling, setSelling] = useState(false)

    // BULK SELECT
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [bulkBusy, setBulkBusy] = useState(false)

    // ======================================================
    // FORMAT
    // ======================================================

    const money = (value) => {
        return Number(value || 0).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const number = (value) => {
        return Number(value || 0).toLocaleString('th-TH')
    }

    const formatDate = (value) => {
        if (!value) return '-'

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return '-'
        }

        return date.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const getStatus = (stock) => {
        return String(stock?.status || '').toUpperCase()
    }

    const getQuantity = (stock) => {
        const value = Number(stock?.quantity ?? 0)

        return Number.isFinite(value)
            ? Math.max(0, value)
            : 0
    }

    const getOriginalQuantity = (stock) => {
        const value = Number(
            stock?.originalQuantity ??
            stock?.quantity ??
            0
        )

        return Number.isFinite(value)
            ? Math.max(0, value)
            : 0
    }

    const getCostPrice = (stock) => {
        const value = Number(
            stock?.costPrice ?? 0
        )

        return Number.isFinite(value)
            ? Math.max(0, value)
            : 0
    }

    const getSalePrice = (stock) => {
        if (
            stock?.actualSalePrice === null ||
            stock?.actualSalePrice === undefined ||
            stock?.actualSalePrice === ''
        ) {
            return null
        }

        const value = Number(
            stock.actualSalePrice
        )

        return Number.isFinite(value)
            ? Math.max(0, value)
            : null
    }

    const getProfit = (stock) => {
        if (
            stock?.profit !== null &&
            stock?.profit !== undefined
        ) {
            const value = Number(stock.profit)

            return Number.isFinite(value)
                ? value
                : 0
        }

        const salePrice = getSalePrice(stock)

        if (salePrice === null) {
            return null
        }

        const quantity =
            getOriginalQuantity(stock)

        const cost =
            getCostPrice(stock)

        return (
            salePrice - cost
        ) * quantity
    }

    const statusLabel = (value) => {
        switch (
            String(value || '').toUpperCase()
        ) {
            case 'AVAILABLE':
                return 'พร้อมขาย'

            case 'SOLD':
                return 'ขายแล้ว'

            case 'CANCELLED':
                return 'ยกเลิก'

            default:
                return value || '-'
        }
    }

    // ======================================================
    // LOAD STOCK
    // ======================================================

    const fetchStock = async ({
        silent = false
    } = {}) => {
        try {
            if (!silent) {
                setLoading(true)
            } else {
                setRefreshing(true)
            }

            setError('')

            const params = {}

            if (status) {
                params.status = status
            }

            if (search.trim()) {
                params.search = search.trim()
            }

            const response = await axios.get(
                '/stock',
                { params }
            )

            const data =
                response.data?.stock ??
                response.data?.products ??
                response.data ??
                []

            setStocks(
                Array.isArray(data)
                    ? data
                    : []
            )
        } catch (err) {
            console.error(
                'fetchStock error:',
                err
            )

            setError(
                err.response?.data?.message ||
                'ไม่สามารถโหลดข้อมูล Stock ได้'
            )
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // ======================================================
    // LOAD SUMMARY
    // ======================================================

    const fetchSummary = async () => {
        try {
            const response = await axios.get(
                '/stock/summary'
            )

            setSummary({
                totalItems:
                    response.data?.totalItems ?? 0,

                available:
                    response.data?.available ?? 0,

                sold:
                    response.data?.sold ?? 0,

                cancelled:
                    response.data?.cancelled ?? 0,

                availableCostValue:
                    response.data?.availableCostValue ?? 0,

                soldCostValue:
                    response.data?.soldCostValue ?? 0,

                salesValue:
                    response.data?.salesValue ?? 0,

                profit:
                    response.data?.profit ?? 0
            })
        } catch (err) {
            console.error(
                'fetchSummary error:',
                err
            )
        }
    }

    const refreshAll = async () => {
        await Promise.all([
            fetchStock({ silent: true }),
            fetchSummary()
        ])
    }

    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {
        fetchStock()
        fetchSummary()
    }, [])

    // ======================================================
    // SEARCH / FILTER
    // ======================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStock()
        }, 300)

        return () => {
            clearTimeout(timer)
        }
    }, [search, status])

    // ======================================================
    // FILTERED STOCK
    // ======================================================

    const filteredStocks = useMemo(() => {
        const keyword =
            search.trim().toLowerCase()

        return stocks.filter(stock => {
            if (
                status &&
                getStatus(stock) !==
                    status
            ) {
                return false
            }

            if (!keyword) {
                return true
            }

            const name =
                String(
                    stock?.name || ''
                ).toLowerCase()

            const description =
                String(
                    stock?.description || ''
                ).toLowerCase()

            const note =
                String(
                    stock?.note || ''
                ).toLowerCase()

            const owner =
                String(
                    stock?.owner?.name || ''
                ).toLowerCase()

            return (
                name.includes(keyword) ||
                description.includes(keyword) ||
                note.includes(keyword) ||
                owner.includes(keyword)
            )
        })
    }, [
        stocks,
        search,
        status
    ])

    // ======================================================
    // FORM
    // ======================================================

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            costPrice: '',
            quantity: '1',
            purchaseDate: '',
            note: ''
        })
    }

    const openCreate = () => {
        setEditingStock(null)
        resetForm()
        setShowForm(true)
    }

    const openEdit = (stock) => {
        setEditingStock(stock)

        setForm({
            name:
                stock?.name ?? '',

            description:
                stock?.description ?? '',

            costPrice:
                stock?.costPrice ?? '',

            quantity:
                String(
                    stock?.quantity ?? 1
                ),

            purchaseDate:
                stock?.purchaseDate
                    ? String(
                        stock.purchaseDate
                    ).slice(0, 10)
                    : '',

            note:
                stock?.note ?? ''
        })

        setShowForm(true)
    }

    const closeForm = () => {
        if (saving) return

        setShowForm(false)
        setEditingStock(null)
        resetForm()
    }

    const handleFormChange = (e) => {
        const {
            name,
            value
        } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // ======================================================
    // SAVE STOCK
    // ======================================================

    const validateForm = () => {
        const name =
            form.name.trim()

        const costPrice =
            Number(form.costPrice)

        const quantity =
            Number(form.quantity)

        if (!name) {
            alert(
                'กรุณาระบุชื่อสินค้า'
            )
            return false
        }

        if (
            form.costPrice === '' ||
            !Number.isFinite(
                costPrice
            ) ||
            costPrice < 0
        ) {
            alert(
                'กรุณาระบุราคาทุนที่ถูกต้อง'
            )
            return false
        }

        if (
            form.quantity === '' ||
            !Number.isInteger(
                quantity
            ) ||
            quantity < 1
        ) {
            alert(
                'กรุณาระบุจำนวนสินค้าเป็นจำนวนเต็มอย่างน้อย 1 ชิ้น'
            )
            return false
        }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (saving) return

        if (!validateForm()) {
            return
        }

        try {
            setSaving(true)
            setError('')

            const data = {
                name:
                    form.name.trim(),

                description:
                    form.description.trim() ||
                    null,

                costPrice:
                    Number(
                        form.costPrice
                    ),

                quantity:
                    Number(
                        form.quantity
                    ),

                purchaseDate:
                    form.purchaseDate ||
                    undefined,

                note:
                    form.note.trim() ||
                    null
            }

            if (editingStock) {
                await axios.put(
                    `/stock/${editingStock.id}`,
                    data
                )

                alert(
                    'แก้ไขข้อมูลสินค้าสำเร็จ'
                )
            } else {
                const response =
                    await axios.post(
                        '/stock',
                        data
                    )

                if (
                    response.data?.action ===
                    'MERGED'
                ) {
                    const mergedQuantity =
                        Number(
                            response.data
                                ?.stock
                                ?.quantity ??
                            data.quantity
                        )

                    alert(
                        `เพิ่มสินค้า ${data.quantity} ชิ้นเข้ารายการเดิมสำเร็จ\nจำนวนรวม ${mergedQuantity} ชิ้น`
                    )
                } else {
                    alert(
                        `เพิ่มสินค้า ${data.quantity} ชิ้นสำเร็จ`
                    )
                }
            }

            closeForm()

            await refreshAll()
        } catch (err) {
            console.error(
                'handleSubmit error:',
                err
            )

            const statusCode =
                err.response?.status

            if (statusCode === 409) {
                alert(
                    err.response?.data?.message ||
                    'ไม่สามารถเพิ่มสินค้าได้ เนื่องจากข้อมูลซ้ำ'
                )
            } else {
                alert(
                    err.response?.data?.message ||
                    'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                )
            }
        } finally {
            setSaving(false)
        }
    }

    // ======================================================
    // SELL MODAL
    // ======================================================

    const openSell = (stock) => {
        if (
            getStatus(stock) !==
            'AVAILABLE'
        ) {
            alert(
                'สินค้านี้ไม่สามารถขายได้'
            )
            return
        }

        const available =
            getQuantity(stock)

        if (available <= 0) {
            alert(
                'สินค้านี้หมดสต็อกแล้ว'
            )
            return
        }

        setSellingStock(stock)
        setSellQuantity('1')

        const existingPrice =
            getSalePrice(stock)

        setSellPrice(
            existingPrice !== null
                ? String(
                    existingPrice
                )
                : ''
        )
    }

    const closeSell = () => {
        if (selling) return

        setSellingStock(null)
        setSellQuantity('1')
        setSellPrice('')
    }

    const confirmSell = async (e) => {
        e.preventDefault()

        if (
            !sellingStock ||
            selling
        ) {
            return
        }

        const available =
            getQuantity(
                sellingStock
            )

        const quantity =
            Number(
                sellQuantity
            )

        const price =
            Number(
                sellPrice
            )

        if (
            !Number.isInteger(
                quantity
            ) ||
            quantity < 1
        ) {
            alert(
                'กรุณาระบุจำนวนสินค้าที่ขายให้ถูกต้อง'
            )
            return
        }

        if (
            quantity > available
        ) {
            alert(
                `มีสินค้าเหลือเพียง ${number(
                    available
                )} ชิ้น`
            )
            return
        }

        if (
            sellPrice === '' ||
            !Number.isFinite(
                price
            ) ||
            price < 0
        ) {
            alert(
                'กรุณาระบุราคาขายจริงที่ถูกต้อง'
            )
            return
        }

        const remaining =
            available - quantity

        const confirmed =
            window.confirm(
                `ยืนยันขาย "${sellingStock.name}" ${quantity} ชิ้น\nราคาขาย ${money(price)} บาท/ชิ้น\n\nเหลือใน Stock ${remaining} ชิ้น`
            )

        if (!confirmed) {
            return
        }

        try {
            setSelling(true)
            setError('')

            /*
             * ใช้ API และ field ตาม Stock.jsx เดิม
             *
             * IMPORTANT:
             * SOLD = quantity 0
             */

            const payload = {
                quantity:
                    remaining,

                actualSalePrice:
                    price,

                status:
                    remaining <= 0
                        ? 'SOLD'
                        : 'AVAILABLE',

                ...(remaining <= 0
                    ? {
                        soldAt:
                            new Date()
                                .toISOString()
                    }
                    : {})
            }

            await axios.put(
                `/stock/${sellingStock.id}`,
                payload
            )

            alert(
                `บันทึกการขายสำเร็จ ${quantity} ชิ้น`
            )

            closeSell()

            await refreshAll()
        } catch (err) {
            console.error(
                'confirmSell error:',
                err
            )

            alert(
                err.response?.data?.message ||
                'ไม่สามารถบันทึกการขายได้'
            )
        } finally {
            setSelling(false)
        }
    }

    // ======================================================
    // CANCEL
    // ======================================================

    const cancelStock = async (stock) => {
        const quantity =
            getQuantity(stock)

        const confirmed =
            window.confirm(
                `ต้องการยกเลิกสินค้า "${stock.name}" จำนวน ${quantity} ชิ้น ใช่หรือไม่?`
            )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await axios.put(
                `/stock/${stock.id}`,
                {
                    status:
                        'CANCELLED'
                }
            )

            alert(
                'ยกเลิกสินค้าสำเร็จ'
            )

            await refreshAll()
        } catch (err) {
            console.error(
                'cancelStock error:',
                err
            )

            alert(
                err.response?.data?.message ||
                'ไม่สามารถยกเลิกสินค้าได้'
            )
        }
    }

    // ======================================================
    // DELETE
    // ======================================================

    const removeStock = async (stock) => {
        const confirmed =
            window.confirm(
                `ต้องการลบ "${stock.name}" หรือไม่?\n\nการลบข้อมูลไม่สามารถย้อนกลับได้`
            )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await axios.delete(
                `/stock/${stock.id}`
            )

            setStocks(prev =>
                prev.filter(
                    item =>
                        item.id !==
                        stock.id
                )
            )

            setSelectedIds(prev => {
                const next =
                    new Set(prev)

                next.delete(
                    stock.id
                )

                return next
            })

            await fetchSummary()
        } catch (err) {
            console.error(
                'removeStock error:',
                err
            )

            alert(
                err.response?.data?.message ||
                'ไม่สามารถลบสินค้าได้'
            )
        }
    }

    // ======================================================
    // BULK SELECT
    // ======================================================

    const selectableIds =
        filteredStocks
            .filter(
                stock =>
                    getStatus(stock) ===
                    'AVAILABLE'
            )
            .map(
                stock =>
                    stock.id
            )

    const allSelected =
        selectableIds.length > 0 &&
        selectableIds.every(
            id =>
                selectedIds.has(id)
        )

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next =
                new Set(prev)

            if (
                next.has(id)
            ) {
                next.delete(id)
            } else {
                next.add(id)
            }

            return next
        })
    }

    const toggleSelectAll = () => {
        setSelectedIds(prev => {
            const next =
                new Set(prev)

            if (allSelected) {
                selectableIds.forEach(
                    id =>
                        next.delete(id)
                )
            } else {
                selectableIds.forEach(
                    id =>
                        next.add(id)
                )
            }

            return next
        })
    }

    const clearSelection = () => {
        setSelectedIds(
            new Set()
        )
    }

    // ======================================================
    // BULK CANCEL
    // ======================================================

    const bulkCancel = async () => {
        if (
            selectedIds.size === 0 ||
            bulkBusy
        ) {
            return
        }

        const ids =
            Array.from(
                selectedIds
            )

        const confirmed =
            window.confirm(
                `ต้องการยกเลิก ${ids.length} รายการที่เลือกหรือไม่?`
            )

        if (!confirmed) {
            return
        }

        try {
            setBulkBusy(true)
            setError('')

            for (
                const id of ids
            ) {
                await axios.put(
                    `/stock/${id}`,
                    {
                        status:
                            'CANCELLED'
                    }
                )
            }

            clearSelection()

            await refreshAll()

            alert(
                `ยกเลิก ${ids.length} รายการสำเร็จ`
            )
        } catch (err) {
            console.error(
                'bulkCancel error:',
                err
            )

            alert(
                err.response?.data?.message ||
                'ยกเลิกสินค้าแบบกลุ่มไม่สำเร็จ'
            )

            await refreshAll()
        } finally {
            setBulkBusy(false)
        }
    }

    // ======================================================
    // BULK DELETE
    // ======================================================

    const bulkDelete = async () => {
        if (
            selectedIds.size === 0 ||
            bulkBusy
        ) {
            return
        }

        const ids =
            Array.from(
                selectedIds
            )

        const confirmed =
            window.confirm(
                `ต้องการลบ ${ids.length} รายการที่เลือกหรือไม่?\n\nการลบข้อมูลไม่สามารถย้อนกลับได้`
            )

        if (!confirmed) {
            return
        }

        try {
            setBulkBusy(true)
            setError('')

            const deletedIds = []

            for (
                const id of ids
            ) {
                try {
                    await axios.delete(
                        `/stock/${id}`
                    )

                    deletedIds.push(id)
                } catch (err) {
                    console.error(
                        `delete stock ${id} error:`,
                        err
                    )
                }
            }

            if (
                deletedIds.length > 0
            ) {
                setStocks(prev =>
                    prev.filter(
                        stock =>
                            !deletedIds.includes(
                                stock.id
                            )
                    )
                )
            }

            clearSelection()

            await fetchSummary()

            if (
                deletedIds.length !==
                ids.length
            ) {
                alert(
                    `ลบสำเร็จ ${deletedIds.length} รายการ จาก ${ids.length} รายการ`
                )
            } else {
                alert(
                    `ลบ ${deletedIds.length} รายการสำเร็จ`
                )
            }
        } catch (err) {
            console.error(
                'bulkDelete error:',
                err
            )

            alert(
                err.response?.data?.message ||
                'ลบสินค้าแบบกลุ่มไม่สำเร็จ'
            )

            await refreshAll()
        } finally {
            setBulkBusy(false)
        }
    }

    // ======================================================
    // CLEAN SELECTION
    // ======================================================

    useEffect(() => {
        setSelectedIds(prev => {
            const validIds =
                new Set(
                    stocks
                        .filter(
                            stock =>
                                getStatus(
                                    stock
                                ) ===
                                'AVAILABLE'
                        )
                        .map(
                            stock =>
                                stock.id
                        )
                )

            const next =
                new Set(
                    Array.from(
                        prev
                    ).filter(
                        id =>
                            validIds.has(
                                id
                            )
                    )
                )

            if (
                next.size ===
                prev.size
            ) {
                return prev
            }

            return next
        })
    }, [stocks])

    // ======================================================
    // ESC
    // ======================================================

    useEffect(() => {
        const handleEscape = (e) => {
            if (
                e.key !==
                'Escape'
            ) {
                return
            }

            if (
                showForm &&
                !saving
            ) {
                closeForm()
            }

            if (
                sellingStock &&
                !selling
            ) {
                closeSell()
            }
        }

        window.addEventListener(
            'keydown',
            handleEscape
        )

        return () => {
            window.removeEventListener(
                'keydown',
                handleEscape
            )
        }
    }, [
        showForm,
        saving,
        sellingStock,
        selling
    ])

    // ======================================================
    // RENDER
    // ======================================================

    return (
        <div className="stock-page">

            {/* HEADER */}

            <div className="stock-header">

                <div className="stock-title">

                    <div className="stock-title-icon">
                        <Package size={28} />
                    </div>

                    <div>
                        <h1>
                            Stock
                        </h1>

                        <p>
                            จัดการสินค้า จำนวน ราคาทุน และราคาขาย
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="stock-btn stock-btn-primary"
                    onClick={openCreate}
                >
                    <Plus size={18} />
                    เพิ่มสินค้า
                </button>

            </div>

            {/* SUMMARY */}

            <div className="stock-summary">

                <SummaryCard
                    icon={<Boxes size={22} />}
                    title="สินค้าทั้งหมด"
                    value={number(
                        summary.totalItems
                    )}
                    suffix=" ชิ้น"
                />

                <SummaryCard
                    icon={<Package size={22} />}
                    title="พร้อมขาย"
                    value={number(
                        summary.available
                    )}
                    suffix=" ชิ้น"
                />

                <SummaryCard
                    icon={<ShoppingBag size={22} />}
                    title="ขายแล้ว"
                    value={number(
                        summary.sold
                    )}
                    suffix=" ชิ้น"
                />

                <SummaryCard
                    icon={<Ban size={22} />}
                    title="ยกเลิก"
                    value={number(
                        summary.cancelled
                    )}
                    suffix=" ชิ้น"
                />

                <SummaryCard
                    icon={<DollarSign size={22} />}
                    title="ยอดขาย"
                    value={`฿${money(
                        summary.salesValue
                    )}`}
                />

                <SummaryCard
                    icon={<TrendingUp size={22} />}
                    title="กำไร"
                    value={`฿${money(
                        summary.profit
                    )}`}
                    variant="profit"
                />

            </div>

            {/* FILTER */}

            <div className="stock-filter">

                <div className="stock-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="ค้นหาชื่อสินค้า..."
                        value={search}
                        onChange={e =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch('')
                            }
                            aria-label="ล้างการค้นหา"
                        >
                            <X size={16} />
                        </button>
                    )}

                </div>

                <select
                    value={status}
                    onChange={e =>
                        setStatus(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        ทุกสถานะ
                    </option>

                    <option value="AVAILABLE">
                        พร้อมขาย
                    </option>

                    <option value="SOLD">
                        ขายแล้ว
                    </option>

                    <option value="CANCELLED">
                        ยกเลิก
                    </option>
                </select>

                <button
                    type="button"
                    className="stock-refresh"
                    onClick={refreshAll}
                    disabled={
                        loading ||
                        refreshing
                    }
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading ||
                            refreshing
                                ? 'stock-spin'
                                : ''
                        }
                    />

                    รีเฟรช
                </button>

            </div>

            {/* BULK TOOLBAR */}

            {selectedIds.size > 0 && (
                <div className="stock-bulk-toolbar">

                    <div>
                        เลือกอยู่{' '}
                        <strong>
                            {selectedIds.size}
                        </strong>{' '}
                        รายการ
                    </div>

                    <div className="stock-bulk-actions">

                        <button
                            type="button"
                            className="stock-action-cancel"
                            onClick={bulkCancel}
                            disabled={
                                bulkBusy
                            }
                        >
                            <Ban size={15} />
                            ยกเลิกที่เลือก
                        </button>

                        <button
                            type="button"
                            className="stock-action-delete"
                            onClick={bulkDelete}
                            disabled={
                                bulkBusy
                            }
                        >
                            <Trash2 size={15} />
                            ลบที่เลือก
                        </button>

                        <button
                            type="button"
                            className="stock-action-clear"
                            onClick={
                                clearSelection
                            }
                            disabled={
                                bulkBusy
                            }
                        >
                            ล้างการเลือก
                        </button>

                    </div>

                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="stock-error">

                    <span>
                        ⚠️ {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                    >
                        <X size={16} />
                    </button>

                </div>
            )}

            {/* TABLE */}

            <div className="stock-table-wrapper">

                {loading ? (

                    <div className="stock-loading">
                        <RefreshCw
                            size={20}
                            className="stock-spin"
                        />
                        กำลังโหลดข้อมูล...
                    </div>

                ) : filteredStocks.length === 0 ? (

                    <div className="stock-empty">

                        <Package size={42} />

                        <strong>
                            ไม่พบสินค้า
                        </strong>

                        <span>
                            ลองเปลี่ยนคำค้นหาหรือสถานะ
                        </span>

                    </div>

                ) : (

                    <table className="stock-table">

                        <thead>

                            <tr>

                                <th className="stock-check-column">
                                    <input
                                        type="checkbox"
                                        checked={
                                            allSelected
                                        }
                                        onChange={
                                            toggleSelectAll
                                        }
                                        disabled={
                                            selectableIds.length === 0
                                        }
                                    />
                                </th>

                                <th>
                                    ID
                                </th>

                                <th>
                                    สินค้า
                                </th>

                                <th>
                                    Owner
                                </th>

                                <th>
                                    จำนวน
                                </th>

                                <th>
                                    ราคาทุน/ชิ้น
                                </th>

                                <th>
                                    ต้นทุนรวม
                                </th>

                                <th>
                                    ราคาขายจริง
                                </th>

                                <th>
                                    กำไร
                                </th>

                                <th>
                                    สถานะ
                                </th>

                                <th>
                                    วันที่ซื้อ
                                </th>

                                <th>
                                    วันที่ขาย
                                </th>

                                <th>
                                    จัดการ
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredStocks.map(
                                stock => {

                                    const quantity =
                                        getQuantity(
                                            stock
                                        )

                                    const costPrice =
                                        getCostPrice(
                                            stock
                                        )

                                    const salePrice =
                                        getSalePrice(
                                            stock
                                        )

                                    const totalCost =
                                        costPrice *
                                        quantity

                                    const profit =
                                        getProfit(
                                            stock
                                        )

                                    const stockStatus =
                                        getStatus(
                                            stock
                                        )

                                    const canSelect =
                                        stockStatus ===
                                        'AVAILABLE'

                                    return (
                                        <tr
                                            key={
                                                stock.id
                                            }
                                        >

                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedIds.has(
                                                            stock.id
                                                        )
                                                    }
                                                    disabled={
                                                        !canSelect
                                                    }
                                                    onChange={() =>
                                                        toggleSelect(
                                                            stock.id
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <span className="stock-id">
                                                    #{stock.id}
                                                </span>
                                            </td>

                                            <td>

                                                <div className="stock-product-name">
                                                    {stock.name ||
                                                        '-'}
                                                </div>

                                                {stock.description && (
                                                    <small>
                                                        {
                                                            stock.description
                                                        }
                                                    </small>
                                                )}

                                                {stock.note && (
                                                    <small className="stock-note">
                                                        📝{' '}
                                                        {
                                                            stock.note
                                                        }
                                                    </small>
                                                )}

                                            </td>

                                            <td>
                                                {
                                                    stock.owner
                                                        ?.name ||
                                                    '-'
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {number(
                                                        quantity
                                                    )}
                                                </strong>{' '}
                                                ชิ้น
                                            </td>

                                            <td>
                                                ฿
                                                {money(
                                                    costPrice
                                                )}
                                            </td>

                                            <td>
                                                ฿
                                                {money(
                                                    totalCost
                                                )}
                                            </td>

                                            <td>
                                                {salePrice !==
                                                null
                                                    ? `฿${money(
                                                        salePrice
                                                    )}`
                                                    : '-'}
                                            </td>

                                            <td>
                                                {profit !==
                                                null
                                                    ? `฿${money(
                                                        profit
                                                    )}`
                                                    : '-'}
                                            </td>

                                            <td>
                                                <span
                                                    className={`stock-status stock-status-${stockStatus.toLowerCase()}`}
                                                >
                                                    {statusLabel(
                                                        stockStatus
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    stock.purchaseDate
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    stock.soldAt
                                                )}
                                            </td>

                                            <td>

                                                <div className="stock-actions">

                                                    {stockStatus ===
                                                        'AVAILABLE' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="stock-action-sell"
                                                                onClick={() =>
                                                                    openSell(
                                                                        stock
                                                                    )
                                                                }
                                                            >
                                                                <ShoppingBag
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                                ขาย
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="stock-action-edit"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        stock
                                                                    )
                                                                }
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                                แก้ไข
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="stock-action-cancel"
                                                                onClick={() =>
                                                                    cancelStock(
                                                                        stock
                                                                    )
                                                                }
                                                            >
                                                                <Ban
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                                ยกเลิก
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="stock-action-delete"
                                                        onClick={() =>
                                                            removeStock(
                                                                stock
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        ลบ
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                }
                            )}

                        </tbody>

                    </table>
                )}

            </div>

            {/* FOOTER */}

            {!loading &&
                filteredStocks.length > 0 && (
                    <div className="stock-footer">

                        <span>
                            แสดง{' '}
                            <strong>
                                {
                                    filteredStocks.length
                                }
                            </strong>{' '}
                            รายการ
                        </span>

                        <span>
                            รวม{' '}
                            <strong>
                                {number(
                                    filteredStocks.reduce(
                                        (
                                            total,
                                            stock
                                        ) =>
                                            total +
                                            getQuantity(
                                                stock
                                            ),
                                        0
                                    )
                                )}
                            </strong>{' '}
                            ชิ้น
                        </span>

                    </div>
                )}

            {/* ======================================================
                ADD / EDIT MODAL
            ====================================================== */}

            {showForm && (
                <div
                    className="stock-modal"
                    onMouseDown={e => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeForm()
                        }
                    }}
                >

                    <div
                        className="stock-modal-content"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className="stock-modal-header">

                            <div>
                                <h2>
                                    {editingStock
                                        ? 'แก้ไขสินค้า'
                                        : 'เพิ่มสินค้าเข้าสต็อก'}
                                </h2>

                                <p>
                                    กรอกข้อมูลสินค้าให้ครบถ้วน
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="stock-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <label>
                                ชื่อสินค้า

                                <input
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="เช่น Jelly Bear"
                                    required
                                />
                            </label>

                            <label>
                                รายละเอียด

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="รายละเอียดสินค้า (ถ้ามี)"
                                    rows="3"
                                />
                            </label>

                            <div className="stock-form-row">

                                <label>
                                    ราคาทุน / ชิ้น

                                    <input
                                        name="costPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            form.costPrice
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                </label>

                                <label>
                                    จำนวน

                                    <input
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                            form.quantity
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                    <small>
                                        จำนวนสินค้าที่นำเข้าสต็อก
                                    </small>
                                </label>

                            </div>

                            <label>
                                วันที่ซื้อ / นำเข้าสินค้า

                                <input
                                    name="purchaseDate"
                                    type="date"
                                    value={
                                        form.purchaseDate
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                />
                            </label>

                            <label>
                                หมายเหตุ

                                <textarea
                                    name="note"
                                    value={
                                        form.note
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="หมายเหตุ (ถ้ามี)"
                                    rows="3"
                                />
                            </label>

                            {form.costPrice !==
                                '' &&
                                form.quantity !==
                                    '' && (
                                    <div className="stock-form-preview">

                                        <span>
                                            ต้นทุนรวม
                                        </span>

                                        <strong>
                                            ฿
                                            {money(
                                                Number(
                                                    form.costPrice
                                                ) *
                                                Number(
                                                    form.quantity
                                                )
                                            )}
                                        </strong>

                                    </div>
                                )}

                            {!editingStock && (
                                <div className="stock-form-hint">

                                    <span>
                                        💡
                                    </span>

                                    <p>
                                        หากมีสินค้า
                                        <strong>
                                            ชื่อเดียวกันและราคาทุนเท่ากัน
                                        </strong>
                                        ระบบจะเพิ่มจำนวนเข้า Stock รายการเดิมอัตโนมัติ
                                        <br />
                                        หากชื่อเหมือนกันแต่ราคาทุนต่างกัน ระบบจะสร้าง Stock Lot ใหม่
                                    </p>

                                </div>
                            )}

                            <div className="stock-form-actions">

                                <button
                                    type="button"
                                    className="stock-btn stock-btn-secondary"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    type="submit"
                                    className="stock-btn stock-btn-primary"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? 'กำลังบันทึก...'
                                        : editingStock
                                            ? 'บันทึกการแก้ไข'
                                            : 'เพิ่มสินค้า'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* ======================================================
                SELL MODAL
            ====================================================== */}

            {sellingStock && (
                <div
                    className="stock-modal"
                    onMouseDown={e => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeSell()
                        }
                    }}
                >

                    <div
                        className="stock-modal-content stock-sell-modal"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className="stock-modal-header">

                            <div>
                                <h2>
                                    ขายสินค้า
                                </h2>

                                <p>
                                    {sellingStock.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeSell
                                }
                                disabled={
                                    selling
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="stock-form"
                            onSubmit={
                                confirmSell
                            }
                        >

                            <div className="stock-sell-info">

                                <div>
                                    <span>
                                        มีสินค้า
                                    </span>

                                    <strong>
                                        {number(
                                            getQuantity(
                                                sellingStock
                                            )
                                        )}{' '}
                                        ชิ้น
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        ราคาทุน
                                    </span>

                                    <strong>
                                        ฿
                                        {money(
                                            getCostPrice(
                                                sellingStock
                                            )
                                        )}
                                        /ชิ้น
                                    </strong>
                                </div>

                            </div>

                            <label>
                                จำนวนที่ขาย

                                <input
                                    type="number"
                                    min="1"
                                    max={getQuantity(
                                        sellingStock
                                    )}
                                    step="1"
                                    value={
                                        sellQuantity
                                    }
                                    onChange={e =>
                                        setSellQuantity(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </label>

                            <label>
                                ราคาขายจริง / ชิ้น

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        sellPrice
                                    }
                                    onChange={e =>
                                        setSellPrice(
                                            e.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    required
                                />
                            </label>

                            {sellQuantity !==
                                '' &&
                                sellPrice !==
                                    '' && (
                                    <div className="stock-form-preview">

                                        <span>
                                            ยอดขายครั้งนี้
                                        </span>

                                        <strong>
                                            ฿
                                            {money(
                                                Number(
                                                    sellQuantity
                                                ) *
                                                Number(
                                                    sellPrice
                                                )
                                            )}
                                        </strong>

                                    </div>
                                )}

                            <div className="stock-form-actions">

                                <button
                                    type="button"
                                    className="stock-btn stock-btn-secondary"
                                    onClick={
                                        closeSell
                                    }
                                    disabled={
                                        selling
                                    }
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    type="submit"
                                    className="stock-btn stock-btn-primary"
                                    disabled={
                                        selling
                                    }
                                >
                                    {selling
                                        ? 'กำลังบันทึก...'
                                        : 'ยืนยันการขาย'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    )
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
    icon,
    title,
    value,
    suffix = '',
    variant = ''
}) {
    return (
        <div
            className={`stock-summary-card ${
                variant
                    ? `stock-summary-${variant}`
                    : ''
            }`}
        >

            <div className="stock-summary-icon">
                {icon}
            </div>

            <div>
                <span>
                    {title}
                </span>

                <strong>
                    {value}
                    {suffix}
                </strong>
            </div>

        </div>
    )
}

export default Stock