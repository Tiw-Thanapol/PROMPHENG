// ======================================================
// ORDER HELPERS
// ======================================================
// Helper Functions ที่ใช้ใน Orders / Accounting
//
// หน้าที่:
// - แปลงค่าตัวเลข
// - จัดรูปแบบจำนวนเงิน
// - จัดรูปแบบวันที่ / เวลา
// - คำนวณช่วงเวลา
// - ตรวจสอบวันที่ในช่วง
// - รองรับ timezone Asia/Bangkok
// - Escape HTML สำหรับ Print / Export
//
// ไม่มี React
// ไม่มี API
// ไม่มี State
// ======================================================


// ======================================================
// CONSTANTS
// ======================================================

export const BANGKOK_TIMEZONE =
    "Asia/Bangkok";


// ======================================================
// NUMBER
// ======================================================

export function num(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const n =
        Number(value);


    return Number.isFinite(n)
        ? n
        : 0;

}


// ======================================================
// POSITIVE NUMBER
// ======================================================

export function positiveNum(value) {

    return Math.max(
        0,
        num(value)
    );

}


// ======================================================
// MONEY
// ======================================================

export function money(value) {

    return num(value).toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// ======================================================
// MONEY WITH CURRENCY
// ======================================================

export function moneyTHB(value) {

    return `฿${money(value)}`;

}


// ======================================================
// FORMAT DATE
// ======================================================

export function formatDate(date) {

    if (!date) {
        return "-";
    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "-";

    }


    return d.toLocaleDateString(
        "th-TH",
        {
            timeZone:
                BANGKOK_TIMEZONE,

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    );

}


// ======================================================
// FORMAT DATE + TIME
// ======================================================

export function formatDateTime(date) {

    if (!date) {
        return "-";
    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "-";

    }


    return d.toLocaleString(
        "th-TH",
        {
            timeZone:
                BANGKOK_TIMEZONE,

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


// ======================================================
// FORMAT TIME
// ======================================================

export function formatTime(date) {

    if (!date) {
        return "-";
    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "-";

    }


    return d.toLocaleTimeString(
        "th-TH",
        {
            timeZone:
                BANGKOK_TIMEZONE,

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


// ======================================================
// GET VALID DATE
// ======================================================

export function toDate(value) {

    if (!value) {
        return null;
    }


    const date =
        value instanceof Date
            ? new Date(value)
            : new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// ======================================================
// START OF DAY
// ======================================================

export function getStartOfDay(
    date = new Date()
) {

    const d =
        new Date(date);


    d.setHours(
        0,
        0,
        0,
        0
    );


    return d;

}


// ======================================================
// END OF DAY
// ======================================================

export function getEndOfDay(
    date = new Date()
) {

    const d =
        new Date(date);


    d.setHours(
        23,
        59,
        59,
        999
    );


    return d;

}


// ======================================================
// GET MONDAY
// ======================================================
// คืนค่าวันจันทร์ของสัปดาห์ปัจจุบัน
//
// Sunday    = 0
// Monday    = 1
// Tuesday   = 2
// Wednesday = 3
// Thursday  = 4
// Friday    = 5
// Saturday  = 6
// ======================================================

export function getMonday(
    date = new Date()
) {

    const d =
        getStartOfDay(date);


    const day =
        d.getDay();


    const diff =
        day === 0
            ? -6
            : 1 - day;


    d.setDate(
        d.getDate() + diff
    );


    return d;

}


// ======================================================
// GET SUNDAY
// ======================================================

export function getSunday(
    date = new Date()
) {

    const monday =
        getMonday(date);


    const sunday =
        new Date(monday);


    sunday.setDate(
        sunday.getDate() + 6
    );


    return getEndOfDay(
        sunday
    );

}


// ======================================================
// GET PERIOD RANGE
// ======================================================
//
// รองรับ:
//
// TODAY
// WEEK
// MONTH
// YEAR
//
// ผลลัพธ์:
//
// {
//     start: Date,
//     end: Date
// }
//
// ======================================================

export function getPeriodRange(
    period
) {

    const now =
        new Date();


    let start;
    let end;


    switch (period) {


        // ----------------------------------------------
        // TODAY
        // ----------------------------------------------

        case "TODAY":

            start =
                getStartOfDay(
                    now
                );

            end =
                getEndOfDay(
                    now
                );

            break;


        // ----------------------------------------------
        // THIS WEEK
        // ----------------------------------------------

        case "WEEK":

            start =
                getMonday(
                    now
                );

            end =
                getEndOfDay(
                    now
                );

            break;


        // ----------------------------------------------
        // THIS MONTH
        // ----------------------------------------------

        case "MONTH":

            start =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1,
                    0,
                    0,
                    0,
                    0
                );


            end =
                new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                    23,
                    59,
                    59,
                    999
                );

            break;


        // ----------------------------------------------
        // THIS YEAR
        // ----------------------------------------------

        case "YEAR":

            start =
                new Date(
                    now.getFullYear(),
                    0,
                    1,
                    0,
                    0,
                    0,
                    0
                );


            end =
                new Date(
                    now.getFullYear(),
                    11,
                    31,
                    23,
                    59,
                    59,
                    999
                );

            break;


        // ----------------------------------------------
        // DEFAULT
        // ----------------------------------------------

        default:

            start =
                getStartOfDay(
                    now
                );

            end =
                getEndOfDay(
                    now
                );

            break;

    }


    return {
        start,
        end
    };

}


// ======================================================
// GET CUSTOM PERIOD RANGE
// ======================================================
//
// ใช้สำหรับช่วงวันที่ที่ User เลือกเอง
//
// startDate = "2026-08-01"
// endDate   = "2026-08-27"
//
// ครอบคลุม:
//
// 00:00:00.000
// ถึง
// 23:59:59.999
//
// ======================================================

export function getCustomPeriodRange(
    startDate,
    endDate
) {

    if (
        !startDate ||
        !endDate
    ) {

        return null;

    }


    const startDateObject =
        new Date(startDate);


    const endDateObject =
        new Date(endDate);


    if (
        Number.isNaN(
            startDateObject.getTime()
        ) ||
        Number.isNaN(
            endDateObject.getTime()
        )
    ) {

        return null;

    }


    const start =
        getStartOfDay(
            startDateObject
        );


    const end =
        getEndOfDay(
            endDateObject
        );


    return {
        start,
        end
    };

}


// ======================================================
// DATE IN RANGE
// ======================================================

export function dateInRange(
    date,
    start,
    end
) {

    if (
        !date ||
        !start ||
        !end
    ) {

        return false;

    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return false;

    }


    return (
        d >= start &&
        d <= end
    );

}


// ======================================================
// GET PERIOD LABEL
// ======================================================

export function getPeriodLabel(
    period
) {

    switch (period) {

        case "TODAY":

            return "Today";


        case "WEEK":

            return "This Week";


        case "MONTH":

            return "This Month";


        case "YEAR":

            return "This Year";


        case "CUSTOM":

            return "Custom Range";


        default:

            return "Today";

    }

}


// ======================================================
// GET ORDER DATE
// ======================================================
// รองรับชื่อ field หลายรูปแบบ
//
// ใช้ createdAt เป็นหลัก
// ======================================================

export function getOrderDate(order) {

    if (!order) {
        return null;
    }


    return (
        order.soldAt ||
        order.saleDate ||
        order.createdAt ||
        order.updatedAt ||
        null
    );

}


// ======================================================
// GET ORDER TOTAL
// ======================================================

export function getOrderTotal(order) {

    if (!order) {
        return 0;
    }


    return num(
        order.totalAmount ??
        order.total ??
        order.grandTotal ??
        0
    );

}


// ======================================================
// GET ORDER SHIPPING CHARGED
// ======================================================
// ค่าส่งที่เรียกเก็บจากลูกค้า
//
// สำคัญ:
// shippingCharged = รายรับจากค่าส่ง
// shippingActual  = ต้นทุนค่าส่งจริง
//
// ไม่ควรใช้ shippingCost เป็น source of truth
// ======================================================

export function getShippingCharged(order) {

    if (!order) {
        return 0;
    }


    return positiveNum(
        order.shippingCharged ??
        order.shipping ??
        order.shippingFee ??
        0
    );

}


// ======================================================
// GET ORDER SHIPPING ACTUAL
// ======================================================
// ค่าส่งจริงที่ธุรกิจจ่าย
//
// ใช้เป็น "ต้นทุน" ของการขาย
// ======================================================

export function getShippingActual(order) {

    if (!order) {
        return 0;
    }


    return positiveNum(
        order.shippingActual ??
        order.actualShipping ??
        order.shippingCostActual ??
        0
    );

}


// ======================================================
// GET ORDER DISCOUNT
// ======================================================

export function getOrderDiscount(order) {

    if (!order) {
        return 0;
    }


    return positiveNum(
        order.discount ??
        order.discountAmount ??
        0
    );

}


// ======================================================
// GET ITEM QUANTITY
// ======================================================

export function getItemQuantity(item) {

    if (!item) {
        return 0;
    }


    return positiveNum(
        item.quantity
    );

}


// ======================================================
// GET ITEM COST PRICE AT SALE
// ======================================================
// ใช้ costPriceAtSale เป็นหลัก
//
// เนื่องจากต้นทุนต้องเป็นต้นทุน ณ เวลาที่ขาย
// ไม่ควรย้อนกลับไปใช้ costPrice ปัจจุบัน
// หาก SaleItem มี costPriceAtSale แล้ว
// ======================================================

export function getItemCostPriceAtSale(
    item
) {

    if (!item) {
        return 0;
    }


    return positiveNum(
        item.costPriceAtSale ??
        item.consignmentItem?.costPrice ??
        item.costPrice ??
        0
    );

}


// ======================================================
// GET ITEM SALE PRICE
// ======================================================

export function getItemSalePrice(item) {

    if (!item) {
        return 0;
    }


    return num(
        item.salePrice ??
        item.actualSalePrice ??
        item.sellingPrice ??
        0
    );

}


// ======================================================
// GET ITEM PRODUCT COST
// ======================================================
// ต้นทุนสินค้าของ SaleItem
//
// productCost
// = costPriceAtSale × quantity
// ======================================================

export function getItemProductCost(item) {

    const quantity =
        getItemQuantity(
            item
        );


    const costPrice =
        getItemCostPriceAtSale(
            item
        );


    return (
        costPrice *
        quantity
    );

}


// ======================================================
// GET ITEM REVENUE
// ======================================================
// รายรับของ SaleItem
//
// saleRevenue
// = salePrice × quantity
// ======================================================

export function getItemRevenue(item) {

    const quantity =
        getItemQuantity(
            item
        );


    const salePrice =
        getItemSalePrice(
            item
        );


    return (
        salePrice *
        quantity
    );

}


// ======================================================
// GET SALE PRODUCT COST
// ======================================================

export function getOrderProductCost(
    order
) {

    if (
        !order ||
        !Array.isArray(
            order.items
        )
    ) {

        return 0;

    }


    return order.items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getItemProductCost(
                    item
                )
            );

        },
        0
    );

}


// ======================================================
// GET SALE ITEM REVENUE
// ======================================================

export function getOrderItemRevenue(
    order
) {

    if (
        !order ||
        !Array.isArray(
            order.items
        )
    ) {

        return 0;

    }


    return order.items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getItemRevenue(
                    item
                )
            );

        },
        0
    );

}


// ======================================================
// GET SALE TOTAL COST
// ======================================================
// ต้นทุนการขายทั้งหมด
//
// = ต้นทุนสินค้า
// + ค่าส่งจริง
// + ค่าใช้จ่ายอื่นๆ
//
// หมายเหตุ:
// ค่าใช้จ่ายอื่นของ Sale สามารถมาจาก
// order.expenses / order.otherExpenses
// หากไม่มี จะเป็น 0
// ======================================================

export function getOrderTotalCost(
    order
) {

    if (!order) {
        return 0;
    }


    const productCost =
        getOrderProductCost(
            order
        );


    const shippingActual =
        getShippingActual(
            order
        );


    const otherExpenses =
        positiveNum(
            order.otherExpenses ??
            order.otherExpense ??
            order.expenseAmount ??
            order.expensesAmount ??
            0
        );


    return (
        productCost +
        shippingActual +
        otherExpenses
    );

}


// ======================================================
// GET ORDER GROSS PROFIT
// ======================================================
// กำไรจากการขาย
//
// = ราคาขายจริง
// - ต้นทุนการขายทั้งหมด
//
// ต้นทุนการขายทั้งหมด:
// product cost
// + shipping actual
// + other expenses
//
// สามารถติดลบได้
// ======================================================

export function getOrderGrossProfit(
    order
) {

    if (!order) {
        return 0;
    }


    const revenue =
        getOrderTotal(
            order
        );


    const totalCost =
        getOrderTotalCost(
            order
        );


    return (
        revenue -
        totalCost
    );

}


// ======================================================
// GET ORDER NET PROFIT
// ======================================================
// สำหรับกรณีมีค่าใช้จ่ายระดับระบบเพิ่มเติม
//
// โดยปกติ Orders จะใช้ gross profit
// เป็นกำไรของการขาย
//
// หากมี extra expense เพิ่มเติม
// จะถูกหักออกอีกชั้น
// ======================================================

export function getOrderNetProfit(
    order
) {

    if (!order) {
        return 0;
    }


    const grossProfit =
        getOrderGrossProfit(
            order
        );


    const expense =
        positiveNum(
            order.expense ??
            order.expenses ??
            0
        );


    return (
        grossProfit -
        expense
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

export function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// SAFE ARRAY
// ======================================================

export function safeArray(
    value
) {

    return Array.isArray(value)
        ? value
        : [];

}


// ======================================================
// SAFE STRING
// ======================================================

export function safeString(
    value,
    fallback = ""
) {

    if (
        value === null ||
        value === undefined
    ) {

        return fallback;

    }


    const result =
        String(value).trim();


    return result || fallback;

}