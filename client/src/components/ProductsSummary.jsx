import React from "react"

import {
    Package,
    ShoppingBag,
    Wallet,
    TrendingUp
} from "lucide-react"

import "../styles/ProductsSummary.css"


// ======================================================
// PRODUCTS SUMMARY
// ======================================================

function ProductsSummary({

    totalStockItems = 0,

    soldProductsCount = 0,

    stockValue = 0,

    totalProfit = 0,

    number = value => value,

    money = value => value

}) {

    return (

        <section className="products-summary">

            <SummaryCard
                icon={
                    <Package size={23} />
                }
                title="สินค้าในสต็อก"
                value={
                    number(
                        totalStockItems
                    )
                }
                suffix=" ชิ้น"
                variant="pink"
            />


            <SummaryCard
                icon={
                    <ShoppingBag size={23} />
                }
                title="ขายไปแล้ว"
                value={
                    number(
                        soldProductsCount
                    )
                }
                suffix=" รายการ"
                variant="purple"
            />


            <SummaryCard
                icon={
                    <Wallet size={23} />
                }
                title="มูลค่าสต็อก"
                value={
                    `฿${money(
                        stockValue
                    )}`
                }
                variant="yellow"
            />


            <SummaryCard
                icon={
                    <TrendingUp size={23} />
                }
                title="กำไรจากการขาย"
                value={
                    `฿${money(
                        totalProfit
                    )}`
                }
                variant="green"
            />

        </section>
    )
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({

    icon,

    title,

    value,

    suffix,

    variant

}) {

    return (

        <div
            className={
                `summary-card summary-card-${variant}`
            }
        >

            <div className="summary-card-icon">

                {icon}

            </div>


            <div className="summary-card-content">

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


export default ProductsSummary